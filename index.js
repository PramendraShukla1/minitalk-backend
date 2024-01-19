const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcryptjs = require("bcryptjs");
const jsonwebtoken = require("jsonwebtoken");
const shuffle = require('lodash/shuffle');
const mongoose = require("mongoose");
const User = require("./model/User.js");
const EnglishQuestionSchema = require('./model/QuestionSchemas/EnglishQuestions.js')
const AnswerModel = require("./model/AnswerSchemas/AnswerSchema.js");
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://your-frontend-domain.com');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

//Cors
app.use(
  cors({
    credentials: true,
    origin: "https://65aab41e43eb8c048bdb628f--harmonious-pasca-6e9c12.netlify.app",
  })
);

//Server, MongoDB, JWT Variables
const port = process.env.PORT;
const mongoDB = process.env.MONGODB_URL;
const jwtSecret = process.env.JWT_SECRET;

//MONGODB and Server Connection
app.listen(port, () => {
  console.log(`server running on port ${port}`);
});

mongoose.connect(mongoDB);
mongoose.connection.on("connected", () => {
  console.log("Database connected successfully");
});

//Register user

app.post("/register", async (req, res) => {
  const {
    username,
    email,
    password,
    nativeLanguage,
    profession,
    preferredLanguage,
    nativeCountry,
  } = req.body;

  try {
    //Check if user is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User is already registered" });
    }

    //Create new user
    const newUser = await User.create({
      username,
      email,
      password: bcryptjs.hashSync(password, bcryptjs.genSaltSync(10)),
      nativeLanguage,
      profession,
      preferredLanguage,
      nativeCountry,
    });
    res.json(newUser);
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Error coming from user register" });
  }
});

//Login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const userDoc = await User.findOne({ email });

    if (userDoc) {
      const passOk = bcryptjs.compareSync(password, userDoc.password);

      if (passOk) {
        const token = jsonwebtoken.sign(
          { email: userDoc.email, id: userDoc._id },
          jwtSecret,
          {}
        );
        res.cookie("token", token).json(userDoc);
      } else {
        res.status(401).json({ error: "Password is invalid" });
      }
    } else {
      res.status(400).json({ error: "User not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: "Something wrong with email or password" });
  }
});


//API FOR LOGOUT USER
//User Logout API
app.post("/logout", (req, res) => {
  res.cookie("token", "").json(true);
});

//Fetch user profile for authentication and Information
app.get('/profile',(req,res)=>{
  const {token} = req.cookies;
  if(token){
    jsonwebtoken.verify(token,jwtSecret,{},async(err,userData)=>{
      if(err){
        console.log(err)
        res.status(400).json({error:"Error in fetching profile"})
      }else{
       const {username, email,nativeLanguage,profession, preferredLanguage, nativeCountry,_id} =await User.findById(userData.id);
       res.status(200).json({username, email,nativeLanguage,profession, preferredLanguage, nativeCountry,_id})
      }
    })
  }else{
    res.json(null)
  }
})

//API FOR INSERTING ENGLISH QUESTIONS IN SCHEMA

app.post('/english-question-schema',async(req,res)=>{
  const {question, optionOne, optionTwo, optionThree, optionFour,correctAnswer} = req.body;
  try {
    const newEnglishQuestion = await EnglishQuestionSchema.create({
      question,
      optionOne,
      optionTwo,
      optionThree,
      optionFour,
      correctAnswer
    })
    res.json(newEnglishQuestion)
  } catch (error) {
    res.status(400).json({error:"Error creating new question for english"})
  }
 
})



//API TO GET ALL ENGLISH QUESTIONS

app.get('/english-question-schema',async(req,res)=>{
try {
  const allQuestions = await EnglishQuestionSchema.find();

  const shuffledQuestions = shuffle(allQuestions)
  const randomQuestions = shuffledQuestions.slice(0,10)
  res.json(randomQuestions)
} catch (error) {
  console.error(error);
    res.status(500).json({ error: 'Server Error From Random Question Fetcher' });
}
})


//API TO GET CORRECT ANSWERS FOR ENGLISH PAPER
app.post('/submit-answers',async(req,res)=>{
  const {answers, user, testName} = req.body;
  try {
    for(const answer of answers){
      const validationResult = AnswerModel.validate(answer);
      if (validationResult.error) {
        return res.status(400).json({ error: validationResult.error.details[0].message });
      }
    }
    const savedAnswers = await AnswerModel.create({
      answers,
      user,
      testName
    });
    return res.status(201).json(savedAnswers)
  } catch (error) {
    console.error('Error saving answers:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
})



app.post('/calculate-english-marks', async (req, res) => {
  try {
    const { userId, testName } = req.body;

    // Fetch the latest answer for the specified test and user, sorted by timestamp in descending order
    const latestUserAnswers = await AnswerModel
      .findOne({ user: userId, testName })
      .sort({ timestamp: -1 }); // Sort in descending order based on timestamp

    if (!latestUserAnswers) {
      return res.status(404).json({ error: 'User answers not found for the specified test' });
    }

    // Fetch all questions for the specified test
    const testQuestions = await EnglishQuestionSchema.find();

    // Initialize variables to track correct answers and total marks
    let correctAnswers = 0;
    let totalMarks = 0;

    latestUserAnswers.answers.forEach((userAnswer) => {
      const { questionId, answer } = userAnswer;


      const matchingQuestion = testQuestions.find((question) => question._id.toString() === questionId);

      if (matchingQuestion) {
   
        totalMarks++;

     
        if (matchingQuestion.correctAnswer === answer) {
          correctAnswers++;
        }
      }
    });

    // Calculate the percentage
    const percentage = (correctAnswers / totalMarks) * 100;


    return res.status(200).json({ percentage, correctAnswers, totalMarks });
  } catch (error) {
    console.error('Error calculating English marks:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});


