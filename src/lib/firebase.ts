import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase singleton
export const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Target the specific firestoreDatabaseId provisioned for this AI Studio project
export const db: Firestore = getFirestore(app, firebaseConfigJson.firestoreDatabaseId || '(default)');

// Initialize Auth
export const auth: Auth = getAuth(app);

export const config = {
  ...firebaseConfigJson,
  databaseId: firebaseConfigJson.firestoreDatabaseId
};
