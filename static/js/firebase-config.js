// Firebase Configuration & Authentication Module for Subhrajit Portfolio

// Registered Admin Email
const ADMIN_EMAIL = "subhrajitbhattacharjee@gmail.com";

// Firebase App Configuration (Replace with your Firebase Console keys if desired)
const firebaseConfig = {
    apiKey: "AIzaSyD-PortfolioSecureAdminKey2026Example",
    authDomain: "subhrajit-portfolio.firebaseapp.com",
    projectId: "subhrajit-portfolio",
    storageBucket: "subhrajit-portfolio.appspot.com",
    messagingSenderId: "987654321098",
    appId: "1:987654321098:web:abcdef1234567890"
};

// Initialize Firebase if loaded
if (typeof firebase !== 'undefined') {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
}
