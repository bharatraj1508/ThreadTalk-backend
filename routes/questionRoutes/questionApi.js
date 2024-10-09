const express = require("express");
const mongoose = require("mongoose");
const Question = mongoose.model("Question");
const router = express.Router();

const requireAuth = require("../../middlewares/requireAuth");
const owner = require("../../middlewares/owner");

/*
@type     -   POST
@route    -   /api/questions
@desc     -   Endpoint to create a new question by the authenticated user.
@access   -   PRIVATE
*/
router.post("/", requireAuth, async (req, res) => {
  try {
    const { body } = req.body;

    const newQuestion = new Question({
      body,
      author: req.user._id,
    });

    await newQuestion.save();

    res.status(201).json({
      message: "Question created successfully",
      data: { question: newQuestion },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/*
@type     -   GET
@route    -   /api/questions/:id
@desc     -   Endpoint to get the question for the provided ID.
@access   -   PUBLIC
*/
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid question ID" });
    }

    const question = await Question.findById(id).populate(
      "author",
      "first_name last_name email"
    );

    if (!question)
      return res
        .status(404)
        .json({ message: "Unable to find the question. It may be deleted." });

    res.status(200).json(question);
  } catch (error) {}
});

/*
@type     -   PUT
@route    -   /api/questions/:id/view
@desc     -   Endpoint to increment the views of the question
@access   -   PUBLIC
*/
router.put("/:id/view", async (req, res) => {
  const { id } = req.params;

  const question = await Question.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  );

  res.status(201).json(question);
});

/*
@type     -   GET
@route    -   /api/question
@desc     -   Endpoint to get list of the questions.
                It send the result based on the page and limit. By default LIMIT=20 and SKIP=10
                User can also sort the result by TOP (most viewed questions), NEW (newly created posts)
                By default it will show the posts that user is following the topic (TO BE IMPLEMENTED)
@access   -   PUBLIC
*/
router.get("/", async (req, res) => {
  try {
    const { sort } = req.query;

    let sortBy = {};

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    switch (sort) {
      case "TOP":
        sortBy = { views: -1 };
        break;
      case "NEW":
        sortBy = { created_at: -1 };
        break;
      default:
        sortBy = { created_at: -1 };
    }

    const questions = await Question.find()
      .populate("author", "first_name last_name email")
      .sort(sortBy)
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Question.countDocuments();

    res.status(200).json({
      total,
      page,
      totalPages: Math.ceil(total / limit),
      questions,
    });
  } catch (error) {}
});

/*
@type     -   PUT
@route    -   /api/questions/:id
@desc     -   Endpoint to update the question for the provided ID.
@access   -   PUBLIC
*/
router.put("/:id", requireAuth, owner(Question), async (req, res) => {
  try {
    const id = req.params.id;
    const { body } = req.body;

    const question = await Question.findByIdAndUpdate(
      id,
      { body, updated_at: Date.now() },
      { new: true }
    );

    if (!question)
      return res.status(404).json({
        message: "Unable to update. Question may not exist",
      });

    res.status(200).json(question);
  } catch (error) {}
});

/*
@type     -   DELETE
@route    -   /api/questions/:id
@desc     -   Endpoint to delete the question for the provided ID.
@access   -   PUBLIC
*/
router.delete("/:id", requireAuth, owner(Question), async (req, res) => {
  try {
    const id = req.params.id;

    const result = await Question.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({
        message: "Unable to delete. Question may not exist",
      });
    }
    res.status(200).json({ message: "Question deleted successfully" });
  } catch (error) {}
});

module.exports = router;
