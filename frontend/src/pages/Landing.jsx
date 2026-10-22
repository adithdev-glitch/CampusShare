import { Link } from 'react-router-dom';
import { ShieldCheck, CheckCircle, Users, Eye, Lightbulb, BookOpen, Music, Star } from 'lucide-react';
import CommunitySection from '../components/CommunitySection';
import IntegrationsSection from '../components/IntegrationsSection';

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



const Landing = () => {
  // Card top-left positions inside 900×310 viewBox
  const C = {
    p1:     { x: 44,  y: 128 },
    idea:   { x: 168, y: 42  },
    balloon:{ x: 178, y: 218 },
    center: { x: 400, y: 80  },
    shield: { x: 638, y: 34  },
    eyes:   { x: 752, y: 130 },
    p2:     { x: 648, y: 218 },
    book:   { x: 836, y: 218 },  // right of p2
    music:  { x: 0,   y: 42  },  // far left
    star:   { x: 820, y: 0   },  // above eyes
  };
  const H = { p1: 28, idea: 28, balloon: 28, center: 40, shield: 28, eyes: 32, p2: 28, book: 27, music: 27, star: 26 };

  return (
    <div className="relative bg-white min-h-screen overflow-x-clip">
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
            {/* new branches */}
            <DotLine x1={C.eyes.x + H.eyes} y1={C.eyes.y + H.eyes} x2={C.book.x + H.book} y2={C.book.y + H.book} />
            <DotLine x1={C.music.x + H.music} y1={C.music.y + H.music} x2={C.p1.x + H.p1} y2={C.p1.y + H.p1} />
            <DotLine x1={C.eyes.x + H.eyes} y1={C.eyes.y + H.eyes} x2={C.star.x + H.star} y2={C.star.y + H.star} />
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

          {/* Book — branching right of p2 & eyes */}
          <FloatCard style={{ left: C.book.x, top: C.book.y, width: 54, height: 54, background: '#10B981' }}>
            <BookOpen className="w-7 h-7 text-white" />
          </FloatCard>

          {/* Music — branching far-left, connected to p1 & balloon */}
          <FloatCard style={{ left: C.music.x, top: C.music.y, width: 54, height: 54, background: '#6366F1' }}>
            <Music className="w-7 h-7 text-white" />
          </FloatCard>

          {/* Star — branching upward from Eye */}
          <FloatCard style={{ left: C.star.x, top: C.star.y, width: 52, height: 52, background: '#FBBF24', boxShadow: '0 6px 20px rgba(251,191,36,0.38)' }}>
            <Star className="w-6 h-6 text-white" />
          </FloatCard>
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

      {/* ── Integrations Section (Tools Fan) ── */}
      <IntegrationsSection />

    </div>
  );
};

export default Landing;


