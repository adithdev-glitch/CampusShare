import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { PlusCircle, Image, Info, CheckCircle, Package } from 'lucide-react';

const categories = [
  'Electronics', 'Project Kits', 'Lab Equipment', 'Books', 
  'Calculators', 'Computer Accessories', 'Hostel Essentials', 'Sports Equipment'
];
const conditions = ['Excellent', 'Good', 'Fair', 'Needs Repair'];

const ListResource = () => {
  const { token, user, API_URL } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'Electronics',
    description: '',
    imageUrl: '',
    condition: 'Excellent',
    quantity: 1,
    maxBorrowDuration: 7,
    location: '',
    accessories: '',
    suitableFor: '',
    tags: '',
    isPaid: false,
    price: 0,
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, category, description, imageUrl, condition, quantity, location, maxBorrowDuration, isPaid, price } = formData;

    if (!name || !category || !description || !condition || !location) {
      setError('Please fill in all required fields.');
      return;
    }

    setError('');
    setLoading(true);

    // Format list values
    const accessoriesArray = formData.accessories ? formData.accessories.split(',').map(i => i.trim()).filter(Boolean) : [];
    const suitableForArray = formData.suitableFor ? formData.suitableFor.split(',').map(i => i.trim()).filter(Boolean) : [];
    const tagsArray = formData.tags ? formData.tags.split(',').map(i => i.trim()).filter(Boolean) : [];

    const defaultImage = 'https://images.unsplash.com/photo-1517055720730-0766be088582?auto=format&fit=crop&q=80&w=400';

    try {
      const res = await axios.post(
        `${API_URL}/resources`,
        {
          name,
          category,
          description,
          images: imageUrl ? [imageUrl] : [defaultImage],
          condition,
          quantity: parseInt(quantity),
          maxBorrowDuration: parseInt(maxBorrowDuration),
          location,
          accessories: accessoriesArray,
          suitableFor: suitableForArray,
          tags: tagsArray,
          department: user?.department || 'General',
          isPaid,
          price: isPaid ? parseFloat(price) : 0,
        },
        {
          headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
        }
      );

      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => {
          setSuccess(false);
          navigate('/listings');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to list resource.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-left">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 font-outfit">Share a New Resource</h1>
        <p className="text-sm text-slate-500 mt-1">Provide details of your unused equipment to share it with college members.</p>
      </div>

      <div className="glass-card p-8 rounded-3xl border border-slate-200 bg-white shadow-premium">
        
        {success ? (
          <div className="text-center py-10 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-slate-800 font-outfit">Resource successfully listed!</h3>
            <p className="text-slate-500 text-sm mt-2">Your item is now available for borrowing on the explore board.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs flex items-center space-x-1.5">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Resource Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Resource Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Arduino UNO R3 Board"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm appearance-none"
                >
                  {categories.map((cat, idx) => (
                    <option key={idx} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Item Description *
              </label>
              <textarea
                name="description"
                required
                rows={3}
                placeholder="Detail the specs, use-cases, and general warning instructions..."
                value={formData.description}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Condition */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Condition *
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm appearance-none"
                >
                  {conditions.map((c, idx) => (
                    <option key={idx} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  min={1}
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>

              {/* Max borrow limit */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Max Duration (Days)
                </label>
                <input
                  type="number"
                  name="maxBorrowDuration"
                  min={1}
                  value={formData.maxBorrowDuration}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Pickup location */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Pickup Location *
                </label>
                <input
                  type="text"
                  name="location"
                  required
                  placeholder="e.g. CSE Lab block B, Hostel block A room 302"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Image URL (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="imageUrl"
                    placeholder="https://images.unsplash.com/..."
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="w-full p-3 pl-10 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Image className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
              {/* Rent Type Option */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  Pricing Option
                </label>
                <div className="flex space-x-6 mt-2">
                  <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="isPaid"
                      checked={!formData.isPaid}
                      onChange={() => setFormData({ ...formData, isPaid: false, price: 0 })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="font-semibold text-slate-700">Free to Borrow</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="isPaid"
                      checked={formData.isPaid}
                      onChange={() => setFormData({ ...formData, isPaid: true })}
                      className="w-4 h-4 text-indigo-600 focus:ring-indigo-500 border-slate-300"
                    />
                    <span className="font-semibold text-slate-700">Paid Rental</span>
                  </label>
                </div>
              </div>

              {/* Price per day */}
              {formData.isPaid && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 animate-in fade-in duration-200">
                    Daily Rent Price (INR) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    required
                    min={1}
                    placeholder="e.g. 50"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-white text-sm animate-in fade-in slide-in-from-top-1 duration-200"
                  />
                </div>
              )}
            </div>

            <div className="h-[1px] bg-slate-100 my-2"></div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Accessories */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Accessories Included
                </label>
                <span className="text-[10px] text-slate-400 block mb-2">Comma separated</span>
                <input
                  type="text"
                  name="accessories"
                  placeholder="USB Cable, Breadboard"
                  value={formData.accessories}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>

              {/* Suitable for */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Suitable For
                </label>
                <span className="text-[10px] text-slate-400 block mb-2">Comma separated</span>
                <input
                  type="text"
                  name="suitableFor"
                  placeholder="IoT Projects, Robotics"
                  value={formData.suitableFor}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Search Tags
                </label>
                <span className="text-[10px] text-slate-400 block mb-2">Comma separated</span>
                <input
                  type="text"
                  name="tags"
                  placeholder="arduino, microcontroller, sensor"
                  value={formData.tags}
                  onChange={handleChange}
                  className="w-full p-3 rounded-xl border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 bg-slate-50/50 text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl active:scale-98 transition-all flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Publish Resource</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ListResource;
