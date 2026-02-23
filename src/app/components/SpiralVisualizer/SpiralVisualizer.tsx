import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { MoodEntry, HabitEntry } from "@/app/lib/storage";
import { format } from "date-fns";

interface SpiralVisualizerProps {
  moods: MoodEntry[];
  habitEntries: HabitEntry[];
  days?: number;
}

export function SpiralVisualizer({ moods, habitEntries, days = 30 }: SpiralVisualizerProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!svgRef.current || moods.length === 0) return;
    
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    
    const width = 400;
    const height = 400;
    const centerX = width / 2;
    const centerY = height / 2;
    
    svg.attr("viewBox", `0 0 ${width} ${height}`);
    
    // Create gradient definitions
    const defs = svg.append("defs");
    
    // Prepare data - last N days
    const sortedMoods = moods
      .slice()
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-days);
    
    // Spiral parameters
    const turns = Math.ceil(sortedMoods.length / 12); // roughly 12 points per turn
    const maxRadius = Math.min(width, height) * 0.4;
    const startRadius = 20;
    
    // Create spiral path
    const points = sortedMoods.map((mood, i) => {
      const angle = (i / sortedMoods.length) * turns * 2 * Math.PI;
      const radius = startRadius + (maxRadius - startRadius) * (i / sortedMoods.length);
      
      return {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
        mood: mood.mood,
        date: mood.date,
        angle,
        radius,
      };
    });
    
    // Draw connecting line
    const line = d3.line<typeof points[0]>()
      .x(d => d.x)
      .y(d => d.y)
      .curve(d3.curveCardinal);
    
    svg.append("path")
      .datum(points)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 2)
      .attr("opacity", 0.3);
    
    // Color scale based on mood
    const colorScale = d3.scaleSequential()
      .domain([1, 10])
      .interpolator(t => {
        if (t < 0.3) return "#ef4444"; // red
        if (t < 0.5) return "#f59e0b"; // orange
        if (t < 0.7) return "#eab308"; // yellow
        if (t < 0.9) return "#84cc16"; // lime
        return "#10b981"; // green
      });
    
    // Draw mood circles
    const circles = svg.selectAll(".mood-circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "mood-circle")
      .attr("cx", d => d.x)
      .attr("cy", d => d.y)
      .attr("r", 0)
      .attr("fill", d => colorScale(d.mood))
      .attr("stroke", "white")
      .attr("stroke-width", 2)
      .style("cursor", "pointer");
    
    // Animate circles appearing
    circles.transition()
      .duration(1000)
      .delay((d, i) => i * 30)
      .attr("r", d => {
        // Size based on habit completion for that day
        const dayHabits = habitEntries.filter(
          h => h.date === d.date && h.completed
        );
        return 8 + dayHabits.length * 3;
      });
    
    // Tooltip
    const tooltip = d3.select("body")
      .append("div")
      .attr("class", "spiral-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "rgba(0, 0, 0, 0.8)")
      .style("color", "white")
      .style("padding", "8px 12px")
      .style("border-radius", "6px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("z-index", "1000");
    
    circles
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", function() {
            return +d3.select(this).attr("r") * 1.5;
          })
          .attr("stroke-width", 3);
        
        const dayHabits = habitEntries.filter(
          h => h.date === d.date && h.completed
        ).length;
        
        tooltip
          .style("visibility", "visible")
          .html(`
            <strong>${format(new Date(d.date), 'yyyy-MM-dd')}</strong><br/>
            心情: ${d.mood}/10<br/>
            习惯完成: ${dayHabits}
          `);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 10) + "px")
          .style("left", (event.pageX + 10) + "px");
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr("r", function() {
            return +d3.select(this).attr("r") / 1.5;
          })
          .attr("stroke-width", 2);
        
        tooltip.style("visibility", "hidden");
      });
    
    // Add center point
    svg.append("circle")
      .attr("cx", centerX)
      .attr("cy", centerY)
      .attr("r", 5)
      .attr("fill", "#8b5cf6")
      .attr("opacity", 0.5);
    
    // Cleanup
    return () => {
      tooltip.remove();
    };
  }, [moods, habitEntries, days]);
  
  return (
    <div className="flex flex-col items-center">
      <svg ref={svgRef} className="w-full max-w-md" />
      <div className="flex items-center gap-4 mt-4 text-xs text-gray-600">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <span>Low</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <span>Stable</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span>Joyful</span>
        </div>
      </div>
    </div>
  );
}
