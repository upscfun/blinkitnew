import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../store/cartStore';
import CartItemRow from '../components/cart/CartItemRow';

export default function CartPage() {
  const { cart, totalPrice } = useCartStore();
  const navigate = useNavigate();
  const items = cart?.items || [];
  const subtotal = totalPrice();
  const deliveryFee = subtotal >= 199 ? 0 : 20;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart size={36} className="text-gray-300" />
          </div>
          <p className="font-semibold text-gray-700">Your cart is empty</p>
          <button onClick={() => navigate('/')} className="btn-primary mt-4">Start Shopping</button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card p-4">
            {items.map(item => <CartItemRow key={item.id} item={item} />)}
          </div>
          <div className="card p-5 h-fit sticky top-20">
            <h2 className="font-semibold text-gray-800 mb-4">Bill Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-blink-green font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>₹{subtotal + deliveryFee}</span>
              </div>
            </div>
            <button onClick={() => navigate('/checkout')} className="btn-primary w-full py-3 rounded-xl mt-4">
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
