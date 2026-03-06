import { Minus, Plus, Trash2 } from 'lucide-react';
import { useCartStore } from '../../store/cartStore';
import { CartItem } from '../../types';

export default function CartItemRow({ item }: { item: CartItem }) {
  const { updateItem, removeItem } = useCartStore();

  return (
    <div className="flex items-center gap-3 py-3 border-b border-gray-50 last:border-0">
      <img
        src={item.product.images[0]}
        alt={item.product.name}
        className="w-14 h-14 object-contain rounded-xl bg-gray-50 border border-gray-100 p-1 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 leading-tight line-clamp-2">{item.product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.product.unit}</p>
        <p className="text-sm font-bold text-gray-800 mt-1">₹{item.product.price * item.quantity}</p>
      </div>
      <div className="flex items-center gap-1 bg-blink-yellow rounded-xl overflow-hidden flex-shrink-0">
        <button
          onClick={() => item.quantity === 1 ? removeItem(item.id) : updateItem(item.id, item.quantity - 1)}
          className="w-8 h-8 flex items-center justify-center hover:bg-yellow-400 transition-colors"
        >
          {item.quantity === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
        </button>
        <span className="w-6 text-center text-sm font-bold text-blink-dark">{item.quantity}</span>
        <button
          onClick={() => updateItem(item.id, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center hover:bg-yellow-400 transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );
}
