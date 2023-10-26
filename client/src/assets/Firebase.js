import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {

  apiKey: process.env.REACT_APP_API_KEY,

  authDomain: process.env.REACT_APP_AUTHDOMAIN_ID,

  projectId: process.env.REACT_APP_PROJECT_ID,

  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,

  messagingSenderId: process.env.REACT_APP_MESSAGESENDER_ID,

  appId: process.env.REACT_APP_APP_ID

};



  const app2= initializeApp(firebaseConfig);
  export const db = getFirestore(app2);