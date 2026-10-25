const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  changePassword
} = require('../controllers/customerController');
const {
  updateProfileValidation,
  changePasswordValidation
} = require('../middleware/validator');
const { verifyToken, isCustomer } = require('../middleware/auth');

// Apply customer security barrier to all routes in this router
router.use(verifyToken, isCustomer);

// Customer self-management endpoints
router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);

module.exports = router;
