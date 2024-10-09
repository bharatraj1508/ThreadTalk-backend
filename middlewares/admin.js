// Middleware function to check if the user is authenticated
module.exports = (req, res, next) => {
  const user = req.user;

  if (!user.roles.includes("admin")) {
    return res.status(403).json({
      message: "Access denied.",
    });
  }

  next();
};
