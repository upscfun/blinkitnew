import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Plus, Minus, Trash2, ShieldCheck, Zap } from 'lucide-react';
import { productApi } from '../api/product.api';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { data, isLoading } = useQuery({
    queryKey: ['product', slug],
    queryFn: () => productApi.getBySlug(slug!),
    enabled: !!slug,
  });

  const { addItem, updateItem, removeItem, getItemQuantity, cart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const product = data?.data?.data;
  const qty = product ? getItemQuantity(product.id) : 0;
  const cartItem = cart?.items.find(i => i.productId === product?.id);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-6 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-8 bg-gray-200 rounded w-1/4" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">Product not found</p>
        <Link to="/" className="btn-primary mt-4 inline-block">Go Home</Link>
      </div>
    );
  }

  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <Link to="/" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-6">
        <ChevronLeft size={16} /> Back to products
      </Link>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-center p-8">
          <img src={product.images[0]} alt={product.name} className="max-w-full max-h-full object-contain" />
        </div>

        {/* Details */}
        <div>
          {product.brand && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">{product.brand}</p>}
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <p className="text-sm text-gray-500 mt-1">{product.unit}</p>

          <div className="flex items-center gap-3 mt-4">
            <span className="text-3xl font-extrabold text-gray-900">₹{product.price}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-lg text-gray-400 line-through">₹{product.mrp}</span>
                <span className="bg-blink-green text-white text-sm font-bold px-2.5 py-0.5 rounded-lg">{discount}% OFF</span>
              </>
            )}
          </div>

          {/* Delivery badge */}
          <div className="mt-4 flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <Zap size={16} className="text-blink-green" />
            <div>
              <p className="text-sm font-semibold text-blink-green">Delivery in 15 minutes</p>
              <p className="text-xs text-gray-500">Free delivery above ₹199</p>
            </div>
          </div>

          {/* Add to cart */}
          <div className="mt-6">
            {product.stock === 0 ? (
              <div className="bg-gray-100 text-gray-500 text-center py-3 rounded-xl font-medium">Out of Stock</div>
            ) : qty === 0 ? (
              <button
                onClick={() => { if (!user) { navigate('/login'); return; } addItem(product.id); }}
                className="btn-primary w-full py-3 text-base rounded-xl"
              >
                Add to Cart
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-blink-yellow rounded-xl px-3 py-2">
                  <button
                    onClick={() => cartItem && (qty === 1 ? removeItem(cartItem.id) : updateItem(cartItem.id, qty - 1))}
                    className="w-8 h-8 flex items-center justify-center hover:bg-yellow-400 rounded-lg transition-colors"
                  >
                    {qty === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                  </button>
                  <span className="text-xl font-bold text-blink-dark w-8 text-center">{qty}</span>
                  <button
                    onClick={() => cartItem && updateItem(cartItem.id, qty + 1)}
                    className="w-8 h-8 flex items-center justify-center hover:bg-yellow-400 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <span className="text-sm text-gray-500">{qty} in cart · ₹{product.price * qty}</span>
              </div>
            )}
          </div>

          {product.description && (
            <div className="mt-6">
              <h3 className="font-semibold text-gray-800 mb-2">About this product</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-sm text-gray-500">
            <ShieldCheck size={16} className="text-blink-green" />
            <span>100% original products · Quality guaranteed</span>
          </div>

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map(tag => (
                <span key={tag} className="bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
