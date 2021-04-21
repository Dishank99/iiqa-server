
var admin = require("firebase-admin");

var serviceAccount = require("../iiqa-dev-firebase-adminsdk-dq3qt-9f7d49ee85.json");

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "iiqa-dev.appspot.com",
});

exports.firestore = app.firestore()
exports.storage = app.storage().bucket()
exports.auth = app.auth()
