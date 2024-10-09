const express = require("express");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const Hash = mongoose.model("Hash");
const router = express.Router();

const {
  newAccessToken,
  verifyTokenAndReturnHash,
} = require("../../security/token");
const {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendChangePasswordConfirmationEmail,
} = require("../../utils/mailer/config");

/*
@type     -   POST
@route    -   /auth/signup
@desc     -   Endpoint to signup the new users.
@access   -   public
*/
router.post("/signup", async (req, res) => {
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
      verified: false,
      roles: ["user"],
    });

    const user = await newUser.save();
    await sendEmailVerification(user._id, email);
    res.status(200).json({
      message: "Account has been created successfully",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
@type     -   POST
@route    -   /auth/signin
@desc     -   Endpoint to signin the existing users.
@access   -   public
*/
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res
      .status(400)
      .json({ message: "Bad Request! email or password should be provided" });

  try {
    const user = await User.findOne({ email });

    if (!user)
      return res.status(401).json({ message: "Invalid email or password" });
    if (!(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.verified) {
      return res.status(401).send({
        message:
          "This account is not verified for login. Please check your email to verify.",
      });
    }

    const token = newAccessToken(user._id);

    res.status(200).json({ access_token: token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
@type     -   POST
@route    -   /auth/verify-email/res
@desc     -   Endpoint to which will verify the email address and allow user to login
@access   -   private
*/
router.put("/verify-email/res", async (req, res) => {
  const token = req.query.t;
  try {
    const tokenHash = await verifyTokenAndReturnHash(token);

    const hash = await Hash.findOne({ hash: tokenHash });
    if (hash) {
      await User.findByIdAndUpdate(hash.user_id, { verified: true });
      await Hash.findByIdAndDelete(hash._id);
      res.status(200).json({ message: "Email Verified Successfully" });
    } else {
      return res.status(400).json({
        message:
          "Something went wrong. Please try again or send a new verification request.",
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/*
@type     -   POST
@route    -   /auth/user/send-password-reset
@desc     -   Endpoint to semd the email for resetting the user's password.
@access   -   public
*/
router.post("/user/send-password-reset", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "This email does not exist" });

    sendPasswordResetEmail(user._id, email)
      .then(() => {
        res.status(200).json({ message: "Email has been sent successfully" });
      })
      .catch((error) => {
        res.status(400).send(error);
      });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/*
@type     -   PUT
@route    -   /auth/user/reset-password
@desc     -   Endpoint to reset the user password if the user has forgot and send the confirmation of change.
@access   -   public
*/
router.put("/user/reset-password", async (req, res) => {
  const { password } = req.body;
  const token = req.query.t;
  try {
    const tokenHash = await verifyTokenAndReturnHash(token);
    const hash = await Hash.findOne({ hash: tokenHash });

    if (!hash)
      return res.status(400).json({
        message:
          "Something went wrong. Please send a new verification request.",
      });

    User.updateOne({ _id: hash.user_id }, { password: password })
      .then(async () => {
        console.log(hash);
        const user = await User.findById(hash.user_id);
        await sendChangePasswordConfirmationEmail(user.email);
        await Hash.findByIdAndDelete(hash._id);
        res
          .status(200)
          .send({ message: "Password has been reset successfully." });
      })
      .catch((error) => {
        res.status(400).json(error);
      });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
