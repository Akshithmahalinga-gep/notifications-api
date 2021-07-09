const express = require('express');
const dbV1 = require('./dbV1/dbV1');
const notificationRoutes = require('./routes/notification');
const userRoutes = require('./routes/user');

const app = express();
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({ extended: false }))

app.use('/', notificationRoutes);
app.use('/user', userRoutes);

const db = dbV1.connectToDB();

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("connecting to db successful, launching server...")
    const port = process.env.PORT || 80;
    app.listen(port, () => {
    console.log(`server started on port ${port}`);
    dbV1.setUpWatch(db);
})
});