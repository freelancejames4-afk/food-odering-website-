export interface CustomizationOption {
  name: string;
  choices: string[];
  defaultChoice: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'bowls' | 'juices' | 'sides' | 'snacks';
  customizations?: CustomizationOption[];
}

export interface SelectedCustomizations {
  [optionName: string]: string;
}

export interface CartItem {
  id: string; // unique item id + custom hash
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  customizationSummary: string;
  selectedCustomizations: SelectedCustomizations;
}

export interface DeliveryAddress {
  id: string;
  label: string; // 'Home', 'Office', etc.
  line1: string;
  line2?: string;
  city: string;
  state: string;
  zip: string;
  notes?: string;
}

export interface PaymentMethod {
  id: string;
  type: 'apple_pay' | 'card';
  brand?: string; // 'Visa', 'Mastercard'
  last4?: string;
  expDate?: string;
}

export type OrderStage = 'preparing' | 'pickup' | 'on_the_way' | 'arrived';

export interface SimulatedOrder {
  id: string;
  items: CartItem[];
  address: DeliveryAddress;
  paymentMethod: PaymentMethod;
  subtotal: number;
  deliveryFee: number;
  serviceFee: number;
  discount: number;
  total: number;
  stage: OrderStage;
  placedAt: string; // ISO string
  etaMinutes: number;
  driverProgress: number; // percentage (0 to 100)
}
