const mongoose = require('mongoose')
function Connection() {
    const mongoURI = "mongodb+srv://root:83JPVLOTEpNx5bkB@cluster0.jo2ezww.mongodb.net/chatbot?"
    mongoose.connect(mongoURI)
    .then(() => console.log("connected"))
    .catch(err => console.log(err))
}

module.exports = Connection