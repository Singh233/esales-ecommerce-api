import { betterAuth } from 'better-auth';
import { MongoClient } from 'mongodb';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { nextCookies } from 'better-auth/next-js';

import config from './config.js';

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
        after: async () => {
          // TODO: Send welcome email
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
