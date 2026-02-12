// ======= FIREBASE CONFIGURATION =======
const firebaseConfig = {
 apiKey: "AIzaSyCvQdDEaR3BjUA9VcEcf5tnB_DxZQ36k5Y",
  authDomain: "hut-8-series.firebaseapp.com",
  databaseURL: "https://hut-8-series-default-rtdb.firebaseio.com",
  projectId: "hut-8-series",
  storageBucket: "hut-8-series.firebasestorage.app",
  messagingSenderId: "449116112828",
  appId: "1:449116112828:web:0538656553278a2137cdb9"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase shortcuts
const auth = firebase.auth();
const db = firebase.database();
