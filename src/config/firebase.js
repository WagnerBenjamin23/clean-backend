const admin = require ("firebase-admin");

const serviceAccount = require("../../firebase-service-account.json");


admin.initializeApp({

  credential: admin.credential.cert(serviceAccount),
  storageBucket:"gs://seedsoflove-380d2.appspot.com"

});

module.exports = admin;