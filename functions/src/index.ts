import * as functions from "firebase-functions";
import * as admin from "firebase-admin";


admin.initializeApp();


// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript

export const helloWorld = functions.https.onRequest((request, response) => {
    functions.logger.info("Hello logs!", { structuredData: true });
    console.log("Hello");
    response.send("Hello from Firebase!");
});


export const onDocUpdate = functions.firestore.document("cities/UK").onUpdate(change => {
    admin.firestore().batch
    const after = change.after.data();
    console.log("_______________________", after);
    return admin.firestore().doc("trigger").set({
        event: "update",
        after: String(after),
        before: String(change.before.data())
    });
})

export const firebaseTrigger = functions.firestore.document("{collection}/{id}").onCreate((snap,context)=>{

    const collection = context.params.collection;
    const id = context.params.id;

})

export const getWeather = functions.https.onRequest((request, response) => {
    admin.firestore().doc("cities/UK").get()
        .then(snapShot => {
            console.log("Hellow");

            const data = snapShot.data();
            response.status(200).json(data);
        }).catch(err => {
            console.log(err);
            response.status(500).json(err);
        });
});


export const loopPromise = functions.https.onRequest((request, response) => {

    admin.firestore().doc("areas/boston").get()
        .then(snapShot => {
            const cities = snapShot.data().cities;
            let promises = [];
            for (let index = 0; index < cities; index++) {
                const theCity = cities;
                const p = admin.firestore().doc("cities/" + theCity).get();
                promises.push(p);
            }
            return Promise.all(promises);
        }).then(reolvedPromises => {
            let result = [];
            reolvedPromises.forEach(citySnapshot => {
                const data = citySnapshot.data();
                result.push(data);
            })
            response.status(200).json(result);
        })

})

export const realDB = functions.database.ref("room/{roomId}/message/{msgId}")
    .onCreate(async (snapShot, context) => {
        let roomId = context.params.roomId;
        let msgId = context.params.msgId;
        console.log(roomId, msgId);

        const msgData = snapShot.val();
        const newTextWithEmoji = replaceEmoji(msgData.text);

        await snapShot.ref.update({ text: newTextWithEmoji });

        const msgCountRef = snapShot.ref.parent.parent.child("msgCount");
        return msgCountRef.transaction(count => {
            return count + 1;
        })
    })

export const realDBOnUpdate = functions.database.ref("room/{roomId}/message/{msgId}")
    .onUpdate((snapShot, context) => {
        if (snapShot.after.val().text === snapShot.before.val().text) {
            return null;
        }

        let roomId = context.params.roomId;
        let msgId = context.params.msgId;
        console.log(roomId, msgId);

        const msgData = snapShot.after.val();
        const newTextWithEmoji = replaceEmoji(msgData.text);

        return snapShot.after.ref.update({ text: newTextWithEmoji });
    })

export const onDeleteMsg = functions.database.ref("room/{roomId}/message/{msgId}")
    .onDelete(async (snapShot, context) => {
        const msgCountRef = snapShot.ref.parent.parent.child("msgCount");
        return msgCountRef.transaction(count => {
            return count - 1;
        })
    })


export const addAdminClaim = functions.https.onCall((req, context) => {
    //context.auth.uid
    return admin.auth().getUserByEmail("david.sn@yahoo.com").then(async usr => {
        console.log(context);

        let x = await admin.auth().setCustomUserClaims(usr.uid, {
            admin: true
        });
        return { x, context, req };
    })
})

export const signIn = functions.https.onRequest(async (req, resp) => {

    let x = await admin.auth().generatePasswordResetLink("david.sn@yahoo.com", { url: "http://localhost:5000/myapp-db7d5/us-central1/getWeather" });
    resp.status(200).json({ "OK": x });
});

//trigger when user created
export const onAuthUSerCreate = functions.auth.user().onCreate(usr => {
    console.log("USER___CREATED ", usr);

    return admin.firestore().collection("users_new").doc(usr.uid).set({
        email:usr.email,
        uid:usr.uid
    })
});

//trigger when user deleted
export const onAuthUserDeleted = functions.auth.user().onDelete(usr => {
    console.log("USER====DELETED ", usr);
});




function replaceEmoji(text: string) {
    return text.replace(/\bpizza\b/g, "🍕");
}