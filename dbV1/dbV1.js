const mongoose = require('mongoose');
const pusherV1 = require('../pusherV1/pusherV1');

var NotificationSchema = new mongoose.Schema(
    {
        title: {
            type: String
        },
        body: {
            type: String
        },
        tag: {
            type: String
        },
        usertype: {
            type: String
        },
        isAnnouncement : {
            type: Boolean
        }
    },
        {
            timestamps: true
        }
    
);

var Notification = mongoose.model('Notification',NotificationSchema);

const User = mongoose.model('User', {
    username: String,
    email: String,
    password: String,
    usertype: String,
    notifications: [{ notificationID: String, isRead: Boolean }]
});

var dbUrl = 'mongodb+srv://pushdb:pushdb@notificationdb.efhtb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'

var connectToDB = function connectToDB() {
    mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    })
    console.log(`connecting to db...`);
    const db = mongoose.connection;
    return db;
}

var setUpWatch = function setUpWatch(db) {
    const notificationCollection = db.collection("notifications");
    console.log("listening to changes on notifications collection...");
    const changeStream = notificationCollection.watch();

    changeStream.on('change', (change) => {
        if(change.fullDocument.isAnnouncement == true){
            pusherV1.sendAnnouncement(change.fullDocument._id)
        } else
        {
            pusherV1.sendNotification(change.fullDocument._id, change.fullDocument.usertype);
        }
    });
}


module.exports = {connectToDB, setUpWatch, User, Notification}
