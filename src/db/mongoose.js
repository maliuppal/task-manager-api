const mongoose = require('mongoose');
const config = require('config');

// const connectionString = config.get('configurations.mongoURL');

mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
});
