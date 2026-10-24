import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, ArrowRight, Check } from 'lucide-react';
import CommunitySection from '../components/CommunitySection';
import IntegrationsSection from '../components/IntegrationsSection';

/* ── 1. Yellow Lightbulb Icon ──────────────────────────────── */
const LightbulbIcon = () => (
  <svg viewBox="0 0 24 24" className="w-7 h-7 text-white" fill="none">
    <path
      d="M9 18h6m-4 3h2M12 2a7 7 0 0 0-7 7c0 2.6 1.4 4.8 3.4 6 .7.5 1.1 1.3 1.1 2.2V18h5v-.8c0-.9.4-1.7 1.1-2.2 2-1.2 3.4-3.4 3.4-6a7 7 0 0 0-7-7z"
      stroke="white"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="12" cy="9" r="1.6" fill="white" />
  </svg>
);

/* ── 2. Cyan Balloons Icon ─────────────────────────────────── */
const BalloonsIcon = () => (
  <svg viewBox="0 0 36 36" className="w-8 h-8 text-white" fill="none">
    {/* Left balloon */}
    <ellipse cx="13" cy="14" rx="6.5" ry="8.2" stroke="white" strokeWidth="2.1" fill="none" />
    <path d="M10 11 C10 8.5 12 7.5 13.5 7.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <polygon points="13,22 11,24.5 15,24.5" fill="white" />
    <path d="M13 24.5 C12 28 14 30 13 33" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />

    {/* Right balloon */}
    <ellipse cx="23" cy="11.5" rx="6.5" ry="8.2" stroke="white" strokeWidth="2.1" fill="none" />
    <path d="M20 8.5 C20 6.5 22 5.5 23.5 5.5" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
    <polygon points="23,19.5 21,22 25,22" fill="white" />
    <path d="M23 22 C22 25 24 28 22.5 32" stroke="white" strokeWidth="1.6" strokeLinecap="round" fill="none" />
  </svg>
);

/* ── 3. Orange Shield with Lightning Icon ──────────────────── */
const ShieldLightningIcon = () => (
  <svg viewBox="0 0 36 36" className="w-8 h-8" fill="none">
    <path
      d="M18 5 L28 8.8 V17.2 C28 23.8 23.6 28.8 18 31 C12.4 28.8 8 23.8 8 17.2 V8.8 L18 5 Z"
      stroke="white"
      strokeWidth="2.2"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M19.2 10.5 L13.8 18 H18.2 L17.2 25.5 L22.8 17.5 H18.2 L19.2 10.5 Z"
      fill="white"
    />
  </svg>
);

/* ── 4. White Squircle Cartoon Wide Eyes Icon ──────────────── */
const WideEyesIcon = () => (
  <svg viewBox="0 0 46 32" className="w-12 h-8" fill="none">
    {/* Left eye */}
    <ellipse cx="14" cy="16" rx="8.5" ry="11.5" stroke="#0f172a" strokeWidth="2.4" fill="white" />
    <ellipse cx="12" cy="16" rx="3.6" ry="4.6" fill="#0f172a" />
    <circle cx="10.8" cy="14.2" r="1.1" fill="white" />

    {/* Right eye */}
    <ellipse cx="32" cy="16" rx="8.5" ry="11.5" stroke="#0f172a" strokeWidth="2.4" fill="white" />
    <ellipse cx="30" cy="16" rx="3.6" ry="4.6" fill="#0f172a" />
    <circle cx="28.8" cy="14.2" r="1.1" fill="white" />
  </svg>
);

/* ── 5. Center Tile Checkmark ──────────────────────────────── */
const CenterCheckIcon = () => (
  <div className="w-[56px] h-[56px] rounded-full border-[3.6px] border-white flex items-center justify-center shadow-inner">
    <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="none">
      <path
        d="M6.5 12.8 L10.5 16.8 L18 9"
        stroke="white"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  </div>
);

const Landing = () => {
  const navigate = useNavigate();
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const heroRef = useRef(null);
  const [scale, setScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const width = Math.min(window.innerWidth - 32, 960);
      return Math.max(0.34, width / 960);
    }
    return 1;
  });

  useEffect(() => {
    const updateScale = () => {
      if (heroRef.current) {
        const containerWidth = heroRef.current.clientWidth;
        const newScale = Math.min(1, Math.max(0.34, containerWidth / 960));
        setScale(newScale);
      }
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  return (
    <div className="relative bg-white min-h-screen overflow-x-clip text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* ── Hero Section ── */}
      <header className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-14 sm:pb-20 md:pb-28 text-center flex flex-col items-center">

        {/* ── Floating Icon & Network Graphic (Uniformly Scaled for Exact Same Design & Animations on Mobile) ── */}
        <div
          ref={heroRef}
          className="w-full max-w-[960px] mx-auto flex justify-center items-center overflow-visible select-none"
        >
          <div
            style={{
              width: 960 * scale,
              height: 330 * scale,
              position: 'relative',
            }}
            className="transition-[width,height] duration-150 ease-out flex-shrink-0"
          >
            <div
              style={{
                width: 960,
                height: 330,
                position: 'absolute',
                top: 0,
                left: 0,
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
              }}
              className="select-none pointer-events-auto"
            >
              {/* SVG Solid Connector Lines with Continuously Moving Purple Dots */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 960 330"
                preserveAspectRatio="xMidYMid meet"
              >
            {/* Horizontal line: Left avatar -> Center card */}
            <line x1="162" y1="160" x2="424" y2="160" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Horizontal line: Center card -> Right eyes card */}
            <line x1="536" y1="160" x2="798" y2="160" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Branch 1 (Up-Left to Yellow Lightbulb) */}
            <line x1="348" y1="160" x2="298" y2="94" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="298" y1="94" x2="252" y2="94" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Branch 2 (Down-Left to Cyan Balloons) */}
            <line x1="356" y1="160" x2="332" y2="226" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="332" y1="226" x2="278" y2="226" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Branch 3 (Up-Right to Coral Shield) */}
            <line x1="604" y1="160" x2="654" y2="94" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="654" y1="94" x2="704" y2="94" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* Branch 4 (Down-Right to Female Avatar on Phone) */}
            <line x1="632" y1="160" x2="686" y2="232" stroke="#e2e8f0" strokeWidth="1.5" />
            <line x1="686" y1="232" x2="715" y2="232" stroke="#e2e8f0" strokeWidth="1.5" />

            {/* ── Bidirectional Moving Purple Dots with Relaxed Speeds & Distinct Timings ── */}
            {[
              // 1. Yellow Lightbulb -> Center (Inbound)
              {
                id: 'in-lightbulb',
                path: 'M 252 94 L 298 94 L 348 160 L 424 160',
                dur: '4.8s',
                begin: '0.0s',
              },
              // 2. Center -> Male Avatar (Outbound)
              {
                id: 'out-male',
                path: 'M 424 160 L 162 160',
                dur: '4.0s',
                begin: '1.4s',
              },
              // 3. Cyan Balloons -> Center (Inbound)
              {
                id: 'in-balloons',
                path: 'M 278 226 L 332 226 L 356 160 L 424 160',
                dur: '5.2s',
                begin: '2.7s',
              },
              // 4. Center -> Coral Shield (Outbound)
              {
                id: 'out-shield',
                path: 'M 536 160 L 604 160 L 654 94 L 704 94',
                dur: '4.5s',
                begin: '0.7s',
              },
              // 5. Cartoon Eyes -> Center (Inbound)
              {
                id: 'in-eyes',
                path: 'M 798 160 L 536 160',
                dur: '4.3s',
                begin: '2.0s',
              },
              // 6. Center -> Female Avatar (Outbound)
              {
                id: 'out-female',
                path: 'M 536 160 L 632 160 L 686 232 L 715 232',
                dur: '4.9s',
                begin: '3.3s',
              },
            ].map((dot) => (
              <g key={dot.id}>
                {/* Glow halo around the traveling purple dot */}
                <circle r="7" fill="#8b5cf6" opacity="0">
                  <animateMotion
                    path={dot.path}
                    dur={dot.dur}
                    begin={dot.begin}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 0.45; 0.45; 0"
                    keyTimes="0; 0.12; 0.88; 1"
                    dur={dot.dur}
                    begin={dot.begin}
                    repeatCount="indefinite"
                  />
                </circle>

                {/* Core traveling purple dot */}
                <circle r="3.8" fill="#8b5cf6" opacity="0">
                  <animateMotion
                    path={dot.path}
                    dur={dot.dur}
                    begin={dot.begin}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0; 1; 1; 0"
                    keyTimes="0; 0.12; 0.88; 1"
                    dur={dot.dur}
                    begin={dot.begin}
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            ))}
          </svg>

          {/* 1. Yellow Squircle (Top-Left: Lightbulb) */}
          <motion.div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer will-change-transform"
            style={{
              left: 196,
              top: 66,
              width: 56,
              height: 56,
              background: 'linear-gradient(135deg, #fde047 0%, #fbbf24 60%, #f59e0b 100%)',
              boxShadow: '0 12px 26px -4px rgba(245, 158, 11, 0.4)',
            }}
            whileHover={{ scale: 1.08 }}
          >
            <LightbulbIcon />
          </motion.div>

          {/* 2. Male Photo Avatar (Mid-Left) */}
          <motion.div
            className="absolute rounded-[24px] overflow-hidden cursor-pointer will-change-transform"
            style={{
              left: 78,
              top: 118,
              width: 84,
              height: 84,
              boxShadow: '0 14px 30px -6px rgba(0, 0, 0, 0.16)',
            }}
            whileHover={{ scale: 1.08 }}
          >
            <img
              src="/hero-avatar-male.jpg"
              alt="Campus Member"
              className="w-full h-full object-cover rounded-[24px] border-2 border-white"
            />
          </motion.div>

          {/* 3. Cyan Balloons Squircle (Bottom-Left) */}
          <motion.div
            className="absolute rounded-[20px] flex items-center justify-center cursor-pointer will-change-transform"
            style={{
              left: 214,
              top: 194,
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)',
              boxShadow: '0 14px 28px -4px rgba(14, 165, 233, 0.42)',
            }}
            whileHover={{ scale: 1.08 }}
          >
            <BalloonsIcon />
          </motion.div>

          {/* 4. Center Violet Squircle with Circle Checkmark */}
          <motion.div
            className="absolute z-10 rounded-[32px] flex items-center justify-center cursor-pointer will-change-transform"
            style={{
              left: 424,
              top: 104,
              width: 112,
              height: 112,
              background: 'linear-gradient(145deg, #a78bfa 0%, #8b5cf6 55%, #7c3aed 100%)',
              boxShadow: '0 20px 42px -6px rgba(139, 92, 246, 0.5), inset 0 2px 4px rgba(255,255,255,0.3)',
            }}
            whileHover={{ scale: 1.06 }}
          >
            <CenterCheckIcon />
          </motion.div>

          {/* 5. Coral/Orange Shield with Lightning Squircle (Top-Right) */}
          <motion.div
            className="absolute rounded-[22px] flex items-center justify-center cursor-pointer will-change-transform"
            style={{
              left: 704,
              top: 62,
              width: 64,
              height: 64,
              background: 'linear-gradient(135deg, #ff7253 0%, #ff5238 60%, #eb3b23 100%)',
              boxShadow: '0 14px 28px -4px rgba(235, 59, 35, 0.42)',
            }}
            whileHover={{ scale: 1.08 }}
          >
            <ShieldLightningIcon />
          </motion.div>

          {/* 6. White Squircle with Wide Eyes (Mid-Right) */}
          <motion.div
            className="absolute rounded-[24px] bg-white border border-slate-200/90 flex items-center justify-center cursor-pointer will-change-transform"
            style={{
              left: 798,
              top: 118,
              width: 84,
              height: 84,
              boxShadow: '0 12px 28px -4px rgba(0, 0, 0, 0.07), 0 2px 6px -1px rgba(0, 0, 0, 0.04)',
            }}
            whileHover={{ scale: 1.08 }}
          >
            <WideEyesIcon />
          </motion.div>

          {/* 7. Female Photo Avatar on Phone (Bottom-Right) */}
          <motion.div
            className="absolute rounded-[20px] overflow-hidden cursor-pointer will-change-transform"
            style={{
              left: 715,
              top: 201,
              width: 62,
              height: 62,
              boxShadow: '0 14px 30px -6px rgba(0, 0, 0, 0.16)',
            }}
            whileHover={{ scale: 1.08 }}
          >
            <img
              src="/hero-avatar-female.jpg"
              alt="Campus Student"
              className="w-full h-full object-cover rounded-[20px] border-2 border-white"
            />
          </motion.div>
            </div>
          </div>
        </div>

        {/* ── Main Headline ── */}
        <h1 className="text-4xl sm:text-5xl md:text-[4.2rem] lg:text-[4.6rem] font-bold tracking-tight text-slate-950 leading-[1.1] sm:leading-[1.08] mt-6 md:mt-8">
          All-in-one Campus<br />platform
        </h1>

        {/* ── Subtitle ── */}
        <p className="text-slate-500 text-sm sm:text-base md:text-[17px] max-w-lg mx-auto mt-4 sm:mt-5 leading-relaxed font-normal px-2">
          CampusShare is a modern, all-in-one platform designed to perfectly fit your campus needs
        </p>

        {/* ── Coral Pill CTA Button ── */}
        <div className="mt-7 sm:mt-8 flex justify-center">
          <button
            onClick={() => setDemoModalOpen(true)}
            className="px-7 sm:px-8 py-3 sm:py-3.5 rounded-full text-white font-medium text-sm sm:text-[15px] tracking-wide transition-all duration-200 cursor-pointer hover:opacity-95 active:scale-95 shadow-md"
            style={{
              background: 'linear-gradient(135deg, #ff6447 0%, #ff5233 100%)',
              boxShadow: '0 10px 25px -4px rgba(255, 82, 51, 0.45)',
            }}
          >
            Request a Demo
          </button>
        </div>
      </header>

      {/* ── Request a Demo Interactive Modal ── */}
      <AnimatePresence>
        {demoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full max-h-[92vh] overflow-y-auto border border-slate-100 shadow-2xl relative"
            >
              <button
                onClick={() => setDemoModalOpen(false)}
                className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center space-x-2 text-violet-600 mb-2">
                <Sparkles className="w-5 h-5" />
                <span className="text-xs font-bold uppercase tracking-wider">Campus Experience</span>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Request a Campus Demo</h3>
              <p className="text-sm text-slate-500 mt-1.5 mb-6">
                Discover how CampusShare empowers your student body to borrow, lend, and exchange resources effortlessly.
              </p>

              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Instant student verification & college single sign-on</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Zero-cost book, lab kit & electronics sharing</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span>Automated QR checkout & trust scoring</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setDemoModalOpen(false);
                    navigate('/explore');
                  }}
                  className="flex-1 py-3 px-4 rounded-full text-sm font-semibold text-white bg-slate-950 hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Explore Live Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setDemoModalOpen(false);
                    navigate('/register');
                  }}
                  className="py-3 px-5 rounded-full text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
                >
                  Sign Up
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Community Showcase Section ── */}
      <div id="features">
        <CommunitySection />
      </div>

      {/* ── Integrations Section (Tools Fan) ── */}
      <IntegrationsSection />

    </div>
  );
};

export default Landing;
