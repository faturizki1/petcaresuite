import { create } from 'zustand';
import type { Cart, CartItem, PaymentData, PaymentMethod } from '../pos.types';
import { LOYALTY_REDEEM_RATE } from '@/lib/constants';

interface CartState {
  cart: Cart;
  paymentData: PaymentData;
  addItem: (item: Omit<CartItem, 'id' | 'total'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, qty: number) => void;
  setItemDiscount: (id: string, amount: number) => void;
  setCustomer: (id?: string | null, name?: string | null, loyaltyPoints?: number, phone?: string | null) => void;
  setLoyaltyRedeem: (points: number) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  toggleSplitPayment: (enabled: boolean) => void;
  setSecondaryMethod: (method: PaymentMethod) => void;
  setPaidAmount: (amount: number) => void;
  setPaidAmountSecondary: (amount: number) => void;
  setReference: (reference: string | null) => void;
  loadInpatientBill: (items: CartItem[]) => void;
  clearCart: () => void;
}

function computeTotals(cart: Cart, paymentData: PaymentData) {
  const subtotal = cart.items.reduce((s, it) => s + it.unitPrice * it.quantity, 0);
  const discountTotal = cart.items.reduce((s, it) => s + (it.discountAmount || 0), 0);
  const loyaltyDiscount = cart.loyaltyPointsToRedeem ? (cart.loyaltyPointsToRedeem * LOYALTY_REDEEM_RATE) : 0;
  const total = Math.max(0, subtotal - discountTotal - loyaltyDiscount);
  const paid = (paymentData.paidAmount || 0) + (paymentData.splitEnabled ? (paymentData.paidAmountSecondary || 0) : 0);
  const cashPaid = paymentData.splitEnabled
    ? (paymentData.method === 'cash' ? (paymentData.paidAmount || 0) : 0) + (paymentData.methodSecondary === 'cash' ? (paymentData.paidAmountSecondary || 0) : 0)
    : (paymentData.method === 'cash' ? (paymentData.paidAmount || 0) : 0);
  const changeAmount = Math.max(0, cashPaid - total);
  return { subtotal, discountTotal, loyaltyDiscount, total, changeAmount };
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: { items: [], subtotal: 0, discountTotal: 0, loyaltyDiscount: 0, total: 0 },
  paymentData: { method: 'cash', paidAmount: 0, changeAmount: 0, splitEnabled: false },

  addItem: (item) => {
    set((state) => {
      const existing = state.cart.items.find((it) => it.referenceId === item.referenceId && it.itemType === item.itemType);
      let items = [...state.cart.items];
      if (existing) {
        items = items.map((it) => it === existing ? { ...it, quantity: it.quantity + item.quantity, total: (it.unitPrice * (it.quantity + item.quantity)) - (it.discountAmount || 0) } : it);
      } else {
        const id = crypto.randomUUID();
        items.push({ ...item, id, total: (item.unitPrice * item.quantity) - (item.discountAmount || 0) });
      }
      const newCart = { ...state.cart, items };
      const totals = computeTotals(newCart, state.paymentData);
      newCart.subtotal = totals.subtotal;
      newCart.discountTotal = totals.discountTotal;
      newCart.loyaltyDiscount = totals.loyaltyDiscount;
      newCart.total = totals.total;
      const newPayment = { ...state.paymentData, changeAmount: totals.changeAmount };
      return { cart: newCart, paymentData: newPayment };
    });
  },

  removeItem: (id) => {
    set((state) => {
      const items = state.cart.items.filter((it) => it.id !== id);
      const newCart = { ...state.cart, items };
      const totals = computeTotals(newCart, state.paymentData);
      newCart.subtotal = totals.subtotal;
      newCart.discountTotal = totals.discountTotal;
      newCart.loyaltyDiscount = totals.loyaltyDiscount;
      newCart.total = totals.total;
      const newPayment = { ...state.paymentData, changeAmount: totals.changeAmount };
      return { cart: newCart, paymentData: newPayment };
    });
  },

  updateQuantity: (id, qty) => {
    set((state) => {
      const items = state.cart.items.map((it) => it.id === id ? { ...it, quantity: Math.max(1, qty), total: (it.unitPrice * Math.max(1, qty)) - (it.discountAmount || 0) } : it);
      const newCart = { ...state.cart, items };
      const totals = computeTotals(newCart, state.paymentData);
      newCart.subtotal = totals.subtotal;
      newCart.discountTotal = totals.discountTotal;
      newCart.loyaltyDiscount = totals.loyaltyDiscount;
      newCart.total = totals.total;
      const newPayment = { ...state.paymentData, changeAmount: totals.changeAmount };
      return { cart: newCart, paymentData: newPayment };
    });
  },

  setItemDiscount: (id, amount) => {
    set((state) => {
      const items = state.cart.items.map((it) => it.id === id ? { ...it, discountAmount: amount, total: (it.unitPrice * it.quantity) - amount } : it);
      const newCart = { ...state.cart, items };
      const totals = computeTotals(newCart, state.paymentData);
      newCart.subtotal = totals.subtotal;
      newCart.discountTotal = totals.discountTotal;
      newCart.loyaltyDiscount = totals.loyaltyDiscount;
      newCart.total = totals.total;
      const newPayment = { ...state.paymentData, changeAmount: totals.changeAmount };
      return { cart: newCart, paymentData: newPayment };
    });
  },

  setCustomer: (id, name, loyaltyPoints = 0, phone = null) => {
    set((state) => {
      const newCart = { ...state.cart, customerId: id, customerName: name, customerPhone: phone, loyaltyPointsAvailable: loyaltyPoints };
      const totals = computeTotals(newCart, state.paymentData);
      newCart.subtotal = totals.subtotal;
      newCart.discountTotal = totals.discountTotal;
      newCart.loyaltyDiscount = totals.loyaltyDiscount;
      newCart.total = totals.total;
      return { cart: newCart };
    });
  },

  setLoyaltyRedeem: (points) => {
    set((state) => {
      const maxPoints = Math.min(Number(state.cart.loyaltyPointsAvailable || 0), Math.floor(state.cart.subtotal / LOYALTY_REDEEM_RATE));
      const toRedeem = Math.max(0, Math.min(points, maxPoints));
      const newCart = { ...state.cart, loyaltyPointsToRedeem: toRedeem };
      const totals = computeTotals(newCart, state.paymentData);
      newCart.loyaltyDiscount = totals.loyaltyDiscount;
      newCart.total = totals.total;
      const newPayment = { ...state.paymentData, changeAmount: totals.changeAmount };
      return { cart: newCart, paymentData: newPayment };
    });
  },

  setPaymentMethod: (method) => {
    set((state) => {
      const newPayment = { ...state.paymentData, method, methodSecondary: undefined } as PaymentData;
      const totals = computeTotals(state.cart, newPayment);
      newPayment.changeAmount = totals.changeAmount;
      return { paymentData: newPayment };
    });
  },

  toggleSplitPayment: (enabled) => {
    set((state) => {
      const newPayment = {
        ...state.paymentData,
        splitEnabled: enabled,
        methodSecondary: enabled ? state.paymentData.methodSecondary : undefined,
        paidAmountSecondary: enabled ? state.paymentData.paidAmountSecondary : undefined
      } as PaymentData;
      if (!enabled) {
        newPayment.methodSecondary = undefined;
        newPayment.paidAmountSecondary = undefined;
      }
      const totals = computeTotals(state.cart, newPayment);
      newPayment.changeAmount = totals.changeAmount;
      return { paymentData: newPayment };
    });
  },

  setSecondaryMethod: (method) => {
    set((state) => {
      const newPayment = { ...state.paymentData, methodSecondary: method } as PaymentData;
      const totals = computeTotals(state.cart, newPayment);
      newPayment.changeAmount = totals.changeAmount;
      return { paymentData: newPayment };
    });
  },

  setPaidAmount: (amount) => {
    set((state) => {
      const newPayment = { ...state.paymentData, paidAmount: amount } as PaymentData;
      const totals = computeTotals(state.cart, newPayment);
      newPayment.changeAmount = totals.changeAmount;
      return { paymentData: newPayment };
    });
  },

  setPaidAmountSecondary: (amount) => {
    set((state) => {
      const newPayment = { ...state.paymentData, paidAmountSecondary: amount } as PaymentData;
      const totals = computeTotals(state.cart, newPayment);
      newPayment.changeAmount = totals.changeAmount;
      return { paymentData: newPayment };
    });
  },

  setReference: (reference) => {
    set((state) => ({ paymentData: { ...state.paymentData, reference } as PaymentData }));
  },

  loadInpatientBill: (items) => {
    set((state) => {
      const newCart = { ...state.cart, items };
      const totals = computeTotals(newCart, state.paymentData);
      newCart.subtotal = totals.subtotal;
      newCart.discountTotal = totals.discountTotal;
      newCart.loyaltyDiscount = totals.loyaltyDiscount;
      newCart.total = totals.total;
      return { cart: newCart };
    });
  },

  clearCart: () => {
    set(() => ({
      cart: {
        items: [],
        customerId: null,
        customerName: null,
        customerPhone: null,
        loyaltyPointsAvailable: 0,
        loyaltyPointsToRedeem: 0,
        subtotal: 0,
        discountTotal: 0,
        loyaltyDiscount: 0,
        total: 0
      },
      paymentData: { method: 'cash', paidAmount: 0, paidAmountSecondary: 0, changeAmount: 0, splitEnabled: false, reference: null }
    }));
  }
}));

export default useCartStore;
