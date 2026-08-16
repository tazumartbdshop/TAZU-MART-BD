import { getApps, initializeApp, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import fs from 'fs';

async function main() {
  let pId = "gen-lang-client-0838847634";
  try {
    const configRaw = fs.readFileSync('firebase-applet-config.json', 'utf-8');
    const config = JSON.parse(configRaw);
    pId = config.projectId || pId;
  } catch (e) {}

  const app = getApps().length === 0 ? initializeApp({ projectId: pId }) : getApp();
  const db = getFirestore(app);

  console.log("Listing settings collection in Firestore...");
  const snapshot = await db.collection('settings').get();
  snapshot.forEach(doc => {
    console.log("Doc id:", doc.id, "=> data:", doc.data());
  });

  const bannerSnap = await db.collection('banners').get();
  console.log("Firestore banners count:", bannerSnap.size);
}

main().catch(console.error);
