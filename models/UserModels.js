const mongoose = require("mongoose");

const uniqueValidator = require("mongoose-unique-validator");

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  passeword: { type: String, required: true },
});

userSchema.plugin(uniqueValidator); //permet de ne pas avoir plusieur utilisateur avec la meme adress email

module.exports = mongoose.model("User", userSchema);
