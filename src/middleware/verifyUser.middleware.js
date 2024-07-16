const verifyUser = (req, res, next) => {
  const userId = req.body.userId || req.params.userId;
  if (req.user.id !== userId) {
    return res
      .status(403)
      .json({ error: "Forbidden. You cannot perform this action !" });
  }
  next();
};

module.exports = verifyUser;
