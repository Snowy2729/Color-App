'use client';

import React from 'react';

interface FullScreenScrollProps {
  children: React.ReactNode[];
}

export function FullScreenScrollFx({ children }: FullScreenScrollProps) {
  return (
    <div className="relative w-full flex flex-col pb-[10vh]">
      {children.map((child, index) => (
        <div 
          key={index} 
          className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden"
        >
          {/* Arka planın üzerine binen katman, altındakini şık bir şekilde kapatır/blurlar */}
          <div className="absolute inset-0 bg-background/95 backdrop-blur-2xl border-t border-white/5">
            {/* Grid desenini her katmanda tekrar ediyoruz ki süreklilik bozulmasın */}
            <div className="absolute inset-0 pointer-events-none footer-bg-grid opacity-50" />
          </div>
          
          <div className="relative z-10 w-full h-full flex items-center justify-center p-4 md:p-12">
            {child}
          </div>
        </div>
      ))}
    </div>
  );
}
