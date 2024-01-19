const mongoose = require('mongoose')
const {Schema} = mongoose

const EnglishQuestions = new Schema({
question:String,
optionOne:String,
optionTwo:String,
optionThree:String,
optionFour:String,
correctAnswer:String,
},{
    timestamps:true
})

const englishQuestionModel = mongoose.model('EnglishQuestionSchema',EnglishQuestions)
module.exports = englishQuestionModel