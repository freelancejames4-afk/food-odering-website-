import React, { useState } from 'react';
import { MenuItem, CartItem, SelectedCustomizations } from '../types';
import { INITIAL_MENU } from '../data';
import { Plus, Minus, Sparkles, X, ShoppingBag, Leaf, HelpCircle, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MenuSectionProps {
  onAddToCart: (item: CartItem) => void;
  cartItemsCount: number;
  onOpenCart: () => void;
}

export default function MenuSection({ onAddToCart, cartItemsCount, onOpenCart }: MenuSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'bowls' | 'juices' | 'sides'>('all');
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [selectedCustoms, setSelectedCustoms] = useState<SelectedCustomizations>({});
  const [quantity, setQuantity] = useState(1);

  // Filter items
  const filteredMenu = INITIAL_MENU.filter(
    (item) => selectedCategory === 'all' || item.category === selectedCategory
  );

  const handleOpenCustomizer = (item: MenuItem) => {
    setActiveItem(item);
    setQuantity(1);
    const defaults: SelectedCustomizations = {};
    if (item.customizations) {
      item.customizations.forEach((c) => {
        defaults[c.name] = c.defaultChoice;
      });
    }
    setSelectedCustoms(defaults);
  };

  const handleCloseCustomizer = () => {
    setActiveItem(null);
  };

  const handleCustomSelection = (optionName: string, choice: string) => {
    setSelectedCustoms((prev) => ({
      ...prev,
      [optionName]: choice,
    }));
  };

  // Calculate customized price
  const calculateCurrentPrice = (): number => {
    if (!activeItem) return 0;
    let price = activeItem.price;

    // Check if customized choices add cost
    Object.entries(selectedCustoms).forEach(([_, choice]) => {
      const choiceStr = choice as string;
      const match = choiceStr.match(/\+\s*\$(\d+\.\d{2})/);
      if (match) {
        price += parseFloat(match[1]);
      }
    });

    return price;
  };

  const handleAddClick = () => {
    if (!activeItem) return;

    const basePrice = calculateCurrentPrice();
    const summaryParts: string[] = [];

    Object.entries(selectedCustoms).forEach(([_, choice]) => {
      const choiceStr = choice as string;
      // Clean up price indicator from the label
      const cleanChoice = choiceStr.replace(/\s*\(\+\s*\$\d+\.\d{2}\)/, '');
      summaryParts.push(cleanChoice);
    });

    const summaryStr = summaryParts.length > 0 ? summaryParts.join(' • ') : 'Standard';

    // Generate unique ID based on selections
    const customsHash = Object.entries(selectedCustoms)
      .map(([k, v]) => `${k}:${v}`)
      .join('|');
    const uniqueCartId = `${activeItem.id}-${customsHash}`;

    const itemToAdd: CartItem = {
      id: uniqueCartId,
      menuItemId: activeItem.id,
      name: activeItem.name,
      price: basePrice,
      quantity: quantity,
      image: activeItem.image,
      customizationSummary: summaryStr,
      selectedCustomizations: selectedCustoms,
    };

    onAddToCart(itemToAdd);
    handleCloseCustomizer();
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar no-scrollbar scroll-smooth">
          {(['all', 'bowls', 'juices', 'sides'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full font-label-lg text-sm capitalize transition-all active:scale-95 whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm font-semibold'
                  : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'
              }`}
            >
              {cat === 'all' ? 'All Items' : cat}
            </button>
          ))}
        </div>

        {cartItemsCount > 0 && (
          <button
            onClick={onOpenCart}
            className="flex items-center gap-2 bg-secondary text-white px-4 py-2 rounded-full font-label-lg text-sm shadow-sm active:scale-95 transition-all cursor-pointer hover:bg-opacity-95"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Cart ({cartItemsCount})</span>
          </button>
        )}
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMenu.map((item) => (
          <div
            key={item.id}
            onClick={() => handleOpenCustomizer(item)}
            className="group flex flex-row items-stretch bg-surface-container-lowest border border-surface-variant/30 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 duration-200"
          >
            <div className="w-28 sm:w-36 h-full relative overflow-hidden bg-surface-container flex-shrink-0">
              <img
                src={item.image}
                alt={item.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {item.category === 'bowls' && (
                <div className="absolute top-2 left-2 bg-secondary/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                  <Leaf className="w-2.5 h-2.5" /> Organic
                </div>
              )}
            </div>

            <div className="p-3 sm:p-4 flex flex-col justify-between flex-grow">
              <div>
                <div className="flex justify-between items-start gap-1">
                  <h3 className="font-display text-sm sm:text-base font-semibold text-on-surface line-clamp-1 group-hover:text-primary transition-colors">
                    {item.name}
                  </h3>
                  <span className="font-display text-sm sm:text-base font-bold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant mt-1 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="flex justify-between items-center mt-3">
                <span className="text-[11px] text-secondary font-medium tracking-wide flex items-center gap-1 bg-secondary/10 px-2 py-0.5 rounded-full capitalize">
                  {item.category}
                </span>
                <span className="text-xs text-primary font-semibold flex items-center gap-0.5 group-hover:underline">
                  Add to Cart <Plus className="w-3 h-3" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Customizer Modal */}
      <AnimatePresence>
        {activeItem && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseCustomizer}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Content Container */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative bg-background w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-xl flex flex-col max-h-[85vh] overflow-hidden z-10"
            >
              {/* Header Image & Close */}
              <div className="h-44 relative bg-surface-container flex-shrink-0">
                <img
                  src={activeItem.image}
                  alt={activeItem.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <button
                  onClick={handleCloseCustomizer}
                  className="absolute top-4 right-4 bg-zinc-900/90 text-zinc-100 p-2 rounded-full shadow-md hover:bg-zinc-800 active:scale-90 transition-all cursor-pointer border border-zinc-700/40"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-display text-lg sm:text-xl font-bold">{activeItem.name}</h3>
                  <p className="text-xs text-white/80 line-clamp-2 mt-1">{activeItem.description}</p>
                </div>
              </div>

              {/* Scrollable Customization Fields */}
              <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
                {activeItem.customizations && activeItem.customizations.length > 0 ? (
                  activeItem.customizations.map((opt) => (
                    <div key={opt.name} className="space-y-2">
                      <h4 className="font-display text-sm font-semibold text-on-surface flex items-center justify-between">
                        <span>Select {opt.name}</span>
                        <span className="text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-medium">
                          Required
                        </span>
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {opt.choices.map((choice) => {
                          const isSelected = selectedCustoms[opt.name] === choice;
                          return (
                            <button
                              key={choice}
                              onClick={() => handleCustomSelection(opt.name, choice)}
                              className={`flex items-center justify-between p-3 border rounded-xl text-left text-sm transition-all active:scale-[0.99] ${
                                isSelected
                                  ? 'border-primary bg-primary/15 shadow-sm font-medium'
                                  : 'border-zinc-800 hover:bg-zinc-900/50 text-zinc-100'
                              }`}
                            >
                              <span className="text-on-surface">{choice}</span>
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                                  isSelected ? 'border-primary bg-primary' : 'border-outline/40'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white stroke-[3px]" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-6 text-center text-sm text-on-surface-variant flex flex-col items-center gap-2">
                    <Sparkles className="w-8 h-8 text-primary/65 animate-pulse" />
                    <p>This premium item is masterfully blended to absolute perfection and requires no customized changes.</p>
                  </div>
                )}

                {/* Quantity Manager */}
                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <span className="font-display text-sm font-semibold text-zinc-100">Select Quantity</span>
                  <div className="flex items-center gap-4 bg-zinc-900 rounded-full p-1.5 border border-zinc-850">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-1.5 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-750 disabled:opacity-40 active:scale-90 transition-all cursor-pointer border border-zinc-700/40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-display text-sm font-bold w-4 text-center text-zinc-100">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-1.5 rounded-full bg-zinc-800 text-zinc-100 hover:bg-zinc-750 active:scale-90 transition-all cursor-pointer border border-zinc-700/40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Sticky Modal Footer */}
              <div className="p-4 border-t border-surface-variant/30 bg-surface-container-lowest flex items-center justify-between gap-4">
                <div className="flex flex-col">
                  <span className="text-[11px] text-on-surface-variant uppercase tracking-wider font-semibold">
                    Estimated Price
                  </span>
                  <span className="font-display text-xl font-extrabold text-primary">
                    ${(calculateCurrentPrice() * quantity).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={handleAddClick}
                  className="flex-1 bg-primary text-white py-3.5 rounded-full font-label-lg text-sm shadow-md hover:bg-opacity-95 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Cart ({quantity})</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
