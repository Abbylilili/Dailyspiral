import type { FC } from 'react';
import { useTheme } from "@/app/contexts/ThemeContext";
import pandaNormal from "figma:asset/a4c9998f92ac8efc75741168c966849b86d3b9ee.png";

const PandaAnimation: FC = () => {
    const { theme } = useTheme();
    if (theme !== 'ink') return null;

    const imageStyle = { 
        filter: 'grayscale(100%) brightness(120%) contrast(200%)', 
        mixBlendMode: 'multiply' as const,
        WebkitMaskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)',
        maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
    };

    return (
        <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute left-[52%] top-[43%] -translate-x-1/2 -translate-y-1/2 w-48 h-48 flex items-center justify-center">
                 <img src={pandaNormal} alt="Panda" style={imageStyle} className="w-full h-full object-contain opacity-90" />
            </div>
        </div>
    );
};

export default PandaAnimation;
