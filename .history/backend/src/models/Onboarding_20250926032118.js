const mongoose = require('mongoose');

const StepSchema = new mongoose.Schema({
  stepNumber: { type: Number, required: true },
  data: { type: mongoose.Schema.Types.Mixed, default: {} },
  completed: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now },
});

const OnboardingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  steps: [StepSchema],
  status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Onboarding', OnboardingSchema);
