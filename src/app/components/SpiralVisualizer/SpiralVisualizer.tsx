import type { FC } from 'react';
import { useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import { useTheme } from "@/app/contexts/ThemeContext";
import { useLanguage } from "@/app/contexts/LanguageContext";
import type { MoodEntry, HabitEntry } from "@/app/lib/storage";
import { format } from "date-fns";
import { zhCN, enUS } from "date-fns/locale";

interface SpiralVisualizerProps {
  moods: MoodEntry[];
  habitEntries: HabitEntry[];
  days?: number;
}

const SpiralVisualizer: FC<SpiralVisualizerProps> = ({ moods, habitEntries, days = 30 }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();
  const { language, t } = useLanguage();
  const locale = language === 'zh' ? zhCN : enUS;

  // Process data into a daily map for efficient lookup
  const dailyData = useMemo(() => {
    const data = new Map();
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = d3.timeDay.offset(now, - (days - 1 - i));
      const dStr = format(d, 'yyyy-MM-dd');
      const mood = moods.find(m => m.date === dStr);
      const habits = habitEntries.filter(h => h.date === dStr && h.completed).length;
      data.set(i, { date: dStr, mood: mood?.mood || 0, habits });
    }
    return data;
  }, [moods, habitEntries, days]);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = 500;
    const height = 500;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Clear previous elements
    const svgElement = d3.select(svgRef.current);
    svgElement.selectAll("*").remove();

    const svg = svgElement
      .attr("viewBox", `0 0 ${width} ${height}`)
      .attr("preserveAspectRatio", "xMidYMid meet");

    const defs = svg.append("defs");

    // 1. Glow Filter
    const glow = defs.append("filter").attr("id", "glow").attr("x", "-50%").attr("y", "-50%").attr("width", "200%").attr("height", "200%");
    glow.append("feGaussianBlur").attr("stdDeviation", "2.5").attr("result", "blur");
    const feMerge = glow.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "blur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // 2. Spiral Math
    const numTurns = 3.5;
    const rScale = d3.scaleLinear().domain([0, days]).range([50, 230]);
    const angleScale = d3.scaleLinear().domain([0, days]).range([0, numTurns * Math.PI * 2]);

    const spiralLine = d3.lineRadial<number>()
      .curve(d3.curveBasis)
      .angle(d => angleScale(d))
      .radius(d => rScale(d));

    // 3. Draw Background Path
    svg.append("path")
      .datum(d3.range(days))
      .attr("d", spiralLine)
      .attr("transform", `translate(${centerX}, ${centerY})`)
      .attr("fill", "none")
      .attr("stroke", theme === 'ocean' ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)")
      .attr("stroke-width", 12)
      .attr("stroke-linecap", "round");

    // 4. Color Function
    const getMoodColor = (score: number) => {
        if (score === 0) return theme === 'ocean' ? "#334155" : "#e2e8f0";
        const t = score / 10;
        if (theme === 'ocean') return d3.interpolateBlues(0.3 + t * 0.7);
        if (theme === 'zen') return d3.interpolateGreens(0.3 + t * 0.7);
        if (theme === 'ink') return t > 0.7 ? "#000" : (t > 0.4 ? "#666" : "#999");
        return d3.interpolateWarm(t);
    };

    // Tooltip setup
    const tooltip = d3.select(containerRef.current).append("div")
      .attr("class", "spiral-tooltip")
      .style("position", "fixed")
      .style("visibility", "hidden")
      .style("pointer-events", "none")
      .style("z-index", "100")
      .style("padding", "12px 16px")
      .style("background", theme === 'ocean' ? "rgba(15, 23, 42, 0.95)" : "rgba(255, 255, 255, 0.95)")
      .style("backdrop-filter", "blur(8px)")
      .style("border", theme === 'ink' ? "2px solid black" : "1px solid rgba(0,0,0,0.08)")
      .style("border-radius", "16px")
      .style("box-shadow", "0 10px 30px -5px rgba(0,0,0,0.2)")
      .style("color", theme === 'ocean' ? "white" : "black")
      .style("font-size", "12px");

    // 5. Draw the Spiral Segments
    for (let i = 0; i < days - 1; i++) {
      const d = dailyData.get(i);
      svg.append("path")
        .datum([i, i + 1])
        .attr("d", spiralLine)
        .attr("transform", `translate(${centerX}, ${centerY})`)
        .attr("fill", "none")
        .attr("stroke", getMoodColor(d.mood))
        .attr("stroke-width", 4 + (d.mood / 2))
        .attr("stroke-linecap", "round")
        .style("filter", d.mood >= 8 ? "url(#glow)" : "none")
        .style("opacity", 0.8);
    }

    // 6. Draw Habit Nodes
    svg.selectAll(".node")
      .data(d3.range(days))
      .enter()
      .append("circle")
      .attr("cx", d => centerX + Math.sin(angleScale(d)) * rScale(d))
      .attr("cy", d => centerY - Math.cos(angleScale(d)) * rScale(d))
      .attr("r", d => {
          const habits = dailyData.get(d).habits;
          return habits === 0 ? 0 : 4 + habits * 2;
      })
      .attr("fill", d => getMoodColor(dailyData.get(d).mood))
      .attr("stroke", "white")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("mouseover", (event, d) => {
        const data = dailyData.get(d);
        d3.select(event.currentTarget).attr("r", 14).attr("stroke-width", 3);
        tooltip.style("visibility", "visible").html(`
            <div style="font-weight: 900; font-size: 10px; opacity: 0.5; margin-bottom: 6px; text-transform: uppercase;">${format(new Date(data.date), 'PPPP', { locale })}</div>
            <div style="display: flex; gap: 16px; align-items: center;">
                <div>
                    <div style="font-size: 20px; font-weight: 900;">${data.mood}</div>
                    <div style="font-size: 8px; font-weight: 900; opacity: 0.5; text-transform: uppercase;">${t("home.mood")}</div>
                </div>
                <div style="width: 1px; height: 24px; background: rgba(128,128,128,0.2)"></div>
                <div>
                    <div style="font-size: 20px; font-weight: 900;">${data.habits}</div>
                    <div style="font-size: 8px; font-weight: 900; opacity: 0.5; text-transform: uppercase;">${t("nav.habits")}</div>
                </div>
            </div>
        `);
      })
      .on("mousemove", (event) => {
        tooltip.style("top", (event.clientY - 90) + "px").style("left", (event.clientX + 20) + "px");
      })
      .on("mouseout", (event, d) => {
        const habits = dailyData.get(d).habits;
        d3.select(event.currentTarget).attr("r", 4 + habits * 2).attr("stroke-width", 1.5);
        tooltip.style("visibility", "hidden");
      });

    // 7. Center text
    const center = svg.append("g").attr("transform", `translate(${centerX}, ${centerY})`);
    center.append("circle").attr("r", 35).attr("fill", theme === 'ocean' ? "#1e293b" : "white").style("filter", "drop-shadow(0 4px 10px rgba(0,0,0,0.1))");
    center.append("text")
      .attr("text-anchor", "middle")
      .attr("dy", "0.35em")
      .style("font-weight", "900")
      .style("font-size", "10px")
      .style("fill", theme === 'ocean' ? "#94a3b8" : "#64748b")
      .text("30 DAYS");

    return () => { tooltip.remove(); };
  }, [dailyData, theme, t, locale]);

  return (
    <div ref={containerRef} className="relative w-full aspect-square max-w-[500px] mx-auto group">
      <svg ref={svgRef} className="w-full h-full" style={{ filter: 'drop-shadow(0 20px 50px rgba(0,0,0,0.1))' }} />
      {/* Decorative Outer Ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none opacity-10">
          <div className="w-full h-full rounded-full border border-dashed border-slate-400 animate-[spin_60s_linear_infinite]" />
      </div>
    </div>
  );
};

export default SpiralVisualizer;
