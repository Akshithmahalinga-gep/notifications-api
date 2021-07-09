const express = require('express'); 
const router = express.Router();
const dbV1 = require('../dbV1/dbV1');

const User = dbV1.User;
const Notification = dbV1.Notification;


router.post('/create-notification', async (req, res) => {
    var notif = req.body;
    var new_notif = new Notification();
    new_notif.title = notif.title;
    new_notif.tag = notif.tag;
    new_notif.body = notif.body;
    new_notif.usertype = notif.usertype;
    new_notif.isAnnouncement = notif.isAnnouncement;
    //new_notif.date = notif.date;

    await new_notif.save();
    if (new_notif.isAnnouncement == false) {
        await User.updateMany({ usertype: new_notif.usertype },
            {
                $addToSet:
                {
                    notifications: { notificationID: new_notif._id, isRead: false }
                }
            }, function (err, res) {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("Update successful");
                    console.log()
                }
            }
        );
    } else {
        await User.updateMany({},
            {
                $addToSet:
                {
                    notifications: { notificationID: new_notif._id, isRead: false }
                }
            }, function (err, res) {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("Update successful");
                    console.log()
                }
            }
        );
    }

    res.status(201).send({ "message": `New notification created ${new_notif._id}` })
})

router.post('/update-read-status', async (req, res) => {
    var notif_id = req.body.notif_id;
    var user_id = req.body.user_id;
    var user = await User.findOneAndUpdate({_id: user_id, "notifications.notificationID" : notif_id},{
        $set: {
            "notifications.$.isRead" : true
        }
    });
    res.status(200).send({"message" : `Read status updated for Notification ${notif_id}`});
})

router.post('/notifications', async (req, res) => {
    var user_id = req.body.user_id;
    var page_num = req.body.page_num;
    var notifications = [];

    var user = await User.findById(user_id, function (err) {
        if (err) {
            console.log("Getting user failed");
        }
    });

    var totalNotifs = user.notifications.length;

    var userNotifs = user.notifications.toObject().reverse();

    var end = ((page_num * 10) > totalNotifs) ? totalNotifs : page_num * 10;

    userNotifs = userNotifs.slice((page_num - 1) * 10, end);

    var pages = Math.ceil(totalNotifs / 10);

    if (user.notifications.length > 0) {
        var notificationIDs = [].concat(...userNotifs).map(({ notificationID }) => notificationID);

        var userNotifications = await Notification.find().where('_id').in(notificationIDs).exec();

        for (notifID of notificationIDs) {
            var userNotif = userNotifs.find(obj => obj.notificationID == notifID);
            var notification = userNotifications.find(obj => obj._id == notifID);
            if (notification !== undefined) {
                var modifiedNotif = Object.assign(notification.toObject(), { isRead: userNotif.isRead });
                notifications.push(modifiedNotif);
            }
        }
    }

    var result = {
        notifications: notifications,
        pages: pages
    };

    res.status(200).send(JSON.stringify(result));
})

router.post('/get-notification', async (req, res) => {
    var notif_id = req.body.notif_id;
    var user_id = req.body.user_id;

    var user = await User.findById(user_id, function (err) {
        if (err) {
            console.log("Getting user failed");
        }
    });

    var totalNotifs = user.notifications.length;
    var pages = Math.ceil(totalNotifs/10);
    var notification = await Notification.findById(notif_id);

    var result = {
        notification: notification,
        pages: pages
    }

    if (notification == null) {
        res.status(404).send({ "message": `The requested notification id is invalid or doesn't exists` });
    } else {
        res.status(200).send(JSON.stringify(result));
    }
});


router.post('/clear-notification', async(req, res) => {
    var user_id = req.body.user_id;
    var notif_id = req.body.notif_id;

    await User.findOneAndUpdate({_id: user_id},
        {
            $pull: {notifications : { notificationID : notif_id}}
        });

    res.status(200).send({"message" : `notification ${notif_id} cleared for user ${user_id}`});
});

router.post('/clear-all-notifications', async (req, res) => {
    var user_id = req.body.user_id;

    await User.findOneAndUpdate({_id: user_id},
        {
            $pull: {notifications : {}}
        })
    
    res.status(200).send({"message" : `cleared all notifications for user ${user_id}`});
});

module.exports = router;