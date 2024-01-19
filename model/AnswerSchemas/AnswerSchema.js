const mongoose = require('mongoose')
const {Schema} = mongoose;

const AnswerSchema = new Schema({
    answers: [
      {
        questionId: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    user: String,
    testName: String,
    timestamp: { type: Date, default: Date.now },
  },{
    timestamps:true
  });
  
  const AnswerModel = mongoose.model('Answer', AnswerSchema);
  
  module.exports = AnswerModel;
  