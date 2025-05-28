const { createClient } = require('redis');
const config = require('./config.js');
const logger = require('./logger.js');

let errorLogged = false;
const client = createClient({
  url: config.redis.url,
  password: config.redis.password,
});

client.on('error', (err) => {
  if (!errorLogged) {
    logger.error(`Redis error: ${err}`);
    errorLogged = true;
  }
});

client.on('ready', () => {
  logger.info(`Connected to Redis on ${config.redis.url}`);
  errorLogged = false;
});

client.connect();

const isReady = () => client.isReady;

const setCacheByKey = (key, data, expiry = 3600) => {
  if (!isReady()) {
    return;
  }

  client.set(key, JSON.stringify(data), { EX: expiry });
};

const getCacheByKey = async (key) => {
  if (!isReady()) {
    return null;
  }

  const data = await client.get(key);

  if (data !== null) {
    return JSON.parse(data);
  }

  return null;
};

const deleteCacheByKey = async (key) => {
  if (!isReady()) {
    return;
  }

  client.del(key);
};

const deleteCacheByPattern = async (pattern = '') => {
  try {
    if (client.isReady) {
      for await (const key of client.scanIterator({ MATCH: pattern })) {
        client.del(key);
      }
      return true;
    } else {
      return false;
    }
  } catch (error) {
    logger.error(`Error while deleting keys from redis cache ${error}`);
    return false;
  }
};

const CACHE_KEYS = {
  USER: 'cache:user',
};

module.exports = { client, isReady, setCacheByKey, getCacheByKey, deleteCacheByKey, deleteCacheByPattern, CACHE_KEYS };
