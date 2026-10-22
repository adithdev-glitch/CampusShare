import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';

/* ── Floating Photo Card (Mounted on a rotating CD platter) ── */
const PhotoCard = ({
  style,
  width = 148,
  height = 198,
  image,
  bgPos,
  counterRotate,
  opacity,
  y,
}) => (
  <motion.div
    className="absolute z-10 will-change-transform pointer-events-none"
    style={{
      ...style,
      opacity,
    }}
  >
    <motion.div
      className="rounded-[26px] overflow-hidden border-[3px] border-white will-change-transform pointer-events-auto cursor-pointer"
      style={{
        width,
        height,
        rotate: counterRotate,
        y,
        boxShadow: '0 18px 40px rgba(0,0,0,0.15)',
      }}
      whileHover={{ scale: 1.07 }}
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
  </motion.div>
);

/* ── Community Showcase Section with Dual Rotating CDs on Left & Right ── */
const CommunitySection = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 90%', 'end end'],
  });

  /* ── 1. Subtle Individual Floating Physics ── */
  const float1 = useTransform(scrollYProgress, [0, 1], [12, -12]);
  const float2 = useTransform(scrollYProgress, [0, 1], [-10, 10]);
  const float3 = useTransform(scrollYProgress, [0, 1], [14, -14]);
  const float4 = useTransform(scrollYProgress, [0, 1], [-12, 12]);
  const floatArray = [float1, float2, float3, float4, float1, float2, float3, float4];

  /* ── 2. Both CDs rotate 180° roundward like a real CD ── */
  const leftCdRotation = useTransform(scrollYProgress, [0.20, 0.80], [0, 180]);
  const rightCdRotation = useTransform(scrollYProgress, [0.20, 0.80], [0, 180]);

  /* ── 3. Smooth Card Counter-Rotation with 11° dynamic bank tilt ── */
  const cardRotLeft = useTransform(
    scrollYProgress,
    [0.0, 0.20, 0.38, 0.50, 0.62, 0.80, 1.0],
    [0, 0, -43, -79, -127, -180, -180]
  );
  const cardRotRight = useTransform(
    scrollYProgress,
    [0.0, 0.20, 0.38, 0.50, 0.62, 0.80, 1.0],
    [0, 0, -65, -101, -149, -180, -180]
  );

  /* ── 4. Card Opacity: 4 visible divs rotate away, 4 hidden divs rotate in ── */
  const set1Opacity = useTransform(
    scrollYProgress,
    [0.0, 0.16, 0.38, 0.56],
    [0, 1, 1, 0]
  );
  const set2Opacity = useTransform(
    scrollYProgress,
    [0.44, 0.62, 0.82, 1.0],
    [0, 1, 1, 1]
  );

  /* ── 5. Gentle Entrance from bottom on initial scroll ── */
  const entranceY = useTransform(scrollYProgress, [0.0, 0.18], [50, 0]);
  const entranceOpacity = useTransform(scrollYProgress, [0.0, 0.16], [0, 1]);

  /* ── 6. Paragraph text — cycles through 3 messages across the scroll ── */
  const paraText = useTransform(scrollYProgress, (v) => {
    if (v < 0.4)
      return 'Connect with students across campus — share resources and build a sustainable college community together.';
    if (v < 0.7)
      return 'Discover what your fellow students have to offer — from textbooks to tools, everything in one place.';
    return 'Join thousands of campus members already sharing — make college life more accessible for everyone.';
  });

  // Briefly fade out at the two transition points so the text swap feels smooth
  const paraOpacity = useTransform(
    scrollYProgress,
    [0.0, 0.35, 0.40, 0.45, 0.65, 0.70, 0.75, 1.0],
    [1, 1, 0, 1, 1, 0, 1, 1]
  );

  /* ── Helper to calculate card position around the CD platter ── */
  const CD_SIZE = 760;
  const CD_CENTER = CD_SIZE / 2; // 380px
  const CD_RADIUS = 360; // Radius where cards are stuck on the CD

  const getCardStyle = (deg) => {
    const rad = (deg * Math.PI) / 180;
    return {
      left: CD_CENTER + CD_RADIUS * Math.cos(rad) - 74,
      top: CD_CENTER + CD_RADIUS * Math.sin(rad) - 99,
    };
  };

  /* 
    LEFT CD (8 divs placed on CD):
    - 4 visible divs (Set 1) facing screen center: [-62°, -21°, +21°, +62°]
    - 4 hidden divs (Set 2) on the other part of CD: 180° offset
  */
  const leftCardAngles = [-62, -21, 21, 62, 118, 159, 201, 242];
  const leftCardImages = [
    { image: '/left1.jpg', isSet2: false },
    { image: '/left2.jpg', isSet2: false },
    { image: '/left3.jpg', isSet2: false },
    { image: '/left4.jpg', isSet2: false },
    { image: '/left5.jpg', isSet2: true },
    { image: '/left6.jpg', isSet2: true },
    { image: '/left7.jpg', isSet2: true },
    { image: '/left3.jpg', isSet2: true },
  ];

  /* 
    RIGHT CD (8 divs placed on CD):
    - 4 visible divs (Set 1) facing screen center: [118°, 159°, 201°, 242°]
    - 4 hidden divs (Set 2) on the other part of CD: 180° offset [-62°, -21°, +21°, +62°]
  */
  const rightCardAngles = [118, 159, 201, 242, -62, -21, 21, 62];
  const rightCardImages = [
    { image: '/left3.jpg', isSet2: false },
    { image: '/left7.jpg', isSet2: false },
    { image: '/left6.jpg', isSet2: false },
    { image: '/left5.jpg', isSet2: false },
    { image: '/left4.jpg', isSet2: true },
    { image: '/left3.jpg', isSet2: true },
    { image: '/left2.jpg', isSet2: true },
    { image: '/left1.jpg', isSet2: true },
  ];

  return (
    <section ref={sectionRef} className="relative w-full h-[280vh]">
      {/* Pinned 100vh viewport */}
      <div className="sticky top-0 w-full h-screen overflow-hidden bg-[#f8f9fa] flex items-center justify-center select-none">
        {/* Radial light glow at center */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 65% 80% at 50% 50%, rgba(255,255,255,0.98) 0%, rgba(244,245,248,0.7) 100%)',
          }}
        />

        {/* ════════════════ LEFT CD (All 8 Divs Placed on CD) ════════════════ */}
        <motion.div
          className="absolute pointer-events-none select-none"
          style={{
            width: CD_SIZE,
            height: CD_SIZE,
            left: 0,
            top: '50%',
            x: '-60%',
            y: entranceY,
            marginTop: -CD_CENTER,
            rotate: leftCdRotation,
            opacity: entranceOpacity,
          }}
        >
          {/* All 8 divs mounted on Left CD */}
          {leftCardImages.map((card, idx) => (
            <PhotoCard
              key={`left-card-${idx}`}
              style={getCardStyle(leftCardAngles[idx])}
              image={card.image}
              bgPos={card.bgPos}
              counterRotate={cardRotLeft}
              opacity={card.isSet2 ? set2Opacity : set1Opacity}
              y={floatArray[idx]}
            />
          ))}
        </motion.div>

        {/* ════════════════ RIGHT CD (All 8 Divs Placed on CD) ════════════════ */}
        <motion.div
          className="absolute pointer-events-none select-none"
          style={{
            width: CD_SIZE,
            height: CD_SIZE,
            right: 0,
            top: '50%',
            x: '60%',
            y: entranceY,
            marginTop: -CD_CENTER,
            rotate: rightCdRotation,
            opacity: entranceOpacity,
          }}
        >
          {/* All 8 divs mounted on Right CD */}
          {rightCardImages.map((card, idx) => (
            <PhotoCard
              key={`right-card-${idx}`}
              style={getCardStyle(rightCardAngles[idx])}
              image={card.image}
              bgPos={card.bgPos}
              counterRotate={cardRotRight}
              opacity={card.isSet2 ? set2Opacity : set1Opacity}
              y={floatArray[idx]}
            />
          ))}
        </motion.div>

        {/* ─── Center content ─── */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center px-6 max-w-md">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Campus<br />Community
          </h2>
          <motion.p
            style={{ opacity: paraOpacity }}
            className="mt-4 text-slate-500 text-sm md:text-base leading-relaxed max-w-sm"
          >
            {paraText}
          </motion.p>
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
      </div>
    </section>
  );
};

export default CommunitySection;
