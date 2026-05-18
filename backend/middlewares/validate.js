 //Uses express-validator to validate request bodies
const { body, validationResult } = require('express-validator');

// Generic handler: checks for validation errors
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

//Signup validation rules 
const validateSignup = [
  body('fullName').trim().notEmpty().withMessage('Full name is required'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidation,
];

// Login validation rules
const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidation,
];


/* ── Project validation rules ────────────────────────── */
const validateProject = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('status')
    .optional()
    .isIn(['actif', 'en pause', 'archivé'])
    .withMessage('Status must be actif, en pause, or archivé'),
  handleValidation,
];


module.exports = {
  validateSignup,
  validateLogin,
};