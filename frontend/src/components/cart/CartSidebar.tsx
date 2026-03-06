import { X, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import CartItemRow from './CartItemRow';

export default function CartSidebar() {
  const { cart, isOpen, closeCart, totalItems, totalPrice } = useCartStore();
  const navigate = useNavigate();
  const items = cart?.items || [];
  const FREE_DELIVERY = 199;
  const subtotal = totalPrice();
  const deliveryFee = subtotal >= FREE_DELIVERY ? 0 : 20;

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={closeCart} />
      <div className="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 flex flex-col shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-bold text-lg text-gray-800">My Cart</h2>
            {totalItems() > 0 && (
              <p className="text-xs text-gray-500">{totalItems()} item{totalItems() > 1 ? 's' : ''}</p>
            )}
          </div>
          <button onClick={closeCart} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Delivery badge */}
        {items.length > 0 && (
          <div className="mx-5 mt-3 bg-blink-green/10 border border-blink-green/20 rounded-lg px-4 py-2.5 flex items-center gap-2">
            <span className="text-lg">⚡</span>
            <div>
              <span className="text-xs font-semibold text-blink-green">Delivery in 15 minutes</span>
              {subtotal < FREE_DELIVERY && (
                <p className="text-xs text-gray-500">Add ₹{FREE_DELIVERY - subtotal} more for free delivery</p>
              )}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart size={32} className="text-gray-300" />
              </div>
              <div>
                <p className="font-semibold text-gray-700">Your cart is empty</p>
                <p className="text-sm text-gray-500 mt-1">Add items to get started</p>
              </div>
              <button onClick={closeCart} className="btn-primary">Browse Products</button>
            </div>
          ) : (
            <div className="space-y-1">
              {items.map(item => <CartItemRow key={item.id} item={item} />)}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span><span>₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-blink-green font-medium' : ''}>
                  {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                </span>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-1.5 border-t border-gray-100">
                <span>Total</span><span>₹{subtotal + deliveryFee}</span>
              </div>
            </div>
            <button
              onClick={() => { closeCart(); navigate('/checkout'); }}
              className="w-full btn-primary text-base py-3 rounded-xl"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
}
