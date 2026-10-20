import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, RefreshCw, Star, MapPin, Calendar, Heart, Shield } from 'lucide-react';

const categories = [
  'Electronics', 'Project Kits', 'Lab Equipment', 'Books', 
  'Calculators', 'Computer Accessories', 'Hostel Essentials', 'Sports Equipment'
];
const departmentsList = ['CSE', 'ECE', 'EEE', 'Mechanical', 'IT', 'Civil'];
const conditionsList = ['Excellent', 'Good', 'Fair', 'Needs Repair'];

const Explore = () => {
  const { user, toggleWishlist, API_URL } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [department, setDepartment] = useState('');
  const [condition, setCondition] = useState('');
  const [availability, setAvailability] = useState('');
  const [location, setLocation] = useState('');
  const [maxBorrowDuration, setMaxBorrowDuration] = useState('');
  const [sort, setSort] = useState('Recently Added');

  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sync category param from URL if matching
  useEffect(() => {
    const catParam = searchParams.get('category');
    if (catParam) {
      setCategory(catParam);
    }
  }, [searchParams]);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (category) params.category = category;
      if (department) params.department = department;
      if (condition) params.condition = condition;
      if (availability) params.availability = availability;
      if (location) params.location = location;
      if (maxBorrowDuration) params.maxBorrowDuration = maxBorrowDuration;
      if (sort) params.sort = sort;

      const res = await axios.get(`${API_URL}/resources`, { params });
      if (res.data.success) {
        setResources(res.data.resources || []);
      }
    } catch (err) {
      console.error('Fetch explore resources failed:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [category, department, condition, availability, maxBorrowDuration, sort]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setDepartment('');
    setCondition('');
    setAvailability('');
    setLocation('');
    setMaxBorrowDuration('');
    setSort('Recently Added');
    setSearchParams({});
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchResources();
  };

  const handleWishlistToggle = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert('Please log in to add items to your wishlist.');
      return;
    }
    await toggleWishlist(id);
  };

  const isItemWishlisted = (id) => {
    return user?.wishlist?.includes(id);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 text-left">
        <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Explore Resources</h1>
        <p className="text-sm text-slate-500 mt-1">Discover, request, and borrow textbook notes or engineering kits shared on campus.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Side: Filter Sidebar */}
        <div className="glass-card p-6 rounded-2xl border border-slate-200 bg-white h-fit shadow-premium">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-6">
            <span className="font-bold text-slate-800 text-sm flex items-center space-x-1.5 font-outfit">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Filters</span>
            </span>
            <button
              onClick={handleResetFilters}
              className="text-xs text-slate-400 hover:text-indigo-600 font-bold flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          <form className="space-y-4 text-left">
            {/* Category Select */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50 appearance-none"
              >
                <option value="">All Categories</option>
                {categories.map((c, idx) => (
                  <option key={idx} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Department Select */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Owner Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50 appearance-none"
              >
                <option value="">All Departments</option>
                {departmentsList.map((d, idx) => (
                  <option key={idx} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Condition Select */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Item Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50 appearance-none"
              >
                <option value="">Any Condition</option>
                {conditionsList.map((cond, idx) => (
                  <option key={idx} value={cond}>{cond}</option>
                ))}
              </select>
            </div>

            {/* Availability */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Availability
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50 appearance-none"
              >
                <option value="">All Items</option>
                <option value="true">Available Now</option>
                <option value="false">Currently Borrowed</option>
              </select>
            </div>

            {/* Max duration limit */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Max Borrow Duration
              </label>
              <select
                value={maxBorrowDuration}
                onChange={(e) => setMaxBorrowDuration(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-indigo-600 bg-slate-50/50 appearance-none"
              >
                <option value="">Any Duration</option>
                <option value="3">Up to 3 Days</option>
                <option value="7">Up to 7 Days</option>
                <option value="14">Up to 14 Days</option>
              </select>
            </div>
          </form>
        </div>

        {/* Right Side: Search and Listings grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar and sorting select */}
          <div className="flex flex-col sm:flex-row gap-4">
            <form onSubmit={handleSearchSubmit} className="flex-grow">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Arduino, Casio, cooler..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/20 shadow-premium text-sm"
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>
            </form>
            
            {/* Sorting Select */}
            <div className="w-full sm:w-48">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="w-full p-3 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-600 bg-white shadow-premium appearance-none"
              >
                <option value="Recently Added">Sort: Recently Added</option>
                <option value="Most Borrowed">Sort: Most Borrowed</option>
                <option value="Highest Rated">Sort: Highest Rated</option>
                <option value="Available Now">Sort: Available Now</option>
              </select>
            </div>
          </div>

          {/* Grid display */}
          {loading ? (
            <div className="py-20 flex justify-center items-center">
              <div className="relative w-10 h-10">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            </div>
          ) : resources.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-premium flex flex-col items-center">
              <Shield className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-bold text-slate-800 font-outfit">No resources found</h3>
              <p className="text-sm text-slate-500 mt-2 max-w-sm">We couldn't find any resources matching your search. Try resetting filters or testing other terms.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((item) => (
                <Link
                  key={item._id}
                  to={`/resources/${item._id}`}
                  className="bg-white rounded-3xl border border-slate-200 shadow-premium hover:shadow-indigo-500/5 hover:border-indigo-500/20 hover:scale-102 transition-all duration-300 overflow-hidden flex flex-col group relative"
                >
                  {/* Image wrapper */}
                  <div className="relative">
                    <img 
                      src={item.images[0]} 
                      alt={item.name} 
                      className="w-full h-44 object-cover bg-slate-100" 
                    />
                    
                    {/* Wishlist Button Overlay */}
                    {user && (
                      <button
                        onClick={(e) => handleWishlistToggle(e, item._id)}
                        className="absolute top-3 right-3 p-2 bg-white/80 hover:bg-white text-rose-500 rounded-full backdrop-blur-sm shadow-premium transition-all hover:scale-110 cursor-pointer"
                        title="Add to Wishlist"
                      >
                        <Heart className={`w-4 h-4 ${isItemWishlisted(item._id) ? 'fill-rose-500' : ''}`} />
                      </button>
                    )}

                    {/* Status Badge */}
                    <span className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                      item.availability ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                    }`}>
                      {item.availability ? 'Available' : 'Borrowed'}
                    </span>
                  </div>

                  {/* Body Card */}
                  <div className="p-5 flex-grow flex flex-col justify-between text-left">
                    <div className="space-y-1.5">
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold uppercase">{item.category}</span>
                      <h4 className="font-bold text-sm text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors pt-1 truncate">{item.name}</h4>
                      <p className="text-[10px] text-slate-400 flex items-center space-x-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.location}</span>
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Max {item.maxBorrowDuration} days</span>
                        </div>
                        <span className="px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 font-semibold">{item.condition}</span>
                      </div>
                      
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={item.ownerId?.profileImage} 
                            alt="" 
                            className="w-6 h-6 rounded-full object-cover" 
                          />
                          <span className="text-xs text-slate-500 truncate max-w-[80px]">{item.ownerId?.name.split(' ')[0]}</span>
                        </div>
                        
                        <div className="flex items-center space-x-0.5 text-xs font-bold text-yellow-500">
                          <Star className="w-3.5 h-3.5 fill-yellow-500" />
                          <span>{item.ownerId?.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Explore;
