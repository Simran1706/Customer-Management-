const express = require('express');
const router = express.Router();
const {
  getMetrics,
  getCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus
} = require('../controllers/adminController');
const {
  adminUpdateCustomerValidation
} = require('../middleware/validator');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Apply admin security barrier to all admin routes
router.use(verifyToken, isAdmin);

// Metrics
router.get('/metrics', getMetrics);

// Customer management
router.get('/customers', getCustomers);
router.get('/customers/:id', getCustomerById);
router.put('/customers/:id', adminUpdateCustomerValidation, updateCustomer);
router.patch('/customers/:id/status', toggleCustomerStatus);

module.exports = router;
