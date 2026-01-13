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
  storageBucket:"gs://seedsoflove-380d2.appspot.com"

});

module.exports = admin;