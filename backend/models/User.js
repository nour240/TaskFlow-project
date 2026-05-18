/*
 * ─── User Model ──────────────────────────────────────────
 * Fields: fullName, email, password (hashed).
 * Pre-save hook hashes the password with bcryptjs (10+ rounds).
 * Instance method `matchPassword` for login verification.
 */
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never returned by default
    },
  },
  { timestamps: true }
);

/* ── Hash password before saving ─────────────────────── */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const rounds = parseInt(process.env.BCRYPT_ROUNDS, 10) || 10;
  this.password = await bcrypt.hash(this.password, rounds);
  next();
});

/* ── Compare candidate password against hash ─────────── */
userSchema.methods.matchPassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
