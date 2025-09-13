'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface PricingTier {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'one-time';
  description: string;
  features: string[];
  popular?: boolean;
  type: 'membership' | 'coins';
  coins?: number;
}

const pricingTiers: PricingTier[] = [
  // Membership Tiers
  {
    id: 'basic-monthly',
    name: 'Basic Writer',
    price: 4.99,
    period: 'monthly',
    description: 'Perfect for casual writers',
    features: [
      'Unlimited daily challenges',
      'Access to special modes',
      'Priority support',
      'Ad-free experience',
      'Exclusive writing prompts'
    ],
    type: 'membership'
  },
  {
    id: 'pro-monthly',
    name: 'Pro Writer',
    price: 9.99,
    period: 'monthly',
    description: 'For serious writers and competitors',
    features: [
      'Everything in Basic',
      'Unlimited competitions',
      'Advanced analytics',
      'Custom themes',
      'Early access to features',
      'Writer community access'
    ],
    popular: true,
    type: 'membership'
  },
  {
    id: 'premium-monthly',
    name: 'Premium Writer',
    price: 19.99,
    period: 'monthly',
    description: 'Ultimate writing experience',
    features: [
      'Everything in Pro',
      'Personal writing coach',
      'Published story features',
      'Exclusive workshops',
      'Direct creator support',
      'Custom badge creation'
    ],
    type: 'membership'
  },
  // Coin Packs
  {
    id: 'coins-small',
    name: 'Starter Pack',
    price: 2.99,
    period: 'one-time',
    description: 'Perfect for trying out premium features',
    features: [
      '100 coins',
      'Instant delivery',
      'No expiration',
      'Use for competitions',
      'Future shop purchases'
    ],
    type: 'coins',
    coins: 100
  },
  {
    id: 'coins-medium',
    name: 'Writer Pack',
    price: 7.99,
    period: 'one-time',
    description: 'Great value for active writers',
    features: [
      '300 coins',
      'Instant delivery',
      'No expiration',
      'Use for competitions',
      'Future shop purchases',
      'Bonus 50 coins'
    ],
    popular: true,
    type: 'coins',
    coins: 350
  },
  {
    id: 'coins-large',
    name: 'Champion Pack',
    price: 14.99,
    period: 'one-time',
    description: 'Best value for serious competitors',
    features: [
      '600 coins',
      'Instant delivery',
      'No expiration',
      'Use for competitions',
      'Future shop purchases',
      'Bonus 150 coins'
    ],
    type: 'coins',
    coins: 750
  }
];

export default function ShopPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'one-time'>('monthly');

  const filteredTiers = pricingTiers.filter(tier => tier.period === selectedPeriod);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-12">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-4xl font-bold text-warm-text mb-4">Writer's Shop</h1>
              <p className="text-text-secondary text-lg max-w-2xl mx-auto">
                Choose the perfect plan for your writing journey. Upgrade your experience with memberships or purchase coins for competitions and future features.
              </p>
            </div>
            <div className="flex-1 flex justify-end">
              <Link href="/">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-secondary glow-on-hover"
                >
                  ← Back to Home
                </motion.button>
              </Link>
            </div>
          </div>

          {/* Period Toggle */}
          <div className="flex justify-center mb-8">
            <div className="bg-card rounded-lg p-1 flex">
              <button
                onClick={() => setSelectedPeriod('monthly')}
                className={`px-6 py-2 rounded-md transition-all duration-200 ${
                  selectedPeriod === 'monthly'
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-warm-text hover:bg-card-hover'
                }`}
              >
                Memberships
              </button>
              <button
                onClick={() => setSelectedPeriod('one-time')}
                className={`px-6 py-2 rounded-md transition-all duration-200 ${
                  selectedPeriod === 'one-time'
                    ? 'bg-gradient-primary text-white shadow-lg'
                    : 'text-warm-text hover:bg-card-hover'
                }`}
              >
                Coin Packs
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {filteredTiers.map((tier, index) => (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative card p-6 soft-border ${
                  tier.popular ? 'ring-2 ring-amber-400 shadow-xl' : ''
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-primary text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-warm-text mb-2">{tier.name}</h3>
                  <p className="text-text-secondary text-sm mb-4">{tier.description}</p>
                  
                  <div className="mb-4">
                    <span className="text-3xl font-bold text-warm-text">${tier.price}</span>
                    <span className="text-text-secondary ml-1">
                      /{tier.period === 'monthly' ? 'month' : 'pack'}
                    </span>
                  </div>

                  {tier.type === 'coins' && tier.coins && (
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <span className="text-2xl">💰</span>
                      <span className="text-xl font-bold text-amber-600">{tier.coins} coins</span>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-sm text-warm-text">{feature}</span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-3 rounded-lg font-medium transition-all duration-200 ${
                    tier.popular
                      ? 'bg-gradient-primary text-white shadow-lg hover:shadow-xl'
                      : 'btn-secondary hover:bg-card-hover'
                  }`}
                >
                  {tier.type === 'membership' ? 'Subscribe Now' : 'Purchase Coins'}
                </motion.button>
              </motion.div>
            ))}
          </div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="max-w-4xl mx-auto mt-16"
          >
            <h2 className="text-2xl font-bold text-warm-text text-center mb-8">Frequently Asked Questions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2">How do memberships work?</h3>
                <p className="text-sm text-text-secondary">
                  Memberships are billed monthly and provide access to premium features. You can cancel anytime and continue using the platform with basic features.
                </p>
              </div>
              <div className="card p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2">What can I do with coins?</h3>
                <p className="text-sm text-text-secondary">
                  Coins can be used to enter competitions, purchase premium features, and will be used for future shop items. They never expire and are instantly delivered.
                </p>
              </div>
              <div className="card p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2">Can I cancel my membership?</h3>
                <p className="text-sm text-text-secondary">
                  Yes, you can cancel your membership at any time. You'll continue to have access to premium features until the end of your current billing period.
                </p>
              </div>
              <div className="card p-6 soft-border">
                <h3 className="font-semibold text-warm-text mb-2">Are there refunds?</h3>
                <p className="text-sm text-text-secondary">
                  Coin purchases are non-refundable. Membership subscriptions can be cancelled but are not refunded for partial months.
                </p>
              </div>
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-12"
          >
            <div className="card p-8 soft-border max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-warm-text mb-4">Ready to Upgrade Your Writing?</h2>
              <p className="text-text-secondary mb-6">
                Join thousands of writers who have already enhanced their experience with our premium features.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/write-story" className="btn-primary glow-on-hover">
                  Start Writing Free
                </Link>
                <Link href="/competitions" className="btn-secondary glow-on-hover">
                  View Competitions
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
} 