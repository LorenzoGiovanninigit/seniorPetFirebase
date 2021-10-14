import * as functions from "firebase-functions"
import * as nodemailer from "nodemailer"
import * as smtpTransport from 'nodemailer-smtp-transport'

import * as admin from "firebase-admin"
import { _topicWithOptions } from "firebase-functions/v1/pubsub"

const user = 'lorenzogiovannini19@gmail.com'//email
//const pass = 'Cocomerodev89!'//password
const pass = 'Cocomero88!'
const transporter = nodemailer.createTransport(smtpTransport({
    service: 'Gmail',
    secure: true,
    auth: {
        user,
        pass
    }
}))


//admin.initializeApp({credential:admin.credential.cert("./account.json")})
admin.initializeApp();
const db = admin.firestore();

class User {
    telephone: string = '';
    address: string = '';
    email: string = '';
    displayName: string = '';
    constructor(telephone: string, address: string, email: string, displayName: string) {
        this.telephone = telephone;
        this.address = address;
        this.email = email;
        this.displayName = displayName
    }
}

class Pet {
    petName:string = '';
    constructor(petName: string) {
        this.petName = petName;
    }
}

exports.sendEmail = functions.https.onCall(async (data, context) => {
    // get the pet id
    const uid = data.uid.replace('"', '').replace('"', '');
    const pet_id = data.id;
    //const uid = "sLg3sxRsp3O5TMoVdfyOfJW1ksy1"
    console.log("PetID", pet_id);
    console.log("UID", uid);


    const petConverter = {
        toFirestore: (data: Pet) => data,
        fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
            snap.data() as Pet
    }
   
    const userConverter = {
        toFirestore: (data: User) => data,
        fromFirestore: (snap: FirebaseFirestore.QueryDocumentSnapshot) =>
            snap.data() as User
    }

    // get pet information
    const petDoc = await db.collection("pets")
                            .withConverter(petConverter)
                            .doc(pet_id).get();
                
    const pet = petDoc.data();

    // get userid



    // get user
    const userDoc = await db.collection("users")
                                    .withConverter(userConverter)
                                    .doc(uid).get();
    const user = userDoc.data();
    

    console.log("User", user);
    

    const to = 'lorenzogiovannini19@gmail.com'
    
    

  

    const subject = 'richiesta assistenza'
    
    const text = 'name: ' + ' ' + user?.displayName + ' ' +  ' telefono: ' + user?.telephone + ' ' +  ' indirizzo: ' + user?.address + ' ' + ' mail: ' + user?.email + ' ' + ' nome animale: ' + pet?.petName;

    console.log("Text", text)

    
    if (context.auth) {
        return new Promise((resolve, reject)=>{
            transporter.sendMail({
                priority: 'high',
                from: "lorenzogiovannini19@gmail.com",
                to,  subject, text
            }, (error, info)=>{
                if (error) {
                    console.log('error:', error.message)
                    resolve({
                        error: 2,
                        message: error.message
                    })
                }
                resolve({
                    error: 0, message: ''
                })
            })
        })
    }
    return {
        error: 1,
        message: 'Authentication failed.'
    }
})