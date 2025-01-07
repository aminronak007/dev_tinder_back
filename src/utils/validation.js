const validator = require("validator");

const validateSignUpData = (req) => {
  const { firstName, email, password } = req.body;

  if (validator.isEmpty(firstName)) {
    throw new Error("Firstname is required!");
  } else if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  } else if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong Password");
  }
};

const validationLoginData = (req) => {
  const { email } = req.body;
  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid");
  }
};

const validateProfileEditData = (req) => {
  const allowedEditFields = [
    "firstName",
    "lastName",
    "photoUrl",
    "gender",
    "age",
    "about",
    "skills",
  ];

  const isEditAllowed = Object.keys(req.body).every((field) =>
    allowedEditFields.includes(field)
  );

  return isEditAllowed;
};

module.exports = {
  validateSignUpData,
  validationLoginData,
  validateProfileEditData,
};
