const User = require('../models/User');

/**
 * @desc    Get dashboard metrics & summary counts
 * @route   GET /api/admin/metrics
 * @access  Private (Admin only)
 */
const getMetrics = async (req, res, next) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' });
    const activeCustomers = await User.countDocuments({ role: 'customer', status: 'active' });
    const inactiveCustomers = await User.countDocuments({ role: 'customer', status: 'inactive' });

    // Count customers registered in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentRegistrations = await User.countDocuments({
      role: 'customer',
      createdAt: { $gte: thirtyDaysAgo }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalCustomers,
        activeCustomers,
        inactiveCustomers,
        recentRegistrations
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get paginated, searchable, filterable list of customers
 * @route   GET /api/admin/customers
 * @access  Private (Admin only)
 */
const getCustomers = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const { search, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Base query for customer role only
    const query = { role: 'customer' };

    // Status filter
    if (status && ['active', 'inactive'].includes(status)) {
      query.status = status;
    }

    // Search query on name, email, or phone
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    // Sorting
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Execute queries concurrently
    const [customers, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password'),
      User.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    return res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single customer details by ID
 * @route   GET /api/admin/customers/:id
 * @access  Private (Admin only)
 */
const getCustomerById = async (req, res, next) => {
  try {
    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    return res.status(200).json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Edit customer information
 * @route   PUT /api/admin/customers/:id
 * @access  Private (Admin only)
 */
const updateCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, status } = req.body;

    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    // If changing email, check for duplicate
    if (email && email.toLowerCase() !== customer.email) {
      const emailTaken = await User.findOne({
        email: email.toLowerCase(),
        _id: { $ne: customer._id }
      });
      if (emailTaken) {
        return res.status(409).json({
          success: false,
          message: 'Another user already exists with this email address.'
        });
      }
      customer.email = email.toLowerCase();
    }

    if (name !== undefined) customer.name = name.trim();
    if (phone !== undefined) customer.phone = phone.trim();
    if (address !== undefined) customer.address = address.trim();
    if (status !== undefined && ['active', 'inactive'].includes(status)) {
      customer.status = status;
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: 'Customer details updated successfully.',
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle customer active/inactive status
 * @route   PATCH /api/admin/customers/:id/status
 * @access  Private (Admin only)
 */
const toggleCustomerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const customer = await User.findOne({ _id: req.params.id, role: 'customer' });
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    // Toggle or set specific status
    if (status && ['active', 'inactive'].includes(status)) {
      customer.status = status;
    } else {
      customer.status = customer.status === 'active' ? 'inactive' : 'active';
    }

    await customer.save();

    return res.status(200).json({
      success: true,
      message: `Customer account is now ${customer.status}.`,
      data: {
        id: customer._id,
        status: customer.status,
        updatedAt: customer.updatedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetrics,
  getCustomers,
  getCustomerById,
  updateCustomer,
  toggleCustomerStatus
};
