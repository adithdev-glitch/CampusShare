import React, { useRef, useEffect, useState } from 'react';

/* ─── 5 Tools matching the reference image ───────────────────────────────── */
const TOOLS = [
  {
    id: 'teams',
    label: 'Microsoft Teams',
    description: 'Collaboration & campus communication',
    angle: -22,
    yOffset: 38,
    xOffset: -270,
    mobileAngle: -20,
    mobileYOffset: 18,
    mobileXOffset: -128,
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        {/* Teams background shadow/avatar */}
        <circle cx="44" cy="20" r="7" fill="#7B83EB" opacity="0.6" />
        <rect x="36" y="29" width="16" height="15" rx="4" fill="#7B83EB" opacity="0.6" />
        {/* Primary avatar */}
        <circle cx="28" cy="18" r="9" fill="#505AC9" />
        <rect x="14" y="28" width="28" height="24" rx="6" fill="#505AC9" />
        {/* 'T' shield */}
        <rect x="8" y="24" width="24" height="24" rx="5" fill="#464EB8" />
        <text
          x="20"
          y="41"
          fill="white"
          fontSize="18"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          T
        </text>
      </svg>
    ),
  },
  {
    id: 'gmail',
    label: 'Gmail',
    description: 'Email & instant campus notifications',
    angle: -11,
    yOffset: 10,
    xOffset: -135,
    mobileAngle: -10,
    mobileYOffset: 6,
    mobileXOffset: -64,
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        {/* Official Google Gmail 4-color M */}
        <path
          d="M14 46V23.5L24.5 31.4C26.5 32.9 29.5 32.9 31.5 31.4L42 23.5V46C42 47.7 40.7 49 39 49H17C15.3 49 14 47.7 14 46Z"
          fill="#4285F4"
          opacity="0.1"
        />
        {/* Left leg: Blue */}
        <path
          d="M14 21.5V46C14 47.7 15.3 49 17 49H22V27.5L14 21.5Z"
          fill="#4285F4"
        />
        {/* Right leg: Green */}
        <path
          d="M50 21.5V46C50 47.7 48.7 49 47 49H42V27.5L50 21.5Z"
          fill="#34A853"
        />
        {/* Left angle fold: Red */}
        <path
          d="M22 27.5V17.5C22 15.3 24.5 14 26.3 15.3L32 19.6L22 27.5Z"
          fill="#EA4335"
        />
        {/* Right angle fold: Yellow */}
        <path
          d="M42 27.5V17.5C42 15.3 39.5 14 37.7 15.3L32 19.6L42 27.5Z"
          fill="#FBBC04"
        />
        {/* Center chevron: Red */}
        <path
          d="M14 21.5L26.3 30.7C29.7 33.2 34.3 33.2 37.7 30.7L50 21.5L37.7 12.3C34.3 9.8 29.7 9.8 26.3 12.3L14 21.5Z"
          fill="#EA4335"
        />
      </svg>
    ),
  },
  {
    id: 'loom',
    label: 'Loom',
    description: 'Video feedback & communication',
    angle: 0,
    yOffset: 0,
    xOffset: 0,
    mobileAngle: 0,
    mobileYOffset: 0,
    mobileXOffset: 0,
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        {/* Loom 12 radial rounded rays */}
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => {
          const r1 = 9;
          const r2 = 23;
          const rad = (deg * Math.PI) / 180;
          return (
            <line
              key={deg}
              x1={32 + r1 * Math.cos(rad)}
              y1={32 + r1 * Math.sin(rad)}
              x2={32 + r2 * Math.cos(rad)}
              y2={32 + r2 * Math.sin(rad)}
              stroke="#625DF5"
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}
        {/* Center circle */}
        <circle cx="32" cy="32" r="6" fill="#625DF5" />
      </svg>
    ),
  },
  {
    id: 'meet',
    label: 'Google Meet',
    description: 'Video meetings & virtual check-ins',
    angle: 11,
    yOffset: 10,
    xOffset: 135,
    mobileAngle: 10,
    mobileYOffset: 6,
    mobileXOffset: 64,
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        {/* Camera body */}
        <rect x="13" y="19" width="26" height="26" rx="5" fill="#00832D" />
        <path d="M13 24C13 21.2 15.2 19 18 19H34C36.8 19 39 21.2 39 24V32H13V24Z" fill="#00AC47" />
        <path d="M13 32H39V40C39 42.8 36.8 45 34 45H18C15.2 45 13 42.8 13 40V32Z" fill="#006622" opacity="0.3" />
        <path d="M13 36H27V45H18C15.2 45 13 42.8 13 40V36Z" fill="#26A69A" opacity="0.4" />
        {/* Snout triangle */}
        <path d="M39 28.5L49 20.5V43.5L39 35.5V28.5Z" fill="#00AA47" />
        <path d="M39 35.5L49 43.5V36L39 31V35.5Z" fill="#00832D" />
        <path d="M39 28.5L49 20.5V27.5L39 32V28.5Z" fill="#FFBA00" />
        <path d="M39 28.5L44 24.5L39 21V28.5Z" fill="#EA4335" />
        <path d="M49 27.5V36L44 32L49 27.5Z" fill="#2684FC" />
      </svg>
    ),
  },
  {
    id: 'outlook',
    label: 'Microsoft Outlook',
    description: 'Calendar scheduling & campus sync',
    angle: 22,
    yOffset: 38,
    xOffset: 270,
    mobileAngle: 20,
    mobileYOffset: 18,
    mobileXOffset: 128,
    svg: (
      <svg viewBox="0 0 64 64" className="w-full h-full" fill="none">
        {/* Outer envelope body */}
        <rect x="18" y="18" width="34" height="28" rx="4" fill="#0078D4" />
        <path d="M18 20L35 32L52 20" stroke="#50E6FF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M18 44L30 33" stroke="#2899F5" strokeWidth="2" strokeLinecap="round" />
        <path d="M52 44L40 33" stroke="#2899F5" strokeWidth="2" strokeLinecap="round" />
        {/* Left 'O' booklet overlay */}
        <rect x="12" y="16" width="22" height="28" rx="4" fill="#005A9E" />
        <ellipse cx="23" cy="30" rx="6.5" ry="8" fill="white" />
        <ellipse cx="23" cy="30" rx="3.5" ry="4.5" fill="#005A9E" />
      </svg>
    ),
  },
];

export default function IntegrationsSection() {
  const sectionRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(2); // Center: Loom by default
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
        }
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const activeTool = TOOLS[activeIdx];

  return (
    <section
      ref={sectionRef}
      className="relative z-20 w-full bg-white py-16 sm:py-24 md:py-32 overflow-hidden flex flex-col items-center justify-center select-none"
    >
      <div className="max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
        {/* ── Top Icon Badge (Red/Coral Dual Gears) ── */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.04)] flex items-center justify-center mb-5 sm:mb-7">
          <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8" fill="none">
            {/* Gear 1 (bottom left) */}
            <g transform="translate(11, 19)">
              <circle cx="0" cy="0" r="4.5" stroke="#F87171" strokeWidth="2.4" fill="none" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                <rect
                  key={deg}
                  x="-1"
                  y="-7"
                  width="2"
                  height="2.5"
                  rx="0.8"
                  fill="#F87171"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
            {/* Gear 2 (top right) */}
            <g transform="translate(20, 11)">
              <circle cx="0" cy="0" r="3.2" stroke="#EF4444" strokeWidth="2.2" fill="none" />
              {[22.5, 67.5, 112.5, 157.5, 202.5, 247.5, 292.5, 337.5].map((deg) => (
                <rect
                  key={deg}
                  x="-0.9"
                  y="-5.4"
                  width="1.8"
                  height="2.2"
                  rx="0.6"
                  fill="#EF4444"
                  transform={`rotate(${deg})`}
                />
              ))}
            </g>
          </svg>
        </div>

        {/* ── Headline Matching Reference ── */}
        <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.2] max-w-xl px-2">
          Integrate with your existing<br />tools in seconds
        </h2>

        {/* ── Fan / Arc of Cards ── */}
        <div className="relative w-full max-w-2xl h-44 sm:h-52 md:h-64 mt-8 sm:mt-12 md:mt-16 flex items-center justify-center">
          {TOOLS.map((tool, idx) => {
            const isActive = idx === activeIdx;

            // When in viewport, smoothly expand into the arc; otherwise start clustered
            const translateX = isIntersecting
              ? (isMobile ? tool.mobileXOffset : tool.xOffset)
              : 0;
            const translateY = isIntersecting
              ? (isMobile ? tool.mobileYOffset : tool.yOffset)
              : (isMobile ? 12 : 20);
            const rotate = isIntersecting
              ? (isMobile ? tool.mobileAngle : tool.angle)
              : 0;
            const scale = isActive ? 1.08 : 0.95;

            return (
              <div
                key={tool.id}
                onClick={() => setActiveIdx(idx)}
                onTouchStart={() => setActiveIdx(idx)}
                onMouseEnter={() => setActiveIdx(idx)}
                className="absolute cursor-pointer transition-all duration-700 ease-out"
                style={{
                  transform: `translate(${translateX}px, ${translateY}px) rotate(${rotate}deg) scale(${scale})`,
                  zIndex: isActive ? 30 : 20 - Math.abs(idx - 2),
                }}
              >
                {/* Clean White Card */}
                <div
                  className={`w-16 h-16 sm:w-22 sm:h-22 md:w-32 md:h-32 rounded-2xl md:rounded-3xl bg-white border border-slate-100 flex items-center justify-center transition-all duration-300 p-2 sm:p-3 md:p-4 ${
                    isActive
                      ? 'shadow-[0_16px_36px_-6px_rgba(0,0,0,0.14)] border-slate-200'
                      : 'shadow-[0_8px_20px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_28px_-8px_rgba(0,0,0,0.09)]'
                  }`}
                >
                  <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 flex items-center justify-center">
                    {tool.svg}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Dynamic Tool Details Below Center ── */}
        <div className="mt-6 sm:mt-8 transition-all duration-300 min-h-[50px] sm:min-h-[56px] px-4 text-center">
          <h4 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
            {activeTool.label}
          </h4>
          <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-xs sm:max-w-md mx-auto">
            {activeTool.description}
          </p>
        </div>
      </div>
    </section>
  );
}

