const mongoose = require('mongoose');
const mongoURL = "mongodb://localhost:27017/inotebook"


const connectToMongo = async () => {
    await mongoose.connect(mongoURL);
    console.log("MongoDB Connected Successfully");
  
};

module.exports = connectToMongo;