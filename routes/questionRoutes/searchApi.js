const express = require("express");
const mongoose = require("mongoose");
const Question = mongoose.model("Question");
const router = express.Router();

/*
@type     -   GET
@route    -   /api/question
@desc     -   Endpoint to get search the list of all the questions.
                User will provide the search term in query params.
                User can also sort the result by TOP (most answered questions), NEW (newly created posts)
                By default it will show the posts that user is following the topic (TO BE IMPLEMENTED)
@access   -   PUBLIC
*/
router.get("/", async (req, res) => {
  try {
    const { sort } = req.query;
    const { search } = req.body;

    let query = {};
    let sortBy = {};

    if (search) {
      query.body = { $regex: search, $options: "i" };
    }

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

    const questions = await Question.find(query).sort(sortBy);

    res.status(200).json(questions);
  } catch (error) {}
});

module.exports = router;
