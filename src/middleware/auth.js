const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
    const userId = decodedToken.userId;
    if (req.params.userId && req.params.userId !== userId) {
      throw "User ID is invalid !";
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: "You are not authorized to do this !",
    });
  }
};
