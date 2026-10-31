import mongoose, { type Mongoose } from 'mongoose';

interface MongooseConnectionCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
  activeUri: string | null;
}

declare global {
  var _mongooseCache: MongooseConnectionCache | undefined;
}

const cache: MongooseConnectionCache = global._mongooseCache ?? {
  conn: null,
  promise: null,
  activeUri: null,
};

if (!global._mongooseCache) {
  global._mongooseCache = cache;
}

export interface ConnectDatabaseOptions {
  uri?: string;
  strict?: boolean;
  serverSelectionTimeoutMS?: number;
}

export class DatabaseConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConfigurationError';
  }
}

export function isDatabaseConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

export function getDatabaseStatus(): {
  connected: boolean;
  readyState: number;
  host: string | null;
} {
  return {
    connected: mongoose.connection.readyState === 1,
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host || null,
  };
}

export async function connectToDatabase(
  options: ConnectDatabaseOptions = {}
): Promise<Mongoose | null> {
  const resolvedUri = (options.uri ?? process.env.MONGODB_URI ?? '').trim();

  if (!resolvedUri) {
    if (options.strict) {
      throw new DatabaseConfigurationError(
        'MONGODB_URI environment variable is not defined.'
      );
    }
    return null;
  }

  if (cache.conn && mongoose.connection.readyState === 1) {
    return cache.conn;
  }

  if (!cache.promise) {
    cache.activeUri = resolvedUri;
    cache.promise = mongoose
      .connect(resolvedUri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: options.serverSelectionTimeoutMS ?? 5000,
      })
      .then((instance) => {
        cache.conn = instance;
        return instance;
      })
      .catch((error) => {
        cache.promise = null;
        cache.conn = null;
        throw error;
      });
  }

  try {
    return await cache.promise;
  } catch (error) {
    if (options.strict) {
      throw error;
    }
    return null;
  }
}

export async function disconnectFromDatabase(): Promise<void> {
  cache.promise = null;
  cache.conn = null;
  cache.activeUri = null;
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}
