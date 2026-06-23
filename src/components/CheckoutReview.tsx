import React, { useState } from 'react';
import { CartItem, DeliveryAddress, PaymentMethod } from '../types';
import { PROMO_CODES } from '../data';
import {
  MapPin,
  CreditCard,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  X,
  PlusCircle,
  Tag,
  AlertCircle,
  Clock,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CheckoutReviewProps {
  cartItems: CartItem[];
  onUpdateQty: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  selectedAddress: DeliveryAddress;
  addresses: DeliveryAddress[];
  onSelectAddress: (address: DeliveryAddress) => void;
  onAddAddress: (address: DeliveryAddress) => void;
  selectedPayment: PaymentMethod;
  payments: PaymentMethod[];
  onSelectPayment: (payment: PaymentMethod) => void;
  onAddPayment: (payment: PaymentMethod) => void;
  onPlaceOrder: (promoCode: string, discount: number) => void;
}

export default function CheckoutReview({
  cartItems,
  onUpdateQty,
  onRemoveItem,
  selectedAddress,
  addresses,
  onSelectAddress,
  onAddAddress,
  selectedPayment,
  payments,
  onSelectPayment,
  onAddPayment,
  onPlaceOrder,
}: CheckoutReviewProps) {
  // Address selection drawer
  const [showAddressDrawer, setShowAddressDrawer] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddrLabel, setNewAddrLabel] = useState('Home');
  const [newAddrLine1, setNewAddrLine1] = useState('');
  const [newAddrLine2, setNewAddrLine2] = useState('');
  const [newAddrCity, setNewAddrCity] = useState('New York');
  const [newAddrState, setNewAddrState] = useState('NY');
  const [newAddrZip, setNewAddrZip] = useState('');
  const [newAddrNotes, setNewAddrNotes] = useState('');

  // Payment selection drawer
  const [showPaymentDrawer, setShowPaymentDrawer] = useState(false);
  const [showAddPaymentForm, setShowAddPaymentForm] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('');
  const [newCardBrand, setNewCardBrand] = useState('Visa');
  const [newCardExp, setNewCardExp] = useState('');
  const [newCardCvv, setNewCardCvv] = useState('');

  // Promo codes state
  const [promoInput, setPromoInput] = useState('');
  const [activePromo, setActivePromo] = useState<string | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);

  // Calculate pricing
  const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const deliveryFee = activePromo === 'FREEDEL' ? 0 : 2.99;
  const serviceFee = subtotal > 0 ? 1.50 : 0;

  // Calculate promo discount
  let discountAmount = 0;
  if (activePromo && subtotal > 0) {
    if (activePromo === 'FRESH20') {
      discountAmount = subtotal * 0.20;
    } else if (activePromo === 'HEALTHY10') {
      discountAmount = subtotal * 0.10;
    } else if (activePromo === 'FREEDEL') {
      discountAmount = 0; // Free delivery discount handled already
    }
  }

  const grandTotal = Math.max(0, subtotal + deliveryFee + serviceFee - discountAmount);

  // Address Submit Handler
  const handleAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddrLine1.trim() || !newAddrZip.trim()) return;

    const newAddress: DeliveryAddress = {
      id: `addr-${Date.now()}`,
      label: newAddrLabel,
      line1: newAddrLine1,
      line2: newAddrLine2 || undefined,
      city: newAddrCity,
      state: newAddrState,
      zip: newAddrZip,
      notes: newAddrNotes || undefined,
    };

    onAddAddress(newAddress);
    setShowAddAddressForm(false);
    // Auto-reset state
    setNewAddrLine1('');
    setNewAddrLine2('');
    setNewAddrZip('');
    setNewAddrNotes('');
  };

  // Payment Submit Handler
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardNumber.trim() || !newCardExp.trim() || !newCardCvv.trim()) return;

    const cleanNumber = newCardNumber.replace(/\s+/g, '');
    const last4 = cleanNumber.slice(-4) || '1111';

    const newPayment: PaymentMethod = {
      id: `pay-${Date.now()}`,
      type: 'card',
      brand: newCardBrand,
      last4: last4,
      expDate: newCardExp,
    };

    onAddPayment(newPayment);
    setShowAddPaymentForm(false);
    // Auto-reset
    setNewCardNumber('');
    setNewCardExp('');
    setNewCardCvv('');
  };

  // Promo code validation
  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;

    if (PROMO_CODES[code] !== undefined) {
      setActivePromo(code);
      setPromoSuccess(`Promo Code "${code}" Applied Successfully!`);
      setPromoError(null);
    } else {
      setPromoError('Invalid Promo Code. Try "FRESH20" or "HEALTHY10"');
      setPromoSuccess(null);
    }
  };

  const removePromo = () => {
    setActivePromo(null);
    setPromoInput('');
    setPromoSuccess(null);
    setPromoError(null);
  };

  return (
    <div className="space-y-6">
      {/* Delivery Section */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-variant/20 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-full text-primary">
              <MapPin className="w-5 h-5 fill-primary/20" />
            </div>
            <h2 className="font-display text-base font-bold text-on-surface">Delivery Address</h2>
          </div>
          <button
            onClick={() => setShowAddressDrawer(true)}
            className="text-primary font-label-lg text-sm hover:bg-primary/5 px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95"
          >
            Change
          </button>
        </div>

        <div className="flex items-start gap-3 pl-12">
          <div className="flex-1">
            <p className="font-label-lg text-sm text-on-surface font-semibold">{selectedAddress.label}</p>
            <p className="text-on-surface-variant text-sm leading-relaxed mt-0.5">
              {selectedAddress.line1}
              {selectedAddress.line2 && `, ${selectedAddress.line2}`}
              <br />
              {selectedAddress.city}, {selectedAddress.state} {selectedAddress.zip}
            </p>
            {selectedAddress.notes && (
              <p className="text-on-surface-variant text-xs mt-2 italic bg-surface-container-low px-3 py-2 rounded-lg border-l-2 border-primary/50">
                "{selectedAddress.notes}"
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Payment Section */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-variant/20 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 p-2.5 rounded-full text-primary">
              <CreditCard className="w-5 h-5 fill-primary/20" />
            </div>
            <h2 className="font-display text-base font-bold text-on-surface">Payment Method</h2>
          </div>
          <button
            onClick={() => setShowPaymentDrawer(true)}
            className="text-primary font-label-lg text-sm hover:bg-primary/5 px-3 py-1.5 rounded-full transition-all cursor-pointer active:scale-95"
          >
            Change
          </button>
        </div>

        <div className="flex items-center gap-3 pl-12">
          {selectedPayment.type === 'apple_pay' ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-black flex items-center justify-center rounded-lg shadow-sm">
                <span className="text-white text-[11px] font-extrabold italic tracking-tight"> Pay</span>
              </div>
              <div>
                <span className="font-label-lg text-sm text-on-surface">Apple Pay</span>
                <p className="text-xs text-on-surface-variant mt-0.5">Instant checkout enabled</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-surface-container-highest border border-surface-variant/40 flex items-center justify-center rounded-lg shadow-xs overflow-hidden">
                <span className="text-on-surface text-xs font-bold uppercase">{selectedPayment.brand || 'Card'}</span>
              </div>
              <div>
                <p className="font-label-lg text-sm text-on-surface font-semibold">
                  {selectedPayment.brand} •••• {selectedPayment.last4}
                </p>
                <p className="text-on-surface-variant text-xs mt-0.5">Expires: {selectedPayment.expDate}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Order Summary & Item list */}
      <section className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-variant/20 space-y-4">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2.5 rounded-full text-primary">
            <ShoppingBag className="w-5 h-5 fill-primary/20" />
          </div>
          <h2 className="font-display text-base font-bold text-on-surface">Order Summary</h2>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <ShoppingBag className="w-12 h-12 text-outline/30 mx-auto" />
            <p className="text-sm text-on-surface-variant">Your fresh delivery box is empty.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-variant/30">
            {cartItems.map((item) => (
              <div key={item.id} className="py-4 flex items-start gap-3 first:pt-0">
                <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-surface-container">
                  <img
                    src={item.image}
                    alt={item.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-display text-sm font-semibold text-on-surface truncate">
                      {item.name}
                    </h3>
                    <span className="font-display text-sm font-bold text-on-surface whitespace-nowrap">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <p className="text-on-surface-variant text-xs mt-1 leading-relaxed truncate">
                    {item.customizationSummary}
                  </p>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-on-surface-variant">
                      ${item.price.toFixed(2)} each
                    </span>

                    {/* Quantity incrementor inside summary */}
                    <div className="flex items-center gap-2.5 bg-zinc-900 px-2.5 py-1 rounded-full border border-zinc-850">
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity - 1)}
                        className="p-1 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/40 shadow-sm cursor-pointer active:scale-90 transition-all"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-zinc-100 font-bold text-xs min-w-3 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQty(item.id, item.quantity + 1)}
                        className="p-1 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700/40 shadow-sm cursor-pointer active:scale-90 transition-all"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Promo Code Input block */}
        <div className="pt-4 border-t border-surface-variant/20">
          {!activePromo ? (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-on-surface-variant flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-primary" /> Promo Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. FRESH20"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="flex-grow bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary uppercase transition-all"
                />
                <button
                  onClick={applyPromo}
                  disabled={!promoInput.trim()}
                  className="bg-primary text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-xs hover:bg-opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer active:scale-95"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <div className="text-xs text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{promoError}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-secondary/10 border border-secondary/20 p-3 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-secondary" />
                <div>
                  <span className="font-semibold text-xs text-secondary">{activePromo} Activated</span>
                  <p className="text-[11px] text-on-surface-variant">
                    {activePromo === 'FRESH20' && '20% off subtotal applied!'}
                    {activePromo === 'HEALTHY10' && '10% off subtotal applied!'}
                    {activePromo === 'FREEDEL' && 'Free delivery fee applied!'}
                  </p>
                </div>
              </div>
              <button
                onClick={removePromo}
                className="text-on-surface-variant hover:text-red-500 transition-colors p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Cost Breakdown */}
        <div className="pt-4 border-t border-surface-variant/30 space-y-2">
          <div className="flex justify-between text-on-surface-variant text-sm">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>

          <div className="flex justify-between text-on-surface-variant text-sm">
            <span>Delivery Fee</span>
            {activePromo === 'FREEDEL' ? (
              <span className="text-secondary font-semibold">FREE (Promo)</span>
            ) : (
              <span>${deliveryFee.toFixed(2)}</span>
            )}
          </div>

          <div className="flex justify-between text-on-surface-variant text-sm">
            <div className="flex items-center gap-1 cursor-help group relative">
              <span>Service Fee</span>
              <Info className="w-3.5 h-3.5 text-outline/60" />
              <span className="absolute bottom-full mb-1 left-0 scale-0 group-hover:scale-100 bg-black text-white text-[10px] p-1.5 rounded-md w-36 text-center shadow-md transition-all z-10 font-normal">
                Standard packaging and premium delivery logistics fee.
              </span>
            </div>
            <span>${serviceFee.toFixed(2)}</span>
          </div>

          {discountAmount > 0 && (
            <div className="flex justify-between text-secondary font-semibold text-sm">
              <span>Promo Discount ({activePromo})</span>
              <span>-${discountAmount.toFixed(2)}</span>
            </div>
          )}

          <div className="flex justify-between items-center pt-3 border-t border-surface-variant/20">
            <span className="font-display text-base font-bold text-on-surface">Total</span>
            <span className="font-display text-xl font-black text-primary">
              ${grandTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </section>

      {/* Place Order CTA Section */}
      <div className="bg-surface-container-lowest p-5 rounded-2xl shadow-xs border border-surface-variant/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-on-surface-variant text-xs uppercase font-semibold tracking-wider flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-secondary" /> Arriving in
            </span>
            <span className="font-display text-sm font-bold text-on-surface mt-0.5">25–35 mins</span>
          </div>

          <div className="text-right">
            <span className="text-on-surface-variant text-xs uppercase font-semibold tracking-wider">Total Charge</span>
            <p className="font-display text-xl font-black text-primary mt-0.5">${grandTotal.toFixed(2)}</p>
          </div>
        </div>

        <button
          onClick={() => onPlaceOrder(activePromo || '', discountAmount)}
          disabled={cartItems.length === 0}
          className="w-full bg-primary text-white py-4 rounded-full font-display text-base font-bold shadow-md hover:bg-opacity-95 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <span>Place Order</span>
          <PlusCircle className="w-5 h-5 fill-white/10" />
        </button>
      </div>

      {/* Address Selection Drawer Modal */}
      <AnimatePresence>
        {showAddressDrawer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowAddressDrawer(false);
                setShowAddAddressForm(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-background w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl p-5 flex flex-col max-h-[80vh] overflow-y-auto z-10 custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg font-bold text-on-surface">Change Address</h3>
                <button
                  onClick={() => {
                    setShowAddressDrawer(false);
                    setShowAddAddressForm(false);
                  }}
                  className="p-1.5 hover:bg-surface-container rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!showAddAddressForm ? (
                <div className="space-y-3">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddress.id === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => {
                          onSelectAddress(addr);
                          setShowAddressDrawer(false);
                        }}
                        className={`p-4 border rounded-2xl cursor-pointer text-left transition-all active:scale-[0.99] flex justify-between items-start gap-3 ${
                          isSelected
                            ? 'border-primary bg-primary/15 shadow-sm'
                            : 'border-zinc-800 hover:bg-zinc-900/50'
                        }`}
                      >
                        <div className="space-y-1">
                          <p className="font-semibold text-sm text-on-surface flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-primary" /> {addr.label}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {addr.line1}
                            {addr.line2 && `, ${addr.line2}`}
                            <br />
                            {addr.city}, {addr.state} {addr.zip}
                          </p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary' : 'border-outline/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setShowAddAddressForm(true)}
                    className="w-full border-2 border-dashed border-primary/40 text-primary p-3.5 rounded-2xl text-sm font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Add New Address
                  </button>
                </div>
              ) : (
                <form onSubmit={handleAddressSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Address Label</label>
                    <div className="flex gap-2">
                      {['Home', 'Office', 'Gym', 'Other'].map((lbl) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setNewAddrLabel(lbl)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            newAddrLabel === lbl
                              ? 'bg-primary text-white'
                              : 'bg-surface-container hover:bg-surface-container-high'
                          }`}
                        >
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Street Address (Line 1)</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 241 Central Park West"
                      value={newAddrLine1}
                      onChange={(e) => setNewAddrLine1(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Apt / Suite / Floor (Line 2)</label>
                    <input
                      type="text"
                      placeholder="e.g. Apartment 4B"
                      value={newAddrLine2}
                      onChange={(e) => setNewAddrLine2(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-on-surface-variant">City</label>
                      <input
                        required
                        type="text"
                        value={newAddrCity}
                        onChange={(e) => setNewAddrCity(e.target.value)}
                        className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-on-surface-variant">ZIP Code</label>
                      <input
                        required
                        type="text"
                        placeholder="10024"
                        value={newAddrZip}
                        onChange={(e) => setNewAddrZip(e.target.value)}
                        className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Delivery Instructions (Optional)</label>
                    <textarea
                      placeholder="e.g. Gate code: 1234. Please leave at the door."
                      value={newAddrNotes}
                      onChange={(e) => setNewAddrNotes(e.target.value)}
                      className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm h-16 focus:outline-none resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddressForm(false)}
                      className="flex-1 bg-surface-container hover:bg-surface-container-high py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-opacity-95 cursor-pointer"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Payment Selection Drawer Modal */}
      <AnimatePresence>
        {showPaymentDrawer && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setShowPaymentDrawer(false);
                setShowAddPaymentForm(false);
              }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              className="relative bg-background w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl p-5 flex flex-col max-h-[80vh] overflow-y-auto z-10 custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-display text-lg font-bold text-on-surface">Change Payment Method</h3>
                <button
                  onClick={() => {
                    setShowPaymentDrawer(false);
                    setShowAddPaymentForm(false);
                  }}
                  className="p-1.5 hover:bg-surface-container rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {!showAddPaymentForm ? (
                <div className="space-y-3">
                  {payments.map((pay) => {
                    const isSelected = selectedPayment.id === pay.id;
                    return (
                      <div
                        key={pay.id}
                        onClick={() => {
                          onSelectPayment(pay);
                          setShowPaymentDrawer(false);
                        }}
                        className={`p-4 border rounded-2xl cursor-pointer text-left transition-all active:scale-[0.99] flex justify-between items-center gap-3 ${
                          isSelected
                            ? 'border-primary bg-primary/15 shadow-sm'
                            : 'border-zinc-800 hover:bg-zinc-900/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {pay.type === 'apple_pay' ? (
                            <div className="w-12 h-8 bg-black flex items-center justify-center rounded-lg shadow-sm">
                              <span className="text-white text-[11px] font-extrabold italic tracking-tight"> Pay</span>
                            </div>
                          ) : (
                            <div className="w-12 h-8 bg-surface-container-highest border border-surface-variant/40 flex items-center justify-center rounded-lg shadow-xs overflow-hidden">
                              <span className="text-on-surface text-[10px] font-bold uppercase">{pay.brand}</span>
                            </div>
                          )}
                          <div>
                            <p className="font-semibold text-sm text-on-surface">
                              {pay.type === 'apple_pay' ? 'Apple Pay' : `${pay.brand} •••• ${pay.last4}`}
                            </p>
                            <p className="text-[11px] text-on-surface-variant">
                              {pay.type === 'apple_pay' ? 'Verified by biometric touch' : `Expires: ${pay.expDate}`}
                            </p>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-primary bg-primary' : 'border-outline/40'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                        </div>
                      </div>
                    );
                  })}

                  <button
                    onClick={() => setShowAddPaymentForm(true)}
                    className="w-full border-2 border-dashed border-primary/40 text-primary p-3.5 rounded-2xl text-sm font-semibold hover:bg-primary/5 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Credit Card
                  </button>
                </div>
              ) : (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Card Brand</label>
                    <div className="flex gap-2">
                      {['Visa', 'Mastercard', 'Amex'].map((brand) => (
                        <button
                          key={brand}
                          type="button"
                          onClick={() => setNewCardBrand(brand)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                            newCardBrand === brand
                              ? 'bg-primary text-white'
                              : 'bg-surface-container hover:bg-surface-container-high'
                          }`}
                        >
                          {brand}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-on-surface-variant">Card Number</label>
                    <input
                      required
                      type="text"
                      maxLength={19}
                      placeholder="4242 4242 4242 4242"
                      value={newCardNumber}
                      onChange={(e) => {
                        // format to card chunks
                        const val = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                        const matches = val.match(/\d{4,16}/g);
                        const match = (matches && matches[0]) || '';
                        const parts = [];

                        for (let i = 0, len = match.length; i < len; i += 4) {
                          parts.push(match.substring(i, i + 4));
                        }

                        if (parts.length > 0) {
                          setNewCardNumber(parts.join(' '));
                        } else {
                          setNewCardNumber(val);
                        }
                      }}
                      className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-on-surface-variant">Expiration Date</label>
                      <input
                        required
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={newCardExp}
                        onChange={(e) => {
                          let val = e.target.value.replace(/[^0-9]/g, '');
                          if (val.length > 2) {
                            val = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
                          }
                          setNewCardExp(val);
                        }}
                        className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-on-surface-variant">Security Code (CVV)</label>
                      <input
                        required
                        type="password"
                        maxLength={4}
                        placeholder="123"
                        value={newCardCvv}
                        onChange={(e) => setNewCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-surface-container-low border border-surface-variant/30 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddPaymentForm(false)}
                      className="flex-1 bg-surface-container hover:bg-surface-container-high py-2.5 rounded-xl text-xs font-semibold cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="flex-1 bg-primary text-white py-2.5 rounded-xl text-xs font-semibold hover:bg-opacity-95 cursor-pointer"
                    >
                      Save Card
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
