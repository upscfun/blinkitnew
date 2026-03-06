import { Plus, Minus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import { Product } from '../../types';
import { useNavigate } from 'react-router-dom';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem, updateItem, removeItem, getItemQuantity, cart } = useCartStore();
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();
  const qty = getItemQuantity(product.id);
  const cartItem = cart?.items.find(i => i.productId === product.id);
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const outOfStock = product.stock === 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    addItem(product.id);
  };

  return (
    <Link to={`/products/${product.slug}`} className="card p-3 flex flex-col gap-2 hover:shadow-md transition-shadow cursor-pointer group">
      {/* Image */}
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden">
        <img
          src={product.images[0] || 'https://via.placeholder.com/150'}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
        />
        {discount > 0 && (
          <div className="absolute top-1.5 left-1.5 bg-blink-green text-white text-xs font-bold px-1.5 py-0.5 rounded-md">
            {discount}% OFF
          </div>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-xl">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1">
        <p className="text-xs text-gray-400">{product.unit}</p>
        <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2 mt-0.5">{product.name}</p>
      </div>

      {/* Price + Add */}
      <div className="flex items-center justify-between mt-auto">
        <div>
          <span className="text-sm font-bold text-gray-900">₹{product.price}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-gray-400 line-through ml-1">₹{product.mrp}</span>
          )}
        </div>

        {qty === 0 ? (
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            className="w-8 h-8 bg-blink-yellow rounded-xl flex items-center justify-center hover:bg-yellow-400 active:scale-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
          >
            <Plus size={16} className="text-blink-dark" strokeWidth={2.5} />
          </button>
        ) : (
          <div
            onClick={e => e.preventDefault()}
            className="flex items-center gap-1 bg-blink-yellow rounded-xl overflow-hidden"
          >
            <button
              onClick={() => cartItem && (qty === 1 ? removeItem(cartItem.id) : updateItem(cartItem.id, qty - 1))}
              className="w-7 h-7 flex items-center justify-center hover:bg-yellow-400 transition-colors"
            >
              {qty === 1 ? <Trash2 size={12} /> : <Minus size={12} />}
            </button>
            <span className="w-5 text-center text-xs font-bold text-blink-dark">{qty}</span>
            <button
              onClick={() => cartItem && updateItem(cartItem.id, qty + 1)}
              className="w-7 h-7 flex items-center justify-center hover:bg-yellow-400 transition-colors"
            >
              <Plus size={12} />
            </button>
          </div>
        )}
      </div>
    </Link>
  );
}
