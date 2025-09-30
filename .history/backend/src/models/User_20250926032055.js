const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role: { type: String, default: 'user' },
  jiraAccountEmail: { type: String }, // optional mapping to Jira user
  createdAt: { type: Date, default: Date.now },
});

UserSchema.methods.comparePassword = function(password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
