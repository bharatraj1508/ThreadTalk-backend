const mongoose = require("mongoose");

// Middleware function to check if the user is authenticated
module.exports = (Model) => async (req, res, next) => {
  const user = req.user;

  const id = req.params.id;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid question ID" });
  }

  const resource = await Model.findById(id);
  if (!resource)
    return res.status(404).json({ message: "Unable to find the resource." });

  if (!resource.author.equals(user._id)) {
    return res
      .status(403)
      .json({ message: "Only owner of this resource can update the content." });
  }

  next();
};
