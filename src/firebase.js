// firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

const firebaseConfig = { 
  apiKey: "AIzaSyCdenu99Ky0MzMD-3kYNjMTsrvpueq7PO4",
  authDomain: "cozy-home-c06d8.firebaseapp.com",
  projectId: "cozy-home-c06d8",
  storageBucket: "cozy-home-c06d8.appspot.com",
  messagingSenderId: "555762412973",
  appId: "1:555762412973:web:dcd1586575ee20e2edc524",
  measurementId: "G-Z4RR8WS8TG"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage, storageRef, uploadBytes, getDownloadURL };
