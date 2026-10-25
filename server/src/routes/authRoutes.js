const express = require('express');
const router = express.Router();
const {
  registerCustomer,
  login,
  getMe
} = require('../controllers/authController');
const {
  registerValidation,
  loginValidation
} = require('../middleware/validator');
const { verifyToken } = require('../middleware/auth');

// Public auth endpoints
router.post('/register', registerValidation, registerCustomer);
router.post('/login', loginValidation, login);

// Private auth endpoints
router.get('/me', verifyToken, getMe);

module.exports = router;
