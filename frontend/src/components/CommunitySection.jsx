import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useSpring, useMotionValueEvent, AnimatePresence } from 'framer-motion';

/* ── Floating Photo Card (Mounted on a rotating CD platter, counter-rotated on scroll to stay upright) ── */
const PhotoCard = ({
  style,
  width = 148,
  height = 198,
  borderRadius = '26px',
  borderWidth = '3px',
  image,
  counterRotate,
  y,
}) => (
  <div className="absolute z-10 pointer-events-none" style={style}>
    <motion.div
      className="overflow-hidden border-white pointer-events-auto cursor-pointer will-change-transform"
      style={{
        width,
        height,
        borderRadius,
        borderWidth,
        borderStyle: 'solid',
        rotate: counterRotate,
        y,
        boxShadow: '0 12px 32px rgba(0,0,0,0.12)',
      }}
      whileHover={{ scale: 1.08, zIndex: 30 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    </motion.div>
  </div>
);

const MESSAGES = [
  'Connect with students across campus — share resources and build a sustainable college community together.',
  'Discover what your fellow students have to offer — from textbooks to tools, everything in one place.',
  'Join thousands of campus members already sharing — make college life more accessible for everyone.',
];

/* ── Community Showcase Section Driven 100% On-Scroll with Zero Sticky Sticking ── */
const CommunitySection = () => {
  const sectionRef = useRef(null);

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

  // Tracks the section from the moment it enters the screen to when it exits
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Inertial spring gives smooth, organic momentum when scrolling with wheel or trackpad
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    mass: 0.15,
  });

  /* ── 1. Both CD Platters Rotate in Real-time Driven Directly by Scroll ── */
  const leftCdRotation = useTransform(smoothProgress, [0, 1], [-85, 85]);
  const rightCdRotation = useTransform(smoothProgress, [0, 1], [85, -85]);

  /* ── 2. Cards Counter-Rotate at Exact Opposite Angle so Portraits Stay Perfectly Upright ── */
  const cardRotLeft = useTransform(smoothProgress, [0, 1], [85, -85]);
  const cardRotRight = useTransform(smoothProgress, [0, 1], [-85, 85]);

  /* ── 3. Multi-layer Parallax Float for Organic Depth ── */
  const float1 = useTransform(smoothProgress, [0, 1], [-16, 16]);
  const float2 = useTransform(smoothProgress, [0, 1], [20, -20]);
  const float3 = useTransform(smoothProgress, [0, 1], [-12, 12]);
  const float4 = useTransform(smoothProgress, [0, 1], [16, -16]);
  const floatArray = [float1, float2, float3, float4, float1, float2, float3, float4];

  /* ── 4. Dynamic Text Message Updates Across the Scroll ── */
  const [activeTextIdx, setActiveTextIdx] = useState(0);
  useMotionValueEvent(smoothProgress, 'change', (v) => {
    if (v < 0.42) {
      if (activeTextIdx !== 0) setActiveTextIdx(0);
    } else if (v < 0.68) {
      if (activeTextIdx !== 1) setActiveTextIdx(1);
    } else {
      if (activeTextIdx !== 2) setActiveTextIdx(2);
    }
  });

  /* ── Responsive CD Dimensions & Radial Math ── */
  const cardWidth = isMobile ? 74 : 148;
  const cardHeight = isMobile ? 98 : 198;
  const cardBorderRadius = isMobile ? '16px' : '26px';
  const cardBorderWidth = isMobile ? '2px' : '3px';
  const cdSize = isMobile ? 400 : 760;
  const cdCenter = cdSize / 2; // 200 vs 380
  const cdRadius = isMobile ? 185 : 360;
  const leftX = isMobile ? '-74%' : '-58%';
  const rightX = isMobile ? '74%' : '58%';

  const getCardStyle = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      left: cdCenter + cdRadius * Math.cos(rad) - cardWidth / 2,
      top: cdCenter + cdRadius * Math.sin(rad) - cardHeight / 2,
    };
  };

  /* 8 cards evenly spaced at 45° intervals around each platter */
  const cardAngles = [0, 45, 90, 135, 180, 225, 270, 315];

  const leftCardImages = [
    '/left1.jpg',
    '/left2.jpg',
    '/left3.jpg',
    '/left4.jpg',
    '/left5.jpg',
    '/left6.jpg',
    '/left7.jpg',
    '/left3.jpg',
  ];

  const rightCardImages = [
    '/left4.jpg',
    '/left5.jpg',
    '/left6.jpg',
    '/left7.jpg',
    '/left1.jpg',
    '/left2.jpg',
    '/left3.jpg',
    '/left5.jpg',
  ];

  return (
    <section
      ref={sectionRef}
      className="relative w-full py-20 sm:py-32 md:py-48 min-h-[520px] sm:min-h-[640px] md:min-h-[820px] overflow-hidden bg-white flex items-center justify-center select-none border-t border-slate-100/80"
    >
      {/* Radial light glow at center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 65% 80% at 50% 50%, rgba(255,255,255,1) 0%, rgba(255,255,255,0.7) 100%)',
        }}
      />

      {/* ════════════════ LEFT CD (Driven 100% on scroll) ════════════════ */}
      <motion.div
        className="absolute pointer-events-none select-none will-change-transform"
        style={{
          width: cdSize,
          height: cdSize,
          left: 0,
          top: '50%',
          x: leftX,
          marginTop: -cdCenter,
          rotate: leftCdRotation,
        }}
      >
        {leftCardImages.map((img, idx) => (
          <PhotoCard
            key={`left-card-${idx}`}
            style={getCardStyle(cardAngles[idx])}
            width={cardWidth}
            height={cardHeight}
            borderRadius={cardBorderRadius}
            borderWidth={cardBorderWidth}
            image={img}
            counterRotate={cardRotLeft}
            y={floatArray[idx]}
          />
        ))}
      </motion.div>

      {/* ════════════════ RIGHT CD (Driven 100% on scroll) ════════════════ */}
      <motion.div
        className="absolute pointer-events-none select-none will-change-transform"
        style={{
          width: cdSize,
          height: cdSize,
          right: 0,
          top: '50%',
          x: rightX,
          marginTop: -cdCenter,
          rotate: rightCdRotation,
        }}
      >
        {rightCardImages.map((img, idx) => (
          <PhotoCard
            key={`right-card-${idx}`}
            style={getCardStyle(cardAngles[idx])}
            width={cardWidth}
            height={cardHeight}
            borderRadius={cardBorderRadius}
            borderWidth={cardBorderWidth}
            image={img}
            counterRotate={cardRotRight}
            y={floatArray[idx]}
          />
        ))}
      </motion.div>

      {/* ─── Center Content ─── */}
      <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-xs sm:max-w-md">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Campus<br />Community
        </h2>
        <div className="mt-3 sm:mt-4 min-h-[48px] sm:min-h-[56px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={activeTextIdx}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.3 }}
              className="text-slate-500 text-xs sm:text-sm md:text-base leading-relaxed max-w-[250px] sm:max-w-sm"
            >
              {MESSAGES[activeTextIdx]}
            </motion.p>
          </AnimatePresence>
        </div>
        <Link
          to="/explore"
          className="mt-6 sm:mt-8 inline-block px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-full text-white font-semibold text-xs sm:text-sm transition-transform duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-md"
          style={{
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            boxShadow: '0 6px 24px rgba(124,58,237,0.38)',
          }}
        >
          Learn more
        </Link>
      </div>
    </section>
  );
};

export default CommunitySection;

