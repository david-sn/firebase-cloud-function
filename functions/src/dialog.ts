import * as  admin from "firebase-admin";
var serviceAccount = require("../myapp-db7d5-firebase-adminsdk-g2xs9-8c2f6fcfad.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://myapp-db7d5-default-rtdb.firebaseio.com"
});


;(async () => {
    await formatMsg("pizachatroom", "david", "i need pizza");
    await formatMsg("pizachatroom", "ahmed", "i want pizza");
    await formatMsg("pizachatroom", "ali", "i cook pizza");
    await formatMsg("pizachatroom", "mer", "i finished pizza");

})();


async function formatMsg(room: string, name: string, text: string) {
    const msgRef = admin.database().ref("room").child(room).child("message");
    await msgRef.push({ name, text });

}