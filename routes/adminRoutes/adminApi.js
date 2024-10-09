const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Question = mongoose.model("Question");
const router = express.Router();

const requireAuth = require("../../middlewares/requireAuth");
const admin = require("../../middlewares/admin");
const { generateQuestionPosts } = require("../../utils/helper/function");

router.use(requireAuth);
router.use(admin);

/*
@type     -   POST
@route    -   /admin/create
@desc     -   Endpoint to create an admin account.
@access   -   PRIVATE
*/
router.post("/create", async (req, res) => {
  const { first_name, last_name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(409).json({
      message: "This email has already been taken",
    });

  if (!email || !password)
    return res.status(400).json({
      message:
        "Bad Request! email, password and confirm password should be provided",
    });

  try {
    const newUser = new User({
      first_name,
      last_name,
      email,
      password,
      verified: true,
      roles: ["admin"],
    });

    const user = await newUser.save();

    res.status(200).json({
      message: "Account has been created successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
@type     -   PATCH
@route    -   /api/admin/verify
@desc     -   Endpoint to verify all the faker accounts at once.
@access   -   PRIVATE
*/
router.patch("/verify", async (req, res) => {
  const updateResponse = await User.updateMany(
    { verified: false, faker: true },
    { $set: { verified: true } }
  );

  res.status(200).json({
    message: `${updateResponse.modifiedCount} users verified successfully`,
    updateResponse,
  });
});

/*
@type     -   POST
@route    -   /api/admin/questions/:numOfQuestions
@desc     -   Endpoint to create multiple questions at once by providing number of question in the params.
@access   -   PRIVATE
*/
router.post("/questions/:numOfQuestions", async (req, res) => {
  const number = parseInt(req.params.numOfQuestions) || 5;

  const questions = await generateQuestionPosts(number || 5);

  const newQuestions = await Question.insertMany(questions);

  res.status(200).send({
    message: `${number} questions created succesfully`,
    questions: newQuestions,
  });
});

module.exports = router;
