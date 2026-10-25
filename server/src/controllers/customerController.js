const User = require('../models/User');

/**
 * @desc    Get customer's own profile
 * @route   GET /api/customer/profile
 * @access  Private (Customer only)
 */
const getProfile = async (req, res, next) => {
  try {
    // Strictly isolate: only the logged-in customer's own ID from token is queried
    const customer = await User.findById(req.user._id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: customer.role,
        status: customer.status,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update allowed profile fields for logged in customer
 * @route   PUT /api/customer/profile
 * @access  Private (Customer only)
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, address } = req.body;

    const customer = await User.findById(req.user._id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    // Only update allowed fields
    if (name !== undefined) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (address !== undefined) customer.address = address.trim();

    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        role: customer.role,
        status: customer.status,
        updatedAt: customer.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change customer password
 * @route   PUT /api/customer/change-password
 * @access  Private (Customer only)
 */
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Fetch customer with password
    const customer = await User.findById(req.user._id).select('+password');
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    // Validate current password
    const isMatch = await customer.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.'
      });
    }

    // Assign new password (pre-save hook will hash it)
    customer.password = newPassword;
    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully! Please keep your new password safe.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  changePassword
};
