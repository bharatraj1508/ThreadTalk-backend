const mongoose = require("mongoose");
const Hash = mongoose.model("Hash");
const { emailVerificationToken } = require("../../security/token");
const { randomString } = require("../helper/function");

const sgMail = require("@sendgrid/mail");
var mailResponse;
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmailVerification = async (id, email) => {
  const hashValue = randomString(128);

  const emailToken = emailVerificationToken(hashValue);
  console.log(emailToken);

  const mail_option = {
    to: email,
    from: "no.reply2This@outlook.com",
    subject: "Welcome to ThreadTalk",
    text: `Hi,
    Congratulations!!! You have successfully created your account with ThreadTalk. Your are just one step away to access your account.
    To proceed further, please click on the link below to activate your account.
    This link will expire in 15 minutes.
    ${process.env.FRONTEND_URL}/auth/login?t=${emailToken}`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Account Activation - Congratulations!</h1>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi there,
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Congratulations! You have successfully created your account with TodoTrek. You are just one step away from accessing your account.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        To proceed further, please click on the link below to activate your account. This link will expire in 15 minutes.
      </p>
      <div style="background-color: #4CAF50; border-radius: 5px; padding: 10px 20px; text-align: center;">
        <a href="${process.env.FRONTEND_URL}/auth/login?t=${emailToken}" style="color: #ffffff; text-decoration: none; font-size: 16px;">Activate Account</a>
      </div>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-top: 20px;">
        If you have any questions or need assistance, please feel free to contact our support team.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-top: 20px;">
        Thank you for choosing TodoTrek!
      </p>
    </div>
  </div>`,
  };

  try {
    const hash = new Hash({ user_id: id, hash: hashValue });
    await hash.save();

    await sgMail
      .send(mail_option)
      .then((response) => (mailResponse = response))
      .catch((err) => console.log(err));

    return mailResponse;
  } catch (err) {
    throw new Error(err.message);
  }
};

const sendPasswordResetEmail = async (id, email) => {
  const hashValue = randomString(128);
  const emailToken = emailVerificationToken(hashValue);

  const mail_option = {
    to: email,
    from: "no.reply2This@outlook.com",
    subject: "Reset Password",
    text: `Hi,
    Hi, we have received a request to reset your password. If this was not sent by you, please ignore this email.
    Otherwise, please click on the link below to reset your password.
    This link will expire in 15 minutes.
    ${process.env.FRONTEND_URL}/auth/reset/password?t=${emailToken}`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Password Reset Request</h1>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        Hi there,
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        We have received a request to reset your password. If this request was not initiated by you, please disregard this email.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
        To proceed with resetting your password, please click on the link below. This link will expire in 15 minutes.
      </p>
      <div style="background-color: #4CAF50; border-radius: 5px; padding: 10px 20px; text-align: center;">
        <a href="${process.env.FRONTEND_URL}/auth/reset/password?t=${emailToken}" style="color: #ffffff; text-decoration: none; font-size: 16px;">Reset Password</a>
      </div>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-top: 20px;">
        If you encounter any issues or did not initiate this request, please contact our support team immediately.
      </p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-top: 20px;">
        Thank you,<br>
        Your Company Name
      </p>
    </div>
  </div>`,
  };

  try {
    const hash = new Hash({ hash: hashValue, user_id: id });
    await hash.save();

    await sgMail
      .send(mail_option)
      .then((response) => (mailResponse = response))
      .catch((err) => console.log(err));

    return mailResponse;
  } catch (err) {
    throw new Error(err.message);
  }
};

const sendChangePasswordConfirmationEmail = async (email) => {
  const mail_option = {
    to: email,
    from: "no.reply2This@outlook.com",
    subject: "Password Changed Successfully",
    text: `Hi,
    Your password has been successfully updated. Please log in to your account using your new password.
    If you did not make this change, please contact the administrator immediately for assistance.`,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
    <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);">
      <h1 style="color: #333333; font-size: 24px; font-weight: bold; margin-bottom: 20px;">Password Updated Successfully</h1>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hi,</p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Your password has been successfully updated. Please log in to your account using your new password.</p>
      <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">If you did not make this change, please contact the administrator immediately for assistance.</p>
    </div>
  </div>`,
  };

  try {
    await sgMail
      .send(mail_option)
      .then((response) => (mailResponse = response))
      .catch((err) => console.log(err));

    return mailResponse;
  } catch (err) {
    throw new Error(err.message);
  }
};

module.exports = {
  sendEmailVerification,
  sendPasswordResetEmail,
  sendChangePasswordConfirmationEmail,
};
