import { MenuItem, DeliveryAddress, PaymentMethod } from './types';

export const INITIAL_MENU: MenuItem[] = [
  {
    id: 'salmon-bowl',
    name: 'Signature Salmon Bowl',
    description: 'Fresh sashimi salmon, bright green edamame, purple shredded cabbage, diced mango, avocado, and pickled ginger over warm brown rice with sesame dressing.',
    price: 18.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDL4GzUbp5ZzgWMiSApVb7aIADx_SYILGC7iJ4YUK_hPR7_AU4gOECr_E-lRb5CZLQ6Din8WRmAR1tLBZH99HROjVdX85c5IJbJ83uAfhKITCQ4Ca8hvUsWQTAjhPBzW53zHccQ_6tIU46l4acnwGGtA58ytQJrhBcCYk1NaJ_-7XYB3Lyw3xS2opHCZCQmfO7SJeCL51P4gmV-d00lqXyUq8QuqXVqCd-IK0Dj2lofniL3UjVjs_TWS3oYcpbwb_leRi6wb3Jsm_E',
    category: 'bowls',
    customizations: [
      { name: 'Size', choices: ['Regular size', 'Large (+ $3.00)'], defaultChoice: 'Regular size' },
      { name: 'Base', choices: ['Brown Rice', 'Quinoa', 'Mixed Greens'], defaultChoice: 'Brown Rice' },
      { name: 'Ginger', choices: ['Standard Ginger', 'Extra Ginger', 'No Ginger'], defaultChoice: 'Extra Ginger' }
    ]
  },
  {
    id: 'green-detox',
    name: 'Green Detox Juice',
    description: 'Cold-pressed crisp kale, green apple, cucumber, celery, fresh ginger, and lemon. High in antioxidants and hydrating.',
    price: 15.00,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCahLSXkPZZlcEptl21dDBYEWVM0WT3Zog1UaEKPiWa97WkF3l4Vv0nab7LFnuieGqPnb7xdCXA_OeL7o9X3sZU5SUyQW3MyObvx6WY40bVmVX3hnuX07vpue7xpO3SvZd_xXStIGoo9d9-MjQgWOlkBMFWAyNtbP9SJP3hoET_ExjBUlfwYwL4Dhj1mu4kQCIb1-LfFUPLypc13InKNeG3eranCqAgFy--qnO78_hjf-3818mx5vliq0SUtQUzBFUHiIvWdOaNvbU',
    category: 'juices',
    customizations: [
      { name: 'Format', choices: ['Cold-pressed', 'Blended Smoothie'], defaultChoice: 'Cold-pressed' },
      { name: 'Size', choices: ['350ml', '500ml (+ $2.00)', '1 Litre (+ $6.00)'], defaultChoice: '500ml (+ $2.00)' }
    ]
  },
  {
    id: 'spicy-tuna-bowl',
    name: 'Spicy Tuna Poke Bowl',
    description: 'Sashimi-grade ahi tuna toss in spicy sriracha mayo, green onions, seaweed salad, cucumber slices, and crisp onion flakes over jasmine rice.',
    price: 19.50,
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    category: 'bowls',
    customizations: [
      { name: 'Size', choices: ['Regular size', 'Large (+ $3.50)'], defaultChoice: 'Regular size' },
      { name: 'Spiciness', choices: ['Medium', 'Spicy Fire', 'No Spicy'], defaultChoice: 'Medium' }
    ]
  },
  {
    id: 'acai-bowl',
    name: 'Acai Antioxidant Bowl',
    description: 'Thick blended organic acai berry puree, topped with organic gluten-free granola, sliced banana, strawberries, chia seeds, and raw local honey.',
    price: 16.50,
    image: 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&auto=format&fit=crop&q=80',
    category: 'bowls',
    customizations: [
      { name: 'Granola', choices: ['Gluten-free Honey Granola', 'Chocolate Granola', 'No Granola'], defaultChoice: 'Gluten-free Honey Granola' },
      { name: 'Extra Topping', choices: ['None', 'Peanut Butter (+ $1.50)', 'Hemp Seeds (+ $1.00)'], defaultChoice: 'None' }
    ]
  },
  {
    id: 'avocado-toast',
    name: 'Avocado Edamame Toast',
    description: 'Smashed organic Hass avocados with steamed edamame, microgreens, red pepper flakes, and sea salt flakes on artisan toasted sourdough bread.',
    price: 14.00,
    image: 'https://images.unsplash.com/photo-1541532713592-79a0317b6b77?w=400&auto=format&fit=crop&q=80',
    category: 'sides',
    customizations: [
      { name: 'Bread', choices: ['Sourdough', 'Gluten-Free (+ $1.50)', 'Rye Bread'], defaultChoice: 'Sourdough' },
      { name: 'Add Egg', choices: ['No Egg', 'Poached Egg (+ $2.00)', 'Sunny Side Up (+ $2.00)'], defaultChoice: 'No Egg' }
    ]
  },
  {
    id: 'ginger-shot',
    name: 'Citrus Ginger Elixir',
    description: 'Power-packed immunity elixir with fresh ginger root extract, turmeric, organic orange juice, lemon, and a dash of cayenne pepper.',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&auto=format&fit=crop&q=80',
    category: 'juices',
    customizations: [
      { name: 'Temp', choices: ['Served Ice Cold', 'Served Warm'], defaultChoice: 'Served Ice Cold' }
    ]
  }
];

export const INITIAL_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-home',
    label: 'Home',
    line1: '241 Central Park West, Apartment 4B',
    city: 'New York',
    state: 'NY',
    zip: '10024',
    notes: 'Gate code: 1234. Please leave at the door.'
  },
  {
    id: 'addr-office',
    label: 'Office',
    line1: '500 5th Avenue, Floor 42',
    city: 'New York',
    state: 'NY',
    zip: '10110',
    notes: 'Hand to reception. Ring bell.'
  }
];

export const INITIAL_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-apple',
    type: 'apple_pay'
  },
  {
    id: 'pay-visa',
    type: 'card',
    brand: 'Visa',
    last4: '4242',
    expDate: '12/26'
  }
];

export const PROMO_CODES: { [code: string]: number } = {
  'FRESH20': 0.20, // 20% off
  'HEALTHY10': 0.10, // 10% off
  'FREEDEL': 2.99 // Free delivery ($2.99 value)
};
