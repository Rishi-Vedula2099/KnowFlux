"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";

export default function AnimatedBackground() {
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  const rootRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const { clientX, clientY } = e;
    setMousePos({
      x: clientX / window.innerWidth,
      y: clientY / window.innerHeight,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  /* Parallax offsets */
  const emberX = `calc(-50% + ${(mousePos.x - 0.5) * 40}px)`;
  const emberY = `calc(-50% + ${(mousePos.y - 0.5) * 40}px)`;
  const glowX = `${-120 + mousePos.x * 50}px`;
  const glowY = `${-180 + mousePos.y * 50}px`;

  return (
    <div className="ol-bg fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#0c0c0e]">
      <div 
        className="ol-geo absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(30deg, #d4a843 .5px, transparent .5px),
            linear-gradient(150deg, #d4a843 .5px, transparent .5px),
            linear-gradient(210deg, #d4a843 .5px, transparent .5px)
          `,
          backgroundSize: '38px 66px'
        }}
      />
      <div
        className="ol-ember absolute width-[600px] height-[600px] rounded-full opacity-70"
        style={{ 
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(192,57,43,0.07), transparent 60%)',
          top: '50%',
          left: '50%',
          transform: `translate(${emberX}, ${emberY})`,
          transition: 'transform 1.4s cubic-bezier(0.25,0.46,0.45,0.94)',
          animation: 'ol-ember-pulse 8s ease-in-out infinite'
        }}
      />
      <div
        className="ol-glow-tl absolute width-[450px] height-[450px] rounded-full"
        style={{ 
          width: '450px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(212,168,67,0.055), transparent 65%)',
          top: '-180px', 
          left: '-120px',
          transform: `translate(${glowX}, ${glowY})`,
          transition: 'transform 1.2s cubic-bezier(0.25,0.46,0.45,0.94)'
        }}
      />
      <div className="ol-vein-top absolute top-0 left-0 right-0 h-[1px] opacity-[0.45]" 
        style={{
          background: 'linear-gradient(90deg, transparent 10%, #d4a843 50%, transparent 90%)',
          animation: 'ol-vein 4s ease-in-out infinite'
        }}
      />
      <div className="ol-vein-bot absolute bottom-0 left-0 right-0 h-[1px] opacity-[0.28]" 
        style={{
          background: 'linear-gradient(90deg, transparent 20%, #9a7830 50%, transparent 80%)',
          animation: 'ol-vein 6s ease-in-out infinite reverse'
        }}
      />
    </div>
  );
}
