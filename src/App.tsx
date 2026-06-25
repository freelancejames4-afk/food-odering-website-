import React, { useState, useEffect } from 'react';
import { CartItem, DeliveryAddress, PaymentMethod, SimulatedOrder } from './types';
import { INITIAL_ADDRESSES, INITIAL_PAYMENT_METHODS } from './data';
import MenuSection from './components/MenuSection';
import CheckoutReview from './components/CheckoutReview';
import LiveOrderTracker from './components/LiveOrderTracker';
import {
  HelpCircle,
  ShoppingBag,
  ArrowLeft,
  Sparkles,
  CheckCircle,
  Truck,
  FileText,
  Heart,
  User,
  X,
  LogOut,
  LogIn,
  UserCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, onAuthStateChanged, signOut, FirebaseUser } from './firebase';
import AuthScreen from './components/AuthScreen';

export default function App() {
  const [currentView, setCurrentView] = useState<'checkout' | 'menu' | 'tracking'>('checkout');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Pre-seed the cart to perfectly match the design mockup's initial values
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 'salmon-bowl-seed',
      menuItemId: 'salmon-bowl',
      name: 'Signature Salmon Bowl',
      price: 18.50,
      quantity: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL4GzUbp5ZzgWMiSApVb7aIADx_SYILGC7iJ4YUK_hPR7_AU4gOECr_E-lRb5CZLQ6Din8WRmAR1tLBZH99HROjVdX85c5IJbJ83uAfhKITCQ4Ca8hvUsWQTAjhPBzW53zHccQ_6tIU46l4acnwGGtA58ytQJrhBcCYk1NaJ_-7XYB3Lyw3xS2opHCZCQmfO7SJeCL51P4gmV-d00lqXyUq8QuqXVqCd-IK0Dj2lofniL3UjVjs_TWS3oYcpbwb_leRi6wb3Jsm_E',
      customizationSummary: 'Regular size • Extra Ginger',
      selectedCustomizations: {
        Size: 'Regular size',
        Ginger: 'Extra Ginger'
      }
    },
    {
      id: 'green-detox-seed',
      menuItemId: 'green-detox',
      name: 'Green Detox Juice',
      price: 15.00,
      quantity: 1,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCahLSXkPZZlcEptl21dDBYEWVM0WT3Zog1UaEKPiWa97WkF3l4Vv0nab7LFnuieGqPnb7xdCXA_OeL7o9X3sZU5SUyQW3MyObvx6WY40bVmVX3hnuX07vpue7xpO3SvZd_xXStIGoo9d9-MjQgWOlkBMFWAyNtbP9SJP3hoET_ExjBUlfwYwL4Dhj1mu4kQCIb1-LfFUPLypc13InKNeG3eranCqAgFy--qnO78_hjf-3818mx5vliq0SUtQUzBFUHiIvWdOaNvbU',
      customizationSummary: 'Cold-pressed • 500ml',
      selectedCustomizations: {
        Format: 'Cold-pressed',
        Size: '500ml (+ $2.00)'
      }
    }
  ]);

  // Delivery Addresses State
  const [addresses, setAddresses] = useState<DeliveryAddress[]>(INITIAL_ADDRESSES);
  const [selectedAddress, setSelectedAddress] = useState<DeliveryAddress>(INITIAL_ADDRESSES[0]);

  // Payment Options State
  const [payments, setPayments] = useState<PaymentMethod[]>(INITIAL_PAYMENT_METHODS);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(INITIAL_PAYMENT_METHODS[0]);

  // Active Placed Order State
  const [activeOrder, setActiveOrder] = useState<SimulatedOrder | null>(null);

  // App Help Overlay
  const [showHelpModal, setShowHelpModal] = useState(false);

  // Cart Qty updates
  const handleUpdateQty = (id: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(id);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQty } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems((prev) => {
      const match = prev.find((item) => item.id === newItem.id);
      if (match) {
        return prev.map((item) =>
          item.id === newItem.id
            ? { ...item, quantity: item.quantity + newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
    // Jump straight to checkout review on add, or remain on menu
    setCurrentView('checkout');
  };

  const handleAddAddress = (newAddr: DeliveryAddress) => {
    setAddresses((prev) => [...prev, newAddr]);
    setSelectedAddress(newAddr);
  };

  const handleAddPayment = (newPay: PaymentMethod) => {
    setPayments((prev) => [...prev, newPay]);
    setSelectedPayment(newPay);
  };

  // Place Order Action (Transitions to simulated order tracker)
  const handlePlaceOrder = (promoCode: string, discount: number) => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const deliveryFee = promoCode === 'FREEDEL' ? 0 : 2.99;
    const serviceFee = 1.50;
    const total = Math.max(0, subtotal + deliveryFee + serviceFee - discount);

    const orderObj: SimulatedOrder = {
      id: `ord-${Math.floor(Math.random() * 100000)}`,
      items: [...cartItems],
      address: selectedAddress,
      paymentMethod: selectedPayment,
      subtotal,
      deliveryFee,
      serviceFee,
      discount,
      total,
      stage: 'preparing',
      placedAt: new Date().toISOString(),
      etaMinutes: 25,
      driverProgress: 0,
    };

    setActiveOrder(orderObj);
    setCurrentView('tracking');
  };

  const handleResetOrder = () => {
    // Clear cart and go back to menu to purchase more
    setCartItems([]);
    setActiveOrder(null);
    setCurrentView('menu');
  };

  // Get view title
  const getViewTitle = () => {
    switch (currentView) {
      case 'menu':
        return 'Fresh Menu';
      case 'checkout':
        return 'Checkout';
      case 'tracking':
        return 'Live Delivery';
    }
  };

  // Quick total items count
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-on-background selection:bg-primary-container selection:text-white flex flex-col antialiased">
      {/* Top Compliant AppBar */}
      <header className="bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 border-b border-zinc-800 shadow-lg w-full transition-all duration-200">
        <div className="flex justify-between items-center px-5 h-16 w-full max-w-2xl mx-auto">
          {/* Back Action button */}
          <button
            onClick={() => {
              if (currentView === 'checkout') {
                setCurrentView('menu');
              } else if (currentView === 'menu' && cartCount > 0) {
                setCurrentView('checkout');
              }
            }}
            disabled={currentView === 'tracking' || (currentView === 'menu' && cartCount === 0)}
            className="text-primary hover:bg-white/5 transition-colors p-2.5 rounded-full active:scale-95 disabled:opacity-0 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center"
            title="Navigate Back"
          >
            <ArrowLeft className="w-5 h-5 stroke-[2.5px]" />
          </button>

          <h1 className="font-display text-lg sm:text-xl font-extrabold tracking-tight text-zinc-100 flex items-center gap-1.5">
            <span className="material-symbols-outlined text-xl text-primary">dining</span>
            <span>{getViewTitle()}</span>
          </h1>

          {/* Action buttons (Profile & Help) */}
          <div className="flex items-center gap-1.5 relative" id="header-actions">
            {/* User Profile / Auth Action */}
            {authLoading ? (
              <div className="w-9 h-9 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="w-9 h-9 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-display text-xs font-black hover:bg-indigo-500/20 active:scale-95 transition-all overflow-hidden flex items-center justify-center cursor-pointer relative"
                  title="View Profile"
                  id="user-profile-btn"
                >
                  {user.photoURL ? (
                    <img referrerPolicy="no-referrer" src={user.photoURL} alt={user.displayName || 'User'} className="w-full h-full object-cover" />
                  ) : (
                    <span>{(user.displayName || user.email || 'U').substring(0, 1).toUpperCase()}</span>
                  )}
                </button>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {showProfileDropdown && (
                    <>
                      {/* Click outside backdrop */}
                      <div className="fixed inset-0 z-30 animate-none" onClick={() => setShowProfileDropdown(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl py-3 px-4 z-40 space-y-2.5"
                        id="profile-dropdown-menu"
                      >
                        <div className="border-b border-zinc-800 pb-2.5">
                          <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Active Session</p>
                          <p className="text-zinc-100 text-xs font-bold truncate mt-1">
                            {user.displayName || 'Fresh Customer'}
                          </p>
                          <p className="text-zinc-400 text-[10px] truncate">
                            {user.email}
                          </p>
                        </div>
                        <button
                          onClick={async () => {
                            setShowProfileDropdown(false);
                            await signOut(auth);
                          }}
                          className="w-full flex items-center gap-2 text-red-400 hover:bg-red-500/10 p-2 rounded-xl text-xs font-bold transition-all text-left cursor-pointer"
                          id="signout-dropdown-btn"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-primary hover:bg-white/5 transition-colors p-2.5 rounded-full active:scale-95 cursor-pointer flex items-center justify-center"
                title="Sign In / Register"
                id="header-login-btn"
              >
                <User className="w-5 h-5 stroke-[2.5px]" />
              </button>
            )}

            {/* Help Action button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="text-primary hover:bg-white/5 transition-colors p-2.5 rounded-full active:scale-95 cursor-pointer flex items-center justify-center"
              title="App Information"
              id="header-help-btn"
            >
              <HelpCircle className="w-5 h-5 stroke-[2.5px]" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-xl mx-auto px-5 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
          >
            {currentView === 'menu' && (
              <div className="space-y-4">
                <div className="bg-secondary/10 p-4 rounded-2xl border border-secondary/20 flex items-center gap-3">
                  <div className="bg-secondary text-white p-2 rounded-xl">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <p className="text-xs text-on-secondary-container leading-relaxed">
                    <span className="font-bold">Organic & Fresh:</span> Customize delicious salmon poke bowls, cold-pressed juices, and smashed avocado sourdough toasts.
                  </p>
                </div>
                <MenuSection
                  onAddToCart={handleAddToCart}
                  cartItemsCount={cartCount}
                  onOpenCart={() => setCurrentView('checkout')}
                />
              </div>
            )}

            {currentView === 'checkout' && (
              <CheckoutReview
                cartItems={cartItems}
                onUpdateQty={handleUpdateQty}
                onRemoveItem={handleRemoveItem}
                selectedAddress={selectedAddress}
                addresses={addresses}
                onSelectAddress={setSelectedAddress}
                onAddAddress={handleAddAddress}
                selectedPayment={selectedPayment}
                payments={payments}
                onSelectPayment={setSelectedPayment}
                onAddPayment={handleAddPayment}
                onPlaceOrder={handlePlaceOrder}
                user={user}
                onTriggerAuth={() => setShowAuthModal(true)}
              />
            )}

            {currentView === 'tracking' && activeOrder && (
              <LiveOrderTracker
                order={activeOrder}
                onResetOrder={handleResetOrder}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Bottom Navigation (Aesthetic & Practical) */}
      {currentView !== 'tracking' && (
        <div className="sticky bottom-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-md border-t border-zinc-800 py-3 z-30">
          <div className="max-w-xl mx-auto px-5 flex justify-around items-center gap-2">
            <button
              onClick={() => setCurrentView('menu')}
              className={`flex-1 py-2.5 rounded-xl font-display text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex flex-col items-center gap-1 ${
                currentView === 'menu'
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-xl">restaurant_menu</span>
              <span>Browse Menu</span>
            </button>

            <button
              onClick={() => setCurrentView('checkout')}
              className={`flex-1 py-2.5 rounded-xl font-display text-xs font-bold transition-all active:scale-[0.98] cursor-pointer flex flex-col items-center gap-1 relative ${
                currentView === 'checkout'
                  ? 'text-primary bg-primary/10'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
              <span>Checkout</span>
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1/3 bg-primary text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-900">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Info/Help Dialog Modal Overlay */}
      <AnimatePresence>
        {showHelpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHelpModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-background max-w-md w-full rounded-2xl p-6 shadow-xl space-y-4 z-10"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2 text-primary">
                  <span className="material-symbols-outlined text-2xl">eco</span>
                  <h3 className="font-display text-base font-extrabold">Welcome to FreshDelivery!</h3>
                </div>
                <button
                  onClick={() => setShowHelpModal(false)}
                  className="p-1.5 hover:bg-surface-container rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-on-surface-variant" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs text-on-surface-variant leading-relaxed">
                <p>
                  This application brings the FreshDelivery Checkout design mockup to life! Here is what you can do:
                </p>

                <div className="space-y-2 pl-2">
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">1.</span>
                    <p>
                      <span className="font-bold text-on-surface">Browse Menu</span>: Tap "Browse Menu" in the footer to browse and add gourmet Salmon Bowls, Cold-Pressed Juices, and Avocado Toasts.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">2.</span>
                    <p>
                      <span className="font-bold text-on-surface">Cart Customizer</span>: Tap items to customize their size, organic base, and additions. Watch prices recalculate dynamically.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">3.</span>
                    <p>
                      <span className="font-bold text-on-surface">Manage Addresses</span>: Change delivery locations to 'Home' or 'Office', or add a brand-new address with delivery notes.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">4.</span>
                    <p>
                      <span className="font-bold text-on-surface">Promos & Payments</span>: Enter code <span className="font-bold text-primary">FRESH20</span> to get 20% off. Add or switch credit card options.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-primary font-bold">5.</span>
                    <p>
                      <span className="font-bold text-on-surface">Simulated GPS Live Tracker</span>: Place your order to launch our responsive canvas-drawn map tracking your driver Alex live! You can pause/speed up or even chat directly with Alex.
                    </p>
                  </div>
                </div>

                <p className="pt-2 border-t border-surface-variant/30 text-[10px] text-center italic">
                  Powered by React, Tailwind, and Motion for high-fidelity responsive transitions.
                </p>
              </div>

              <button
                onClick={() => setShowHelpModal(false)}
                className="w-full bg-primary text-white py-3 rounded-xl font-bold text-xs shadow-sm hover:bg-opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                Let's Eat Fresh!
              </button>
            </motion.div>
          </div>
        )}

        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative z-10 w-full max-w-md"
            >
              <AuthScreen
                onClose={() => setShowAuthModal(false)}
                onSuccess={() => setShowAuthModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
