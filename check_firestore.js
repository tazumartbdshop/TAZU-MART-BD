import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

async function getFirestoreDatabaseInstance() {
  let pId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  let dId = process.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID || process.env.FIREBASE_FIRESTORE_DATABASE_ID;

  if (!pId) {
    try {
      const configPath = './firebase-applet-config.json';
      if (fs.existsSync(configPath)) {
        const configRaw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(configRaw);
        pId = config.projectId;
        dId = config.firestoreDatabaseId;
      }
    } catch (err) {
      console.warn("Could not read config file:", err);
    }
  }

  pId = pId || "gen-lang-client-0838847634";
  const app = getApps().length === 0 ? initializeApp({ projectId: pId }) : getApp();
  return dId && dId !== "default" && dId !== "(default)" ? getFirestore(app, dId) : getFirestore(app);
}

async function main() {
  try {
    const db = await getFirestoreDatabaseInstance();
    console.log("Firestore instance resolved.");

    const collections = await db.listCollections();
    console.log("Collections:");
    for (const coll of collections) {
      const snapshot = await coll.limit(5).get();
      console.log(`- ${coll.id}: ${snapshot.size} documents (sample check)`);
      snapshot.forEach(doc => {
        console.log(`  [${doc.id}] =>`, Object.keys(doc.data()));
      });
    }
  } catch (err) {
    console.error("Firestore test error:", err);
  }
}

main();
