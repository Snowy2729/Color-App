import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any, // use the version compatible with the installed stripe
  appInfo: {
    name: 'Aura Analyzer',
    version: '1.0.0'
  }
});
