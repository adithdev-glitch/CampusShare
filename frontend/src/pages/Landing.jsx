import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Cpu, Box, ShieldCheck, HeartHandshake, Compass,
  CheckCircle, IndianRupee, Users, BookOpen, Wrench, Zap,
  Eye, Lightbulb
} from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ── Floating rounded-square icon card ─────────────── */
const FloatCard = ({ children, style, className = '' }) => (
  <div
    style={style}
    className={`absolute flex items-center justify-center rounded-[22px] shadow-xl select-none ${className}`}
  >
    {children}
  </div>
);

/* ── Avatar circle card ────────────────────────────── */
const AvatarCard = ({ initials, color, style }) => (
  <div
    style={style}
    className={`absolute flex items-center justify-center rounded-[18px] shadow-lg border-2 border-white text-white font-bold text-lg ${color}`}
  >
    {initials}
  </div>
);

/* ── Dotted SVG line connector ─────────────────────── */
const DotLine = ({ x1, y1, x2, y2 }) => {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  const n = Math.floor(len / 13);
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const t = (i + 0.5) / n;
        return <circle key={i} cx={x1 + dx * t} cy={y1 + dy * t} r={2.2} fill="#a78bfa" opacity={0.65} />;
      })}
    </>
  );
};

/* ── Community Showcase Section with Framer Motion Scroll Animation ── */
const CommunitySection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Rotation transforms on scroll for left cards (counter-clockwise emphasis)
  const rotL1 = useTransform(scrollYProgress, [0, 1], [15, -28]);
  const rotL2 = useTransform(scrollYProgress, [0, 1], [-10, 24]);
  const rotL3 = useTransform(scrollYProgress, [0, 1], [22, -18]);
  const rotL4 = useTransform(scrollYProgress, [0, 1], [-16, 26]);

  // Rotation transforms on scroll for right cards (clockwise emphasis)
  const rotR1 = useTransform(scrollYProgress, [0, 1], [-22, 25]);
  const rotR2 = useTransform(scrollYProgress, [0, 1], [18, -26]);
  const rotR3 = useTransform(scrollYProgress, [0, 1], [-15, 28]);
  const rotR4 = useTransform(scrollYProgress, [0, 1], [24, -20]);

  // Gentle vertical parallax for smooth floating sensation
  const yL1 = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yL2 = useTransform(scrollYProgress, [0, 1], [65, -65]);
  const yL3 = useTransform(scrollYProgress, [0, 1], [30, -50]);
  const yL4 = useTransform(scrollYProgress, [0, 1], [50, -30]);

  const yR1 = useTransform(scrollYProgress, [0, 1], [55, -55]);
  const yR2 = useTransform(scrollYProgress, [0, 1], [30, -45]);
  const yR3 = useTransform(scrollYProgress, [0, 1], [65, -65]);
  const yR4 = useTransform(scrollYProgress, [0, 1], [40, -30]);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#ededf2] flex items-center justify-center select-none"
      style={{ height: '100vh', minHeight: '100vh' }}
    >
      {/* Radial light glow at center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 75% at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(237,237,242,0) 100%)',
        }}
      />

      {/* ─── LEFT: 4 photo cards ─── */}
      {/* Card L1 — top far left, large */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          left: '3.5%',
          top: '9%',
          width: 122,
          height: 164,
          rotate: rotL1,
          y: yL1,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_left.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Card L2 — second row, offset right, medium */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          left: '16%',
          top: '16%',
          width: 108,
          height: 148,
          rotate: rotL2,
          y: yL2,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_left.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '33.3% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Card L3 — below L2, slightly right */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          left: '18%',
          top: '56%',
          width: 98,
          height: 136,
          rotate: rotL3,
          y: yL3,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_left.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '66.6% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Card L4 — bottom far left */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          left: '4.5%',
          top: '68%',
          width: 110,
          height: 148,
          rotate: rotL4,
          y: yL4,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_left.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '100% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* ─── RIGHT: 4 photo cards ─── */}
      {/* Card R1 — top right area, medium */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          right: '18%',
          top: '11%',
          width: 108,
          height: 148,
          rotate: rotR1,
          y: yR1,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_right.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '0% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Card R2 — top far right, slightly lower */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          right: '3.5%',
          top: '8%',
          width: 122,
          height: 164,
          rotate: rotR2,
          y: yR2,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_right.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '33.3% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Card R3 — middle right, large */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          right: '4.5%',
          top: '47%',
          width: 120,
          height: 166,
          rotate: rotR3,
          y: yR3,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_right.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '66.6% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* Card R4 — bottom far right */}
      <motion.div
        className="absolute rounded-[22px] overflow-hidden border-2 border-white will-change-transform"
        style={{
          right: '17%',
          top: '68%',
          width: 102,
          height: 140,
          rotate: rotR4,
          y: yR4,
          boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        }}
        whileHover={{ scale: 1.05 }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundImage: 'url(/students_right.jpg)',
            backgroundSize: '400% 100%',
            backgroundPosition: '100% 50%',
            backgroundRepeat: 'no-repeat',
          }}
        />
      </motion.div>

      {/* ─── Center content ─── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center px-6 max-w-md">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
          Campus<br />Community
        </h2>
        <p className="mt-4 text-slate-500 text-sm md:text-base leading-relaxed max-w-sm">
          Connect with students across campus — share resources and build a sustainable college community together.
        </p>
        <Link
          to="/explore"
          className="mt-8 inline-block px-8 py-3.5 rounded-full text-white font-semibold text-sm transition-transform duration-200 hover:scale-105 active:scale-95"
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

const Landing = () => {
  // Card top-left positions inside 900×310 viewBox
  const C = {
    p1: { x: 44, y: 128 },
    idea: { x: 168, y: 42 },
    balloon: { x: 178, y: 218 },
    center: { x: 400, y: 80 },
    shield: { x: 638, y: 34 },
    eyes: { x: 752, y: 130 },
    p2: { x: 648, y: 218 },
  };
  const H = { p1: 28, idea: 28, balloon: 28, center: 40, shield: 28, eyes: 32, p2: 28 };

  return (
    <div className="relative overflow-hidden bg-white min-h-screen">
      {/* ── Hero ── */}
      <header className="relative max-w-5xl mx-auto px-6 pt-2 pb-14 text-center" style={{ height: "100vh" }}>

        {/* Floating icon graphic */}
        <div className="relative mx-auto" style={{ width: '100%', maxWidth: 900, height: 310 }}>

          {/* SVG dotted connectors */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 900 310" preserveAspectRatio="xMidYMid meet">
            <DotLine x1={C.p1.x + H.p1} y1={C.p1.y + H.p1} x2={C.idea.x + H.idea} y2={C.idea.y + H.idea} />
            <DotLine x1={C.idea.x + H.idea} y1={C.idea.y + H.idea} x2={C.center.x + H.center} y2={C.center.y + H.center} />
            <DotLine x1={C.balloon.x + H.balloon} y1={C.balloon.y + H.balloon} x2={C.center.x + H.center} y2={C.center.y + H.center} />
            <DotLine x1={C.center.x + H.center} y1={C.center.y + H.center} x2={C.shield.x + H.shield} y2={C.shield.y + H.shield} />
            <DotLine x1={C.center.x + H.center} y1={C.center.y + H.center} x2={C.p2.x + H.p2} y2={C.p2.y + H.p2} />
            <DotLine x1={C.shield.x + H.shield} y1={C.shield.y + H.shield} x2={C.eyes.x + H.eyes} y2={C.eyes.y + H.eyes} />
          </svg>

          {/* Person 1 */}
          <AvatarCard initials="AK" color="bg-indigo-500" style={{ left: C.p1.x, top: C.p1.y, width: 56, height: 56 }} />

          {/* Lightbulb */}
          <FloatCard style={{ left: C.idea.x, top: C.idea.y, width: 56, height: 56, background: '#FBBF24' }}>
            <Lightbulb className="w-7 h-7 text-white" />
          </FloatCard>

          {/* Users */}
          <FloatCard style={{ left: C.balloon.x, top: C.balloon.y, width: 56, height: 56, background: '#38BDF8' }}>
            <Users className="w-7 h-7 text-white" />
          </FloatCard>

          {/* Center check */}
          <FloatCard style={{ left: C.center.x, top: C.center.y, width: 80, height: 80, background: '#7C3AED', zIndex: 10, boxShadow: '0 8px 32px rgba(124,58,237,0.38)' }}>
            <CheckCircle className="w-11 h-11 text-white" strokeWidth={2.2} />
          </FloatCard>

          {/* Shield */}
          <FloatCard style={{ left: C.shield.x, top: C.shield.y, width: 56, height: 56, background: '#F97316' }}>
            <ShieldCheck className="w-7 h-7 text-white" />
          </FloatCard>

          {/* Eye */}
          <FloatCard style={{ left: C.eyes.x, top: C.eyes.y, width: 64, height: 64, background: '#fff', border: '1.5px solid #e2e8f0' }}>
            <Eye className="w-8 h-8 text-slate-700" />
          </FloatCard>

          {/* Person 2 */}
          <AvatarCard initials="SR" color="bg-emerald-500" style={{ left: C.p2.x, top: C.p2.y, width: 56, height: 56 }} />
        </div>

        {/* Hero copy */}
        <h1 className="text-5xl md:text-[3.6rem] font-extrabold tracking-tight text-slate-900 leading-[1.12] mt-4">
          Campus Resource<br />Sharing Network
        </h1>

        <p className="text-slate-500 text-base md:text-lg max-w-md mx-auto mt-5 leading-relaxed">
          CampusShare is a modern, all-in-one platform designed to help students lend, borrow, and share resources across campus.
        </p>

        <div className="mt-8 flex justify-center gap-3 flex-wrap">
          <Link to="/explore"
            className="px-7 py-3.5 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', boxShadow: '0 4px 20px rgba(249,115,22,0.38)' }}>
            Explore Resources
          </Link>
          <Link to="/login"
            className="px-7 py-3.5 rounded-full text-slate-700 font-semibold text-sm bg-slate-100 hover:bg-slate-200 transition-colors">
            List a Resource
          </Link>
        </div>
      </header>

      {/* ── Community Showcase Section with 100vh & Scroll Animation ── */}
      <CommunitySection />

    </div>
  );
};

export default Landing;


