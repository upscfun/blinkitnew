import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, Search, MapPin, ChevronDown, Settings } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useCartStore } from '../../store/cartStore';
import { productApi } from '../../api/product.api';
import { Product } from '../../types';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const { totalItems, openCart } = useCartStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setShowUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const t = setTimeout(async () => {
      try {
        const res = await productApi.search(query);
        setResults(res.data.data || []);
        setShowResults(true);
      } catch { setResults([]); }
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-1.5 flex-shrink-0">
          <div className="w-8 h-8 bg-blink-yellow rounded-lg flex items-center justify-center">
            <span className="text-lg">⚡</span>
          </div>
          <span className="font-extrabold text-xl text-blink-dark">BlinkMart</span>
        </Link>

        {/* Location pill */}
        <div className="hidden sm:flex items-center gap-1 text-sm text-gray-600 cursor-pointer hover:text-blink-green transition-colors">
          <MapPin size={14} className="text-blink-green" />
          <span className="font-medium">Bangalore</span>
          <span className="text-gray-400">560001</span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>

        {/* Search */}
        <div ref={searchRef} className="flex-1 relative max-w-xl">
          <div className="flex items-center gap-2 bg-gray-100 rounded-xl px-3 py-2">
            <Search size={16} className="text-gray-400 flex-shrink-0" />
            <input
              value={query}
              onChange={e => { setQuery(e.target.value); if (e.target.value.trim()) setShowResults(true); }}
              onFocus={() => results.length > 0 && setShowResults(true)}
              placeholder='Search "milk", "chips", "shampoo"...'
              className="bg-transparent flex-1 text-sm outline-none placeholder-gray-400"
            />
            {query && (
              <button onClick={() => { setQuery(''); setResults([]); setShowResults(false); }}
                className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
            )}
          </div>

          {showResults && results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              {results.map(p => (
                <button
                  key={p.id}
                  onClick={() => { setQuery(''); setShowResults(false); navigate(`/products/${p.slug}`); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left"
                >
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-contain rounded-lg bg-gray-50" />
                  <div>
                    <div className="text-sm font-medium text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500">{p.unit} · ₹{p.price}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {user ? (
            <>
              <button
                onClick={openCart}
                className="relative flex items-center gap-2 bg-blink-yellow text-blink-dark font-semibold px-4 py-2 rounded-xl hover:bg-yellow-400 active:scale-95 transition-all text-sm"
              >
                <ShoppingCart size={18} />
                <span className="hidden sm:inline">Cart</span>
                {totalItems() > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blink-green text-white text-xs rounded-full flex items-center justify-center font-bold">
                    {totalItems()}
                  </span>
                )}
              </button>

              <div ref={userMenuRef} className="relative">
                <button
                  onClick={() => setShowUserMenu(v => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700"
                >
                  <div className="w-7 h-7 bg-blink-yellow rounded-full flex items-center justify-center text-xs font-bold text-blink-dark">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[80px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl w-52 z-50 overflow-hidden animate-fade-in">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-gray-800 text-sm">{user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                    {[
                      { icon: User, label: 'Profile', to: '/profile' },
                      { icon: Package, label: 'My Orders', to: '/orders' },
                      ...(user.role === 'ADMIN' ? [{ icon: Settings, label: 'Admin Panel', to: '/admin' }] : []),
                    ].map(item => (
                      <Link
                        key={item.to}
                        to={item.to}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-sm text-gray-700"
                      >
                        <item.icon size={15} className="text-gray-400" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-50 text-sm text-red-500 border-t border-gray-100"
                    >
                      <LogOut size={15} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="text-sm font-medium text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                Login
              </Link>
              <Link to="/register" className="btn-primary text-sm !py-2 !px-4">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
