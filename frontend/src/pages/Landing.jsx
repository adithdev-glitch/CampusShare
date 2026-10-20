import React from 'react';
import { Link } from 'react-router-dom';
import { Cpu, Box, ShieldCheck, HeartHandshake, Compass, PlusCircle, CheckCircle, IndianRupee, Users } from 'lucide-react';

const Landing = () => {
  return (
    <div className="relative overflow-hidden bg-slate-50 min-h-screen">
      {/* Visual background accents */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl animate-soft-pulse"></div>
      <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-soft-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Hero Section */}
      <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 text-center relative z-10">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100 mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Exclusive College Resource Sharing Network</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 font-outfit max-w-4xl mx-auto leading-tight">
          Share Resources. Save Money.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-600">
            Build a Sustainable Campus.
          </span>
        </h1>

        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mt-6 leading-relaxed">
          A secure campus platform where students can lend and borrow academic, project, and hostel resources from each other.
        </p>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            to="/explore"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 shadow-lg shadow-indigo-600/20 hover:scale-102 active:scale-98 transition-all flex items-center space-x-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Explore Resources</span>
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl text-sm font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 hover:scale-102 active:scale-98 transition-all flex items-center space-x-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>List a Resource</span>
          </Link>
        </div>

        {/* Floating cards placeholder layout representing equipment */}
        <div className="mt-16 border border-slate-200/80 p-4 rounded-3xl bg-slate-100/50 max-w-4xl mx-auto shadow-premium flex flex-wrap gap-4 justify-center items-center">
          <div className="bg-white p-4 rounded-2xl shadow-premium border border-slate-100 flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-800">Arduino UNO</h4>
              <p className="text-[10px] text-slate-400">Available to borrow</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-premium border border-slate-100 flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
              <Box className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-800">Casio fx-991ES</h4>
              <p className="text-[10px] text-slate-400">Lent by Rahul K</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-premium border border-slate-100 flex items-center space-x-3 hover:scale-105 transition-transform duration-300">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h4 className="font-bold text-xs text-slate-800">Electric Kettle</h4>
              <p className="text-[10px] text-slate-400">Returned safely</p>
            </div>
          </div>
        </div>
      </header>

      {/* How It Works */}
      <section className="bg-white border-y border-slate-200/60 py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-outfit text-slate-900">How It Works</h2>
            <p className="text-slate-500 text-sm mt-2">Sharing resources within your college community in 4 easy steps</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { num: '1', title: 'List', desc: 'List academic, project, or hostel resources you own and want to share.' },
              { num: '2', title: 'Discover', desc: 'Search and filter for sensors, textbooks, or tools you need temporarily.' },
              { num: '3', title: 'Borrow', desc: 'Send borrowing request details and wait for owner approvals.' },
              { num: '4', title: 'Return', desc: 'Hand items back and verify returns safely using secure QR verification codes.' }
            ].map((step, idx) => (
              <div key={idx} className="text-center relative group p-4 hover:bg-slate-50 rounded-2xl transition-colors duration-300">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 font-extrabold text-lg rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                  {step.num}
                </div>
                <h3 className="font-bold text-lg text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold font-outfit text-slate-900">Browse by Category</h2>
          <p className="text-slate-500 text-sm mt-2">Discover resources shared by students sorted by utility</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { name: 'Electronics', count: 'Electronics microcontrollers, IoT boards' },
            { name: 'Project Kits', count: 'Robotics kits, line followers' },
            { name: 'Lab Equipment', count: 'Multimeters, verniers, probes' },
            { name: 'Books', count: 'Academic textbooks, references' },
            { name: 'Calculators', count: 'Scientific and math calculators' },
            { name: 'Computer Accessories', count: 'Coolers, mice, hubs, adapters' },
            { name: 'Hostel Essentials', count: 'Kettles, iron boxes, table fans' },
            { name: 'Sports Equipment', count: 'Rackets, shunts, soccer balls' }
          ].map((cat, idx) => (
            <Link
              key={idx}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-indigo-500/30 shadow-premium hover:shadow-indigo-500/5 hover:scale-102 transition-all duration-300"
            >
              <h4 className="font-bold text-sm text-slate-800 text-left mb-1">{cat.name}</h4>
              <p className="text-[10px] text-slate-400 text-left truncate">{cat.count}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-indigo-950 text-white py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-950 to-slate-950 opacity-95"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold font-outfit">Platform Benefits</h2>
            <p className="text-indigo-200 text-sm mt-2">Why students love using CampusShare</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: <IndianRupee className="w-6 h-6" />, title: 'Save Money', desc: 'Avoid purchasing expensive items (e.g. lab accessories, calculators) that are only needed temporarily.' },
              { icon: <CheckCircle className="w-6 h-6" />, title: 'Reduce Waste', desc: 'Reuse resources (e.g. starter sensor modules) that would otherwise gather dust in hostel lockers.' },
              { icon: <Compass className="w-6 h-6" />, title: 'Easy Access', desc: 'Locate tools and resources available directly within your department laboratories or hosteling wings.' },
              { icon: <Users className="w-6 h-6" />, title: 'Trusted Community', desc: 'College email verification, star rating metrics, and transaction tracking ensure items are safely returned.' }
            ].map((benefit, idx) => (
              <div key={idx} className="bg-white/5 p-6 rounded-2xl border border-white/10 hover:border-indigo-400/30 transition-all">
                <div className="text-indigo-400 mb-4 inline-block p-3 rounded-xl bg-white/5">
                  {benefit.icon}
                </div>
                <h3 className="font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-slate-300 text-xs leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Landing;
