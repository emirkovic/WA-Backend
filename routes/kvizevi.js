const express = require('express');
const Auth = require('../middleware/auth');
const Quizzes = require('../models/Kviz');
const Users = require('../models/Korisnik');
const Score = require('../models/Rezultati');

const router = express.Router();

// Create a new quiz
router.post('/create', Auth, async (req, res) => {
  const quiz = new Quizzes({
    ...req.body.quiz,
    createdBy: req.body.createdBy,
    questions: req.body.quiz.questions.map((ques) => {
      return {
        ...ques,
        answers: ques.answers.map((ans) => {
          return {
            name: ans,
            selected: false,
          }
        })
      }
    })
  });
  await quiz.save();
  res.status(200).json({ success: true });
})

// Get all quizzes created by a user
router.get('/my-quizzes/:id', Auth, async (req, res) => {
  const result = await Quizzes.find({ createdBy: req.params.id });
  res.status(200).json(result);
})

// Get all quizzes
router.get('/all-quizzes', Auth, async (req, res) => {
  const result = await Quizzes.find();
  res.status(200).json(result);
})

// Get a single quiz
router.get('/get-quiz/:id', Auth, async (req, res) => {
  const quiz = await Quizzes.findOne({ _id: req.params.id });
  if (quiz) {
    res.status(200).json({ quiz });
  } else {
    res.status(500).send('Error getting quiz');
  }
})

// Add a comment to a quiz
router.post('/add-comment', Auth, async (req, res) => {
  try {
    await Quizzes.updateOne(
      { _id: req.body.quizId },
      {
        $push: {
          comments: {
            sentFromId: req.body.sentFromId,
            message: req.body.message,
          }
        }
      }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).send(err);
  }
})

// Like or unlike a quiz
router.post('/like-quiz', Auth, async (req, res, next) => {
    try {
      const user = await Users.findOne({
        _id: req.body.userId,
        likedQuizzes: { $in: [req.body.quizId] }
      });
      if (!user) {
        await Users.updateOne(
          { _id: req.body.userId },
          { $push: { likedQuizzes: req.body.quizId } }
        );
        await Quizzes.updateOne(
          { _id: req.body.quizId },
          { $inc: { likes: 1 } }
        );
        res.status(200).json({ message: 'Added To Liked' });
      } else {
        await Users.updateOne(
          { _id: req.body.userId },
          { $pull: { likedQuizzes: req.body.quizId } }
        );
        await Quizzes.updateOne(
          { _id: req.body.quizId },
          { $inc: { likes: -1 } }
        );
        res.status(200).json({ message: 'Removed from liked' });
      };
    } catch (error) {
      next(error);
    }
  })

// Save results from quiz
router.post('/save-results', Auth, async (req, res, next) => {
    try {
      const { currentUser, answers, quizId } = req.body;
      const score = new Score({ userId: currentUser, answers, quizId });
      const resp = await score.save();
      await Quizzes.updateOne(
        { _id: quizId },
        { $push: { scores: resp._id } }
      );
      res.status(200).json({ scoreId: resp._id });
    } catch (error) {
      next(error);
    }
  })

// Get results from quiz  
router.get('/results/:id', Auth, async (req, res, next) => {
    try {
      const { id } = req.params;
      if (!id) {
        throw new Error('No id provided in params');
      }
      const score = await Score.findOne({ _id: id });
      if (!score) {
        throw new Error('Error finding score');
      }
      const quiz = await Quizzes.findOne({ _id: score.quizId });
      if (!quiz) {
        throw new Error('Error getting quiz');
      }
      res.status(200).json({ score, quiz });
    } catch (error) {
      next(error);
    }
  })
  

module.exports = router;