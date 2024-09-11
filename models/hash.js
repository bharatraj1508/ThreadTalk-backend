const mongoose = require("mongoose");

const hashSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  hash: {
    type: String,
    required: true,
  },
});

// Creating the User model
mongoose.model("Hash", hashSchema);
