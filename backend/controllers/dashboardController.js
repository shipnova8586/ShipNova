const Shipment = require('../models/Shipment')
const Driver = require('../models/Driver')
const Vehicle = require('../models/Vehicle')
const mongoose = require('mongoose')

// @desc    Get dashboard statistics for the tenant
// @route   GET /api/dashboard/stats
// @access  Private
const getDashboardStats = async (req, res) => {
  const tenantId = new mongoose.Types.ObjectId(req.tenantId)

  try {
    // 1. Core Counts
    const totalShipments = await Shipment.countDocuments({ companyId: tenantId })
    const activeShipments = await Shipment.countDocuments({
      companyId: tenantId,
      status: { $nin: ['Delivered', 'Cancelled'] }
    })
    const deliveredShipments = await Shipment.countDocuments({
      companyId: tenantId,
      status: 'Delivered'
    })
    const totalDrivers = await Driver.countDocuments({ companyId: tenantId })
    const totalVehicles = await Vehicle.countDocuments({ companyId: tenantId })

    // 2. Weekly Deliveries Aggregation (Last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const weeklyDeliveriesRaw = await Shipment.aggregate([
      {
        $match: {
          companyId: tenantId,
          status: 'Delivered',
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      }
    ])

    // Generate last 7 days array to pad with zeros
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().split('T')[0]);
    }

    const weeklyDeliveries = last7Days.map(dateStr => {
      const found = weeklyDeliveriesRaw.find(item => item._id === dateStr);
      return {
        _id: dateStr,
        count: found ? found.count : 0
      };
    })

    // 3. Monthly Shipments & Revenue Aggregation (Current Year)
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)

    const monthlyShipmentsRaw = await Shipment.aggregate([
      {
        $match: {
          companyId: tenantId,
          createdAt: { $gte: startOfYear }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 },
          revenue: { $sum: '$revenue' }
        }
      },
      { $sort: { _id: 1 } }
    ])

    // Format Monthly data to readable names (e.g. Jan, Feb...)
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    const monthlyShipments = months.map((monthName, index) => {
      const monthNum = index + 1
      const found = monthlyShipmentsRaw.find(item => item._id === monthNum)
      return {
        month: monthName,
        count: found ? found.count : 0,
        revenue: found ? found.revenue : 0
      }
    })

    // 4. Carrier Usage Aggregation (Top 5)
    const carrierUsageRaw = await Shipment.aggregate([
      {
        $match: {
          companyId: tenantId,
          carrierName: { $ne: null }
        }
      },
      {
        $group: {
          _id: '$carrierName',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])

    const carrierUsage = carrierUsageRaw.map(c => ({
      name: c._id,
      value: c.count
    }))

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalShipments,
          activeShipments,
          deliveredShipments,
          totalDrivers,
          totalVehicles
        },
        weeklyDeliveries,
        monthlyShipments,
        carrierUsage
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error retrieving dashboard stats.',
      error: error.message
    })
  }
}

module.exports = {
  getDashboardStats
}
