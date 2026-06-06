import React from 'react';
import { Check } from 'lucide-react';
import { Order } from '../store/useOrderStore';

// Normalizers for robust matching
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/[^0-9]/g, '');
  return digits.length >= 11 ? digits.slice(-11) : digits;
}

export function normalizeEmail(email?: string): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

/**
 * Calculates the number of successful (Delivered) orders for a customer identifier.
 */
export function getCompletedOrdersCount(
  orders: Order[],
  customerInfo: { email?: string; phone?: string; name?: string }
): number {
  const targetEmail = normalizeEmail(customerInfo.email);
  const targetPhone = normalizePhone(customerInfo.phone);
  const targetName = customerInfo.name?.trim().toLowerCase();

  if (!targetEmail && !targetPhone && !targetName) return 0;

  // Filter only Delivered orders
  const completedOrders = orders.filter(order => {
    // Check status
    if (order.status !== 'Delivered') return false;

    const orderEmail = normalizeEmail(order.email);
    const orderPhone = normalizePhone(order.mobileNumber);
    const orderName = order.customerName?.trim().toLowerCase();

    // Match criteria
    if (targetEmail && orderEmail && targetEmail === orderEmail) return true;
    if (targetPhone && orderPhone && targetPhone === orderPhone) return true;
    if (targetName && orderName && targetName === orderName) return true;

    return false;
  });

  return completedOrders.length;
}

export interface LoyaltyLevel {
  status: string;
  count: number;
  bgClass: string;
  textClass: string;
  borderClass: string;
  hasTick: boolean;
}

/**
 * Returns the loyalty level info based on successful purchase count.
 */
export function getLoyaltyLevel(count: number): LoyaltyLevel {
  if (count <= 1) {
    return {
      status: 'WELCOME CLIENT',
      count,
      bgClass: 'bg-blue-50 text-blue-700 border-blue-200',
      textClass: 'text-blue-700',
      borderClass: 'border-blue-200',
      hasTick: false
    };
  } else if (count === 2) {
    return {
      status: 'REGULAR CLIENT',
      count,
      bgClass: 'bg-purple-50 text-purple-700 border-purple-200',
      textClass: 'text-purple-700',
      borderClass: 'border-purple-200',
      hasTick: false
    };
  } else if (count === 3) {
    return {
      status: 'TRUSTED CLIENT',
      count,
      bgClass: 'bg-amber-50 text-amber-700 border-amber-200',
      textClass: 'text-amber-700',
      borderClass: 'border-amber-200',
      hasTick: false
    };
  } else if (count === 4) {
    return {
      status: 'VIP CLIENT',
      count,
      bgClass: 'bg-amber-100 text-amber-800 border-amber-300',
      textClass: 'text-amber-800',
      borderClass: 'border-amber-300',
      hasTick: false
    };
  } else {
    // 5 or more purchases
    return {
      status: 'VERIFIED CLIENT',
      count,
      bgClass: 'bg-[#1877F2]/10 text-[#1877F2] border-[#1877F2]/20',
      textClass: 'text-[#1877F2]',
      borderClass: 'border-[#1877F2]/20',
      hasTick: true
    };
  }
}

/**
 * Highly polished Meta-style verified blue tick mark.
 */
export function VerifiedTick() {
  return (
    <span 
      className="inline-flex items-center justify-center bg-[#1877F2] text-white rounded-full p-0.5 select-none shrink-0" 
      style={{ width: '15px', height: '15px', alignSelf: 'center' }} 
      title="Verified Enterprise Client"
    >
      <Check className="w-3.5 h-3.5 stroke-[4.5]" style={{ transform: 'scale(0.85)' }} />
    </span>
  );
}

/**
 * Compact pill-shaped loyalty badge rendered dynamically.
 */
export function LoyaltyBadge({ count }: { count: number }) {
  const level = getLoyaltyLevel(count);
  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full border shrink-0 ${level.bgClass} font-sans`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
      {level.status}
    </span>
  );
}

