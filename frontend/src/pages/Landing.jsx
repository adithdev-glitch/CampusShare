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

/* ── Floating Photo Card with Entrance & Scroll Rotation ── */
const PhotoCard = ({
  left,
  right,
  top,
  width,
  height,
  image,
  bgPos,
  rotate,
  y,
  arcX,
  arcY,
  arcRot,
  scale,
  opacity,
}) => (
  <motion.div
    className="absolute z-10 will-change-transform"
    style={{
      left,
      right,
      top,
      x: arcX,
      y: arcY,
      rotate: arcRot,
      scale,
      opacity,
    }}
  >
    <motion.div
      className="rounded-[22px] overflow-hidden border-2 border-white will-change-transform cursor-pointer"
      style={{
        width,
        height,
        rotate,
        y,
        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
      }}
      whileHover={{ scale: 1.08 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url(${image})`,
          backgroundSize: '400% 100%',
          backgroundPosition: bgPos,
          backgroundRepeat: 'no-repeat',
        }}
      />
    </motion.div>
  </motion.div>
);

/* ── Community Showcase Section with Circle Rotating Transition ── */
const CommunitySection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end end'],
  });

  /* ── 1. Initial Appear Animation (when user reaches section) ── */
  const appearOpacity = useTransform(scrollYProgress, [0.06, 0.22], [0, 1]);
  const appearScale = useTransform(scrollYProgress, [0.06, 0.24], [0.45, 1]);

  /* ── 2. Natural Tilt/Rotate with Scroll for all 4 slots ── */
  const rotL1 = useTransform(scrollYProgress, [0, 1], [22, -32]);
  const rotL2 = useTransform(scrollYProgress, [0, 1], [-12, 28]);
  const rotL3 = useTransform(scrollYProgress, [0, 1], [26, -22]);
  const rotL4 = useTransform(scrollYProgress, [0, 1], [-18, 30]);

  const rotR1 = useTransform(scrollYProgress, [0, 1], [-25, 28]);
  const rotR2 = useTransform(scrollYProgress, [0, 1], [22, -30]);
  const rotR3 = useTransform(scrollYProgress, [0, 1], [-18, 32]);
  const rotR4 = useTransform(scrollYProgress, [0, 1], [28, -24]);

  const yL1 = useTransform(scrollYProgress, [0, 1], [35, -35]);
  const yL2 = useTransform(scrollYProgress, [0, 1], [50, -50]);
  const yL3 = useTransform(scrollYProgress, [0, 1], [25, -45]);
  const yL4 = useTransform(scrollYProgress, [0, 1], [40, -30]);

  const yR1 = useTransform(scrollYProgress, [0, 1], [45, -45]);
  const yR2 = useTransform(scrollYProgress, [0, 1], [30, -40]);
  const yR3 = useTransform(scrollYProgress, [0, 1], [55, -55]);
  const yR4 = useTransform(scrollYProgress, [0, 1], [35, -25]);

  /* ── 3. Circular Rotating Swap (Set 1 rotates out, Set 2 rotates in) ── */
  // Set 1 (initial 4 cards): active from 0.0 -> 0.42, then rotates along circular arc & exits by 0.54
  const scaleSet1Raw = useTransform(scrollYProgress, [0.42, 0.54], [1, 0.2]);
  const scaleSet1 = useTransform(
    [appearScale, scaleSet1Raw],
    ([a, s]) => Math.min(a, s)
  );

  const opacitySet1Raw = useTransform(scrollYProgress, [0.42, 0.54], [1, 0]);
  const opacitySet1 = useTransform(
    [appearOpacity, opacitySet1Raw],
    ([a, o]) => Math.min(a, o)
  );

  const arcRotLSet1 = useTransform(scrollYProgress, [0.42, 0.54], [0, -180]);
  const arcRotRSet1 = useTransform(scrollYProgress, [0.42, 0.54], [0, 180]);
  const arcXLSet1 = useTransform(scrollYProgress, [0.42, 0.48, 0.54], [0, -90, -30]);
  const arcYLSet1 = useTransform(scrollYProgress, [0.42, 0.48, 0.54], [0, -70, -120]);
  const arcXRSet1 = useTransform(scrollYProgress, [0.42, 0.48, 0.54], [0, 90, 30]);
  const arcYRSet1 = useTransform(scrollYProgress, [0.42, 0.48, 0.54], [0, -70, -120]);

  // Set 2 (new 4 cards): enters along circular arc between 0.50 -> 0.64, fully in place >= 0.64
  const opacitySet2 = useTransform(scrollYProgress, [0.50, 0.64], [0, 1]);
  const scaleSet2 = useTransform(scrollYProgress, [0.50, 0.64], [0.25, 1]);
  const arcRotLSet2 = useTransform(scrollYProgress, [0.50, 0.64], [180, 0]);
  const arcRotRSet2 = useTransform(scrollYProgress, [0.50, 0.64], [-180, 0]);
  const arcXLSet2 = useTransform(scrollYProgress, [0.50, 0.57, 0.64], [30, 90, 0]);
  const arcYLSet2 = useTransform(scrollYProgress, [0.50, 0.57, 0.64], [120, 70, 0]);
  const arcXRSet2 = useTransform(scrollYProgress, [0.50, 0.57, 0.64], [-30, -90, 0]);
  const arcYRSet2 = useTransform(scrollYProgress, [0.50, 0.57, 0.64], [120, 70, 0]);

  // Badge text switch between Set 1 and Set 2
  const badgeOpacity = useTransform(
    scrollYProgress,
    [0.46, 0.50, 0.54],
    [1, 0, 1]
  );
  const badgeText = useTransform(scrollYProgress, (v) =>
    v >= 0.5 ? 'Students Sharing Daily • Batch 02' : 'Top Resource Sharers • Batch 01'
  );

  return (
    <section ref={sectionRef} className="relative w-full h-[230vh]">
      {/* Sticky 100vh viewport container */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#ededf2] flex items-center justify-center select-none">
        {/* Radial light glow at center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 60% 75% at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(237,237,242,0) 100%)',
          }}
        />

        {/* ════════════════ SET 1 (Initial 4 Cards on Left & Right) ════════════════ */}
        {/* LEFT CARDS - SET 1 */}
        <PhotoCard
          left="3.5%"
          top="9%"
          width={122}
          height={164}
          image="/students_left.jpg"
          bgPos="0% 50%"
          rotate={rotL1}
          y={yL1}
          arcX={arcXLSet1}
          arcY={arcYLSet1}
          arcRot={arcRotLSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />
        <PhotoCard
          left="16%"
          top="16%"
          width={108}
          height={148}
          image="/students_left.jpg"
          bgPos="33.3% 50%"
          rotate={rotL2}
          y={yL2}
          arcX={arcXLSet1}
          arcY={arcYLSet1}
          arcRot={arcRotLSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />
        <PhotoCard
          left="18%"
          top="56%"
          width={98}
          height={136}
          image="/students_left.jpg"
          bgPos="66.6% 50%"
          rotate={rotL3}
          y={yL3}
          arcX={arcXLSet1}
          arcY={arcYLSet1}
          arcRot={arcRotLSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />
        <PhotoCard
          left="4.5%"
          top="68%"
          width={110}
          height={148}
          image="/students_left.jpg"
          bgPos="100% 50%"
          rotate={rotL4}
          y={yL4}
          arcX={arcXLSet1}
          arcY={arcYLSet1}
          arcRot={arcRotLSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />

        {/* RIGHT CARDS - SET 1 */}
        <PhotoCard
          right="18%"
          top="11%"
          width={108}
          height={148}
          image="/students_right.jpg"
          bgPos="0% 50%"
          rotate={rotR1}
          y={yR1}
          arcX={arcXRSet1}
          arcY={arcYRSet1}
          arcRot={arcRotRSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />
        <PhotoCard
          right="3.5%"
          top="8%"
          width={122}
          height={164}
          image="/students_right.jpg"
          bgPos="33.3% 50%"
          rotate={rotR2}
          y={yR2}
          arcX={arcXRSet1}
          arcY={arcYRSet1}
          arcRot={arcRotRSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />
        <PhotoCard
          right="4.5%"
          top="47%"
          width={120}
          height={166}
          image="/students_right.jpg"
          bgPos="66.6% 50%"
          rotate={rotR3}
          y={yR3}
          arcX={arcXRSet1}
          arcY={arcYRSet1}
          arcRot={arcRotRSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />
        <PhotoCard
          right="17%"
          top="68%"
          width={102}
          height={140}
          image="/students_right.jpg"
          bgPos="100% 50%"
          rotate={rotR4}
          y={yR4}
          arcX={arcXRSet1}
          arcY={arcYRSet1}
          arcRot={arcRotRSet1}
          scale={scaleSet1}
          opacity={opacitySet1}
        />

        {/* ════════════════ SET 2 (New 4 Cards on Left & Right) ════════════════ */}
        {/* LEFT CARDS - SET 2 */}
        <PhotoCard
          left="3.5%"
          top="9%"
          width={122}
          height={164}
          image="/students_left_2.jpg"
          bgPos="0% 50%"
          rotate={rotL1}
          y={yL1}
          arcX={arcXLSet2}
          arcY={arcYLSet2}
          arcRot={arcRotLSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />
        <PhotoCard
          left="16%"
          top="16%"
          width={108}
          height={148}
          image="/students_left_2.jpg"
          bgPos="33.3% 50%"
          rotate={rotL2}
          y={yL2}
          arcX={arcXLSet2}
          arcY={arcYLSet2}
          arcRot={arcRotLSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />
        <PhotoCard
          left="18%"
          top="56%"
          width={98}
          height={136}
          image="/students_left_2.jpg"
          bgPos="66.6% 50%"
          rotate={rotL3}
          y={yL3}
          arcX={arcXLSet2}
          arcY={arcYLSet2}
          arcRot={arcRotLSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />
        <PhotoCard
          left="4.5%"
          top="68%"
          width={110}
          height={148}
          image="/students_left_2.jpg"
          bgPos="100% 50%"
          rotate={rotL4}
          y={yL4}
          arcX={arcXLSet2}
          arcY={arcYLSet2}
          arcRot={arcRotLSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />

        {/* RIGHT CARDS - SET 2 */}
        <PhotoCard
          right="18%"
          top="11%"
          width={108}
          height={148}
          image="/students_right_2.jpg"
          bgPos="0% 50%"
          rotate={rotR1}
          y={yR1}
          arcX={arcXRSet2}
          arcY={arcYRSet2}
          arcRot={arcRotRSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />
        <PhotoCard
          right="3.5%"
          top="8%"
          width={122}
          height={164}
          image="/students_right_2.jpg"
          bgPos="33.3% 50%"
          rotate={rotR2}
          y={yR2}
          arcX={arcXRSet2}
          arcY={arcYRSet2}
          arcRot={arcRotRSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />
        <PhotoCard
          right="4.5%"
          top="47%"
          width={120}
          height={166}
          image="/students_right_2.jpg"
          bgPos="66.6% 50%"
          rotate={rotR3}
          y={yR3}
          arcX={arcXRSet2}
          arcY={arcYRSet2}
          arcRot={arcRotRSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />
        <PhotoCard
          right="17%"
          top="68%"
          width={102}
          height={140}
          image="/students_right_2.jpg"
          bgPos="100% 50%"
          rotate={rotR4}
          y={yR4}
          arcX={arcXRSet2}
          arcY={arcYRSet2}
          arcRot={arcRotRSet2}
          scale={scaleSet2}
          opacity={opacitySet2}
        />

        {/* ─── Center content ─── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-md"
        >
          {/* Subtle live indicator badge */}
          <motion.div
            style={{ opacity: badgeOpacity }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 shadow-sm border border-slate-200/60 mb-5"
          >
            <span className="w-2 h-2 rounded-full bg-violet-600 animate-ping" />
            <motion.span className="text-xs font-semibold text-slate-700">
              {badgeText}
            </motion.span>
          </motion.div>

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
        </motion.div>
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


