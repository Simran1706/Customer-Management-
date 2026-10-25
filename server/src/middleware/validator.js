const { body, validationResult } = require('express-validator');

/**
 * Middleware to check validation results and return formatted error response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0]?.message || 'Validation failed',
      errors: formattedErrors
    });
  }
  next();
};

/**
 * Validation rules for customer registration
 */
const registerValidation = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name can only contain alphabetic letters and spaces'),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address (e.g. name@example.com)')
    .normalizeEmail(),

  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^(\+91[\-\s]?)?[6-9]\d{9}$|^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('address')
    .trim()
    .notEmpty()
    .withMessage('Physical address is required')
    .isLength({ min: 8, max: 300 })
    .withMessage('Address must be at least 8 characters long'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),

  body('confirmPassword')
    .notEmpty()
    .withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),

  validate
];

/**
 * Validation rules for user login
 */
const loginValidation = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required'),

  validate
];

/**
 * Validation rules for customer profile update
 */
const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name can only contain alphabetic letters and spaces'),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+91[\-\s]?)?[6-9]\d{9}$|^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 8, max: 300 })
    .withMessage('Address must be at least 8 characters long'),

  validate
];

/**
 * Validation rules for changing password
 */
const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .notEmpty()
    .withMessage('New password is required')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error('New password cannot be the same as the current password');
      }
      return true;
    }),

  body('confirmNewPassword')
    .notEmpty()
    .withMessage('Confirm new password is required')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('New passwords do not match');
      }
      return true;
    }),

  validate
];

/**
 * Validation rules for admin updating customer
 */
const adminUpdateCustomerValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 60 })
    .withMessage('Name must be between 2 and 60 characters')
    .matches(/^[a-zA-Z\s.]+$/)
    .withMessage('Name can only contain alphabetic letters and spaces'),

  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .optional()
    .trim()
    .matches(/^(\+91[\-\s]?)?[6-9]\d{9}$|^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit mobile number'),

  body('address')
    .optional()
    .trim()
    .isLength({ min: 8, max: 300 })
    .withMessage('Address must be at least 8 characters long'),

  body('status')
    .optional()
    .isIn(['active', 'inactive'])
    .withMessage('Status must be either active or inactive'),

  validate
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation,
  adminUpdateCustomerValidation
};
