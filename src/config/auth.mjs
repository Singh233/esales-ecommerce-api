import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies } from 'better-auth/next-js';

import config from './config.js';
import logger from './logger.js';
import { sendEmail } from '../services/email.service.js';

const client = new MongoClient(config.mongoose.url);
const db = client.db();

export const auth = betterAuth({
  trustedOrigins: config.cors.allowedOrigins,
  database: mongodbAdapter(db),
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const { sendWelcomeEmail } = await import('../services/email.service.js');
            sendWelcomeEmail(user);
            sendEmail('sanambir123@gmail.com', 'New User Registration', `A new user has registered: ${user.email}`);
          } catch (error) {
            logger.error('Error sending welcome email:', error);
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
  advanced: {
    defaultCookieAttributes: {
      sameSite: 'none',
      secure: true,
      httpOnly: true,
      domain: config.env === 'production' ? '.chillsanam.com' : 'localhost',
    },
  },
});
