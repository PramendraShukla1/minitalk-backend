const mongoose = require('mongoose')
const {Schema} = mongoose;

const FrenchAnswerSchema = new Schema({
    answers: [
      {
        questionId: { type: String, required: true },
        answer: { type: String, required: true },
      },
    ],
    userId: String,
  },{
    timestamps:true
  });
  
  const FrenchAnswerModel = mongoose.model('FrenchAnswer', FrenchAnswerSchema);
  
  module.exports = FrenchAnswerModel;
  