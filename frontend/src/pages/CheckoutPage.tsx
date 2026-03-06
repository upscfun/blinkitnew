import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Plus, Tag, ChevronRight, Zap } from 'lucide-react';
import { addressApi, orderApi } from '../api/order.api';
import { useCartStore } from '../store/cartStore';
import { Address } from '../types';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'COD', label: 'Cash on Delivery', icon: '💵' },
  { id: 'UPI', label: 'UPI / QR Code', icon: '📱' },
  { id: 'CARD', label: 'Credit / Debit Card', icon: '💳' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, totalPrice, clearCart } = useCartStore();
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [couponCode, setCouponCode] = useState('');
  const [note, setNote] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [newAddress, setNewAddress] = useState({ label: 'Home', street: '', landmark: '', city: '', state: '', pincode: '' });

  const { data: addrData, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.getAll(),
  });
  const addresses: Address[] = addrData?.data?.data || [];

  useEffect(() => {
    const def = addresses.find(a => a.isDefault) || addresses[0];
    if (def && !selectedAddress) setSelectedAddress(def.id);
  }, [addresses, selectedAddress]);

  const subtotal = totalPrice();
  const deliveryFee = subtotal >= 199 ? 0 : 20;
  const total = subtotal + deliveryFee;

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addressApi.create({ ...newAddress, isDefault: addresses.length === 0 });
      await refetchAddresses();
      setShowAddressForm(false);
      setNewAddress({ label: 'Home', street: '', landmark: '', city: '', state: '', pincode: '' });
      toast.success('Address added');
    } catch {
      toast.error('Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    if (!cart?.items.length) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const res = await orderApi.create({ addressId: selectedAddress, paymentMethod, couponCode: couponCode || undefined, note: note || undefined });
      await clearCart();
      toast.success('Order placed! 🎉');
      navigate(`/orders/${res.data.data.id}`);
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!cart?.items.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🛒</p>
        <p className="font-semibold text-gray-700">Your cart is empty</p>
        <button onClick={() => navigate('/')} className="btn-primary mt-4">Shop Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {/* Delivery Address */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-blink-green" /> Delivery Address
            </h2>
            {addresses.length === 0 ? (
              <p className="text-sm text-gray-500 mb-3">No addresses saved. Add one below.</p>
            ) : (
              <div className="space-y-2 mb-3">
                {addresses.map(addr => (
                  <label key={addr.id} className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${selectedAddress === addr.id ? 'border-blink-yellow bg-yellow-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <input type="radio" name="address" value={addr.id} checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)} className="mt-1" />
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{addr.label}</p>
                      <p className="text-sm text-gray-600">{addr.street}{addr.landmark ? `, ${addr.landmark}` : ''}</p>
                      <p className="text-sm text-gray-500">{addr.city}, {addr.state} – {addr.pincode}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}

            {showAddressForm ? (
              <form onSubmit={handleAddAddress} className="border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {(['Home', 'Work', 'Other'] as const).map(l => (
                    <label key={l} className={`flex items-center gap-2 p-2.5 rounded-lg border-2 cursor-pointer text-sm ${newAddress.label === l ? 'border-blink-yellow bg-yellow-50' : 'border-gray-100'}`}>
                      <input type="radio" name="label" value={l} checked={newAddress.label === l} onChange={() => setNewAddress(p => ({ ...p, label: l }))} />
                      {l}
                    </label>
                  ))}
                </div>
                {[
                  { key: 'street', label: 'Street Address', required: true },
                  { key: 'landmark', label: 'Landmark (optional)', required: false },
                  { key: 'city', label: 'City', required: true },
                  { key: 'state', label: 'State', required: true },
                  { key: 'pincode', label: 'Pincode', required: true },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-xs font-medium text-gray-600 block mb-1">{f.label}</label>
                    <input required={f.required} value={newAddress[f.key as keyof typeof newAddress]}
                      onChange={e => setNewAddress(p => ({ ...p, [f.key]: e.target.value }))}
                      className="input-field text-sm py-2" />
                  </div>
                ))}
                <div className="flex gap-2">
                  <button type="submit" className="btn-primary text-sm py-2">Save Address</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="btn-outline text-sm py-2">Cancel</button>
                </div>
              </form>
            ) : (
              <button onClick={() => setShowAddressForm(true)} className="flex items-center gap-1.5 text-sm text-blink-green font-medium hover:underline">
                <Plus size={15} /> Add new address
              </button>
            )}
          </div>

          {/* Payment Method */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-4">Payment Method</h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map(pm => (
                <label key={pm.id} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === pm.id ? 'border-blink-yellow bg-yellow-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <input type="radio" name="payment" value={pm.id} checked={paymentMethod === pm.id} onChange={() => setPaymentMethod(pm.id)} />
                  <span className="text-lg">{pm.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{pm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Coupon */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Tag size={16} className="text-blink-green" /> Apply Coupon
            </h2>
            <div className="flex gap-2">
              <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code (e.g. WELCOME50)"
                className="input-field text-sm py-2 flex-1" />
              <button className="btn-primary text-sm py-2 px-4">Apply</button>
            </div>
            <p className="text-xs text-gray-400 mt-2">Try: WELCOME50 or FLAT30</p>
          </div>

          {/* Note */}
          <div className="card p-5">
            <h2 className="font-semibold text-gray-800 mb-3">Order Note (optional)</h2>
            <textarea value={note} onChange={e => setNote(e.target.value)}
              placeholder="Any special instructions..."
              rows={2} className="input-field text-sm resize-none" />
          </div>
        </div>

        {/* Order Summary */}
        <div className="space-y-4">
          <div className="card p-5 sticky top-20">
            <h2 className="font-semibold text-gray-800 mb-4">Order Summary</h2>

            <div className="flex items-center gap-2 bg-green-50 rounded-xl px-3 py-2.5 mb-4">
              <Zap size={14} className="text-blink-green" />
              <span className="text-xs font-semibold text-blink-green">Delivery in 15 minutes</span>
            </div>

            <div className="space-y-2 text-sm max-h-48 overflow-y-auto mb-4">
              {cart.items.map(item => (
                <div key={item.id} className="flex justify-between text-gray-600">
                  <span className="flex-1 mr-2 truncate">{item.product.name} × {item.quantity}</span>
                  <span className="flex-shrink-0">₹{item.product.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-3 space-y-2 text-sm">
              <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className={deliveryFee === 0 ? 'text-blink-green font-medium' : ''}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                <span>Total</span><span>₹{total}</span>
              </div>
            </div>

            <button onClick={handlePlaceOrder} disabled={placing} className="btn-primary w-full py-3 text-base rounded-xl mt-4">
              {placing ? 'Placing Order...' : `Place Order · ₹${total}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
