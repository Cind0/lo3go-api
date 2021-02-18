const bcrypt = require("bcrypt");
const Joi = require("joi");
const { User } = require("../models/user");
const router = require("express").Router();

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or passowrd!");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or passowrd!");

  const token = user.generateAuthToken();

  res.send(token);

});

function validate(User) {
  const schema = {
    email: Joi.string().min(5).max(255).required().email(),
    password: Joi.string().min(5).max(255).required(),
  };

  return Joi.validate(User, schema);
}

module.exports = router;
