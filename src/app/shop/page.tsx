'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'one-time';
  
  
  
  type: 'membership' | 'coins';
  disabled?: boolean;
  coins?: number;
}

const pricingTiers: PricingTier[] = [
  // Membership Tiers
  {
    id: 'basic-monthly',
    name: 'Basic Writer',
    price: 4.99,
    period: 'monthly',
    type: 'membership',
    disabled: true
  },
  {
    id: 'pro-monthly',
    name: 'Pro Writer',
    price: 9.99,
    period: 'monthly',
    type: 'membership',
    disabled: true
  },
  {
    id: 'premium-monthly',
    name: 'Premium Writer',
    price: 14.99,
    period: 'monthly',
    type: 'membership',
    disabled: true
  },
  // Coin Packs
  {
    id: 'coins-small',
    name: 'Starter Pack',
    price: 2.99,
    period: 'one-time',
    type: 'coins',
    coins: 100,
    disabled: true
  },
  {
    id: 'coins-medium',
    name: 'Writer Pack',
    price: 7.99,
    period: 'one-time',
    type: 'coins',
    coins: 350,
    disabled: true
  },
  {
    id: 'coins-large',
    name: 'Champion Pack',
    price: 14.99,
    period: 'one-time',
    type: 'coins',
    coins: 750,
    disabled: true
  }
];

export default function ShopPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'one-time'>('monthly');

  const filteredTiers = pricingTiers.filter(tier => tier.period === selectedPeriod);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 sm:space-y-8"
        >
          {/* Header - Mobile responsive */}
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4">
            <div className="hidden sm:block flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-warm-text mb-3 sm:mb-4">Writer's Shop</h1>
              <p className="text-text-secondary text-sm sm:text-base md:text-lg max-w-2xl mx-auto px-4">
                Please note that these prices and what these memberships include are still being decided so they will probably change.
              </p>
            </div>
            <div className="flex-1 flex justify-center sm:justify-end">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary glow-on-hover text-sm sm:text-base"
                >
                  ← Back to Home
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Period Toggle - Mobile responsive */}
          <div className="flex justify-center mb-6 sm:mb-8">
            <div className="bg-card rounded-lg p-1 flex w-full max-w-sm">
              <button
                onClick={() => setSelectedPeriod('monthly')}
                className={`flex-1 px-3 sm:px-6 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                  selectedPeriod === 'monthly'
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-warm-text hover:bg-card-hover'
                }`}
              >
                Memberships
              </button>
              <button
                onClick={() => setSelectedPeriod('one-time')}
                className={`flex-1 px-3 sm:px-6 py-2 rounded-md transition-all duration-200 text-sm sm:text-base ${
                  selectedPeriod === 'one-time'
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-warm-text hover:bg-card-hover'
                }`}
              >
                Coin Packs
              </button>
            </div>
          </div>

          {/* Pricing Cards - Mobile responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {filteredTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative card p-4 sm:p-6 soft-border ${
                  tier.disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <div className="text-center mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-warm-text mb-2">{tier.name}</h3>
                  
                  <div className="mb-3 sm:mb-4">
                    <span className="text-2xl sm:text-3xl font-bold text-warm-text">${tier.price}</span>
                    <span className="text-text-secondary ml-1 text-sm sm:text-base">
                      /{tier.period === 'monthly' ? 'month' : 'pack'}
                    </span>
                  </div>

                  {tier.type === 'coins' && tier.coins && (
                    <div className="flex items-center justify-center gap-2 mb-3 sm:mb-4">
                      <span className="text-xl sm:text-2xl">💰</span>
                      <span className="text-lg sm:text-xl font-bold text-amber-600">{tier.coins} coins</span>
                    </div>
                  )}
                </div>

                <motion.button
                  whileHover={tier.disabled ? {} : { scale: 1.02 }}
                  whileTap={tier.disabled ? {} : { scale: 0.98 }}
                  disabled={tier.disabled}
                  className={`w-full py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 text-sm sm:text-base ${
                    tier.disabled
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'btn-secondary hover:bg-card-hover'
                  }`}
                >
                  Coming Soon
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section - Mobile responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto mt-12 sm:mt-16"
          >
            <h2 className="text-xl sm:text-2xl font-bold text-warm-text text-center mb-6 sm:mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="card p-4 sm:p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2 text-sm sm:text-base">How do memberships work?</h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Memberships are billed monthly and provide access to premium features. You can cancel anytime and continue using the platform with basic features.
                </p>
              </div>
              <div className="card p-4 sm:p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2 text-sm sm:text-base">What can I do with coins?</h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Coins can be used to enter competitions, purchase premium features, and will be used for future shop items. They never expire and are instantly delivered.
                </p>
              </div>
              <div className="card p-4 sm:p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2 text-sm sm:text-base">Can I cancel my membership?</h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Yes, you can cancel your membership at any time. You'll continue to have access to premium features until the end of your current billing period.
                </p>
              </div>
              <div className="card p-4 sm:p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2 text-sm sm:text-base">Are there refunds?</h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Coin purchases are non-refundable. Membership subscriptions can be cancelled but are not refunded for partial months.
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 
