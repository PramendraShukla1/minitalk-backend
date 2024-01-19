const mongoose = require('mongoose')
const {Schema} = mongoose

const FrenchQuestions = new Schema({
question:String,
optionOne:String,
optionTwo:String,
optionThree:String,
optionFour:String,
correctAnswer:String,
},{
    timestamps:true
})

const frenchQuestionModel = mongoose.model('FrenchQuestionSchema',FrenchQuestions)
module.exports = frenchQuestionModel