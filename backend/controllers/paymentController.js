const Razorpay = require('razorpay');
const crypto = require('crypto');

// @desc    Create Razorpay Order
// @route   POST /api/payments/create-order
// @access  Public
const createOrder = async (req, res) => {
  try {
    const { amount, currency = 'INR', receipt = 'receipt_' + Date.now() } = req.body;

    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const options = {
      amount: amount * 100, // Amount in paise
      currency,
      receipt,
    };

    const order = await razorpay.orders.create(options);
    
    if (!order) {
      return res.status(500).json({ success: false, message: 'Failed to create order' });
    }

    res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify Payment Signature & Update Plan
// @route   POST /api/payments/verify-signature
// @access  Public
const Company = require('../models/Company');

const verifySignature = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planType, companyId } = req.body;

    const sign = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex');

    if (razorpay_signature === expectedSign) {
      // If planType and companyId provided, update Company in DB
      let updatedCompany = null;
      if (companyId && planType) {
        const plan = planType.toLowerCase().includes('network') ? 'network' : 'core';
        updatedCompany = await Company.findByIdAndUpdate(
          companyId,
          { subscriptionPlan: plan },
          { new: true }
        );
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Payment verified and subscription plan updated successfully',
        company: updatedCompany
      });
    } else {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid signature sent!' 
      });
    }
  } catch (error) {
    console.error('Error verifying signature:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  verifySignature,
};
