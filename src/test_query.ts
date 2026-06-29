import dotenv from 'dotenv';
import { Firestore } from '@google-cloud/firestore';

dotenv.config();

async function run() {
  try {
    const db = new Firestore({
      projectId: process.env.GOOGLE_CLOUD_PROJECT,
    });
    const docRef = db.collection('settings').doc('supabase_credential');
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      console.log("Firestore Data:", docSnap.data());
    } else {
      console.log("Document does not exist");
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
}

run();
