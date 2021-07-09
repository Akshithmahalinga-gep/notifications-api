const Pusher = require("pusher");

const pusher = new Pusher({
  appId: "1227422",
  key: "c6bf459ca09940fc7c8b",
  secret: "7a36b067c3ba16197a5c",
  cluster: "ap2",
  useTLS: true
});

var sendNotification = function sendNotification(data, usertype) {
  pusher.trigger(usertype, "notification", {
    notification_id: data
  });
};

var sendAnnouncement = function sendAnnouncement(data) {
  pusher.trigger("Announcements", "announcement", {
    announcement_id: data
  });
};

module.exports = { sendNotification, sendAnnouncement };