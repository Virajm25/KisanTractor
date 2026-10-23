import dns from 'node:dns';
import { MongoClient } from 'mongodb';
import { collections } from './data.js';

let client;
let db;

export async function connect() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  // Some networks refuse SRV lookups on the system resolver (mongodb+srv URIs); use public DNS then.
  if (uri.startsWith('mongodb+srv://')) {
    const host = uri.split('@').pop().split(/[/?]/)[0];
    const ok = await dns.promises.resolveSrv(`_mongodb._tcp.${host}`).then(() => true, () => false);
    if (!ok) dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
  client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  await client.connect();
  db = client.db(process.env.DB_NAME || 'kisantractor');
  return db;
}

export const getDb = () => db;

export async function seed({ force = false } = {}) {
  let seeded = 0;
  for (const [name, docs] of Object.entries(collections)) {
    const col = db.collection(name);
    if (force) await col.deleteMany({});
    else if ((await col.estimatedDocumentCount()) > 0) continue;
    await col.insertMany(docs.map((d) => ({ ...d })));
    seeded += docs.length;
  }
  return seeded;
}

export async function close() {
  await client?.close();
}
