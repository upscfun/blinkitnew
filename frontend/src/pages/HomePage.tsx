import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, Clock, Shield } from 'lucide-react';
import { productApi, categoryApi } from '../api/product.api';
import ProductCard from '../components/product/ProductCard';
import { Category } from '../types';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('');

  const { data: catData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const { data: productData, isLoading } = useQuery({
    queryKey: ['products', activeCategory],
    queryFn: () => productApi.getAll({ limit: 40, category: activeCategory || undefined }),
  });

  const categories: Category[] = catData?.data?.data || [];
  const products = productData?.data?.data || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blink-yellow via-yellow-300 to-orange-200 rounded-2xl p-6 md:p-10 mb-8 relative overflow-hidden">
        <div className="relative z-10 max-w-lg">
          <div className="inline-flex items-center gap-1.5 bg-blink-green text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
            <Zap size={12} /> Now available in your area
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-blink-dark leading-tight">
            Groceries in <br />
            <span className="text-blink-green">15 minutes</span>
          </h1>
          <p className="mt-3 text-gray-700 text-base md:text-lg">
            Order from 5000+ products. Fresh, fast, and delivered to your door.
          </p>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Clock size={16} className="text-blink-green" /> 15 min delivery
            </div>
            <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
              <Shield size={16} className="text-blink-green" /> 100% fresh
            </div>
          </div>
        </div>
        <div className="absolute right-6 bottom-0 text-[120px] opacity-20 select-none">🛒</div>
      </div>

      {/* Value props */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: '⚡', title: '15-min delivery', desc: 'From dark store to doorstep' },
          { icon: '🛡️', title: 'Best quality', desc: 'Hand-picked products' },
          { icon: '💰', title: 'Great prices', desc: 'Lowest prices guaranteed' },
        ].map(item => (
          <div key={item.title} className="card p-4 text-center">
            <div className="text-2xl mb-2">{item.icon}</div>
            <div className="text-sm font-semibold text-gray-800">{item.title}</div>
            <div className="text-xs text-gray-500 mt-0.5">{item.desc}</div>
          </div>
        ))}
      </div>

      {/* Categories */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Shop by Category</h2>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveCategory('')}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
              activeCategory === '' ? 'border-blink-yellow bg-yellow-50' : 'border-gray-100 bg-white hover:border-gray-200'
            }`}
          >
            <span className="text-2xl">🏪</span>
            <span className="text-xs font-medium text-gray-700 whitespace-nowrap">All</span>
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.slug)}
              className={`flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border-2 transition-all ${
                activeCategory === cat.slug ? 'border-blink-yellow bg-yellow-50' : 'border-gray-100 bg-white hover:border-gray-200'
              }`}
            >
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-8 h-8 object-contain" />
              ) : (
                <span className="text-2xl">📦</span>
              )}
              <span className="text-xs font-medium text-gray-700 whitespace-nowrap max-w-[80px] truncate">{cat.name}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Products */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            {activeCategory ? categories.find(c => c.slug === activeCategory)?.name : 'All Products'}
            {products.length > 0 && <span className="text-base font-normal text-gray-400 ml-2">({products.length})</span>}
          </h2>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="card p-3 animate-pulse">
                <div className="aspect-square bg-gray-200 rounded-xl mb-3" />
                <div className="h-3 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>
    </div>
  );
}
