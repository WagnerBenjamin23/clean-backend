const admin = require ("firebase-admin");

//const serviceAccount = require("../../firebase-service-account.json");
if (!process.env.FIREBASE_SERVICE_ACCOUNT) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT no está definida');
}

const serviceAccount = JSON.parse(
  process.env.FIREBASE_SERVICE_ACCOUNT
);

admin.initializeApp({

  credential: admin.credential.cert(serviceAccount),
  storageBucket: "clean-b63d0.firebasestorage.app",

});

module.exports = admin;