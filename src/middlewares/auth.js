const adminAuth = (req, res, next) => {
  const token = "xyzz";
  const isAdminAuthorized = token === "xyz";
  if (!isAdminAuthorized) {
    res.send("Unauthorized request");
  } else {
    next();
  }
};

const userAuth = (req, res, next) => {
  const token = "xyz";
  const isUserAuthorized = token === "xyz";
  if (!isUserAuthorized) {
    res.send("Unauthorized request");
  } else {
    next();
  }
};

module.exports = { adminAuth, userAuth };
