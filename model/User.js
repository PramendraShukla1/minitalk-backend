const mongoose = require('mongoose') 
const {Schema} = mongoose

const userSchema = new Schema({
    username:String,
    email:String,
    password: String,
    nativeLanguage:String,
    profession:String,
    preferredLanguage:String,
    nativeCountry:String,
    
},{
    timestamps:true
})

const userModel = mongoose.model('User',userSchema)
module.exports = userModel