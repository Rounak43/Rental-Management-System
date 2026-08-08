import { initializeApp, getApps, cert } from 'firebase-admin/app';
import dotenv from 'dotenv';

dotenv.config();

if (getApps().length === 0) {
  try {
    const projectId = process.env.FIREBASE_PROJECT_ID || 'rentsphere-338ae';
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : undefined;

    if (clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log('Firebase Admin SDK initialized with service account cert');
    } else {
      initializeApp({
        projectId,
      });
      console.log('Firebase Admin SDK initialized with Project ID fallback:', projectId);
    }
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error.message);
  }
}
