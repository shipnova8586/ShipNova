import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, Legend, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Line, ComposedChart } from 'recharts';
import {
  TrendingUp,
  Package,
  Clock,
  CheckCircle2,
  Users,
  Truck,
  AlertCircle,
  Compass
} from 'lucide-react';
import './Pages.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasNetworkAccess = user?.companyId?.subscriptionPlan === 'network' || localStorage.getItem('premium') === 'true';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/dashboard/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        setError('Failed to fetch dashboard statistics.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Dashboard Analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <AlertCircle size={40} className="error-icon" />
        <h3>Error Loading Data</h3>
        <p>{error}</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="error-container">
        <AlertCircle size={40} className="error-icon" />
        <h3>No Data Available</h3>
        <p>Could not load dashboard statistics. Please try again later.</p>
      </div>
    );
  }

  const { counts, weeklyDeliveries, monthlyShipments, carrierUsage } = stats;
  const PIE_COLORS = ['#00e5ff', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981'];

  return (
    <div className="page-container">
      <div className="page-header-section">
        <div>
          <h1 className="page-title text-gradient">Dashboard Overview</h1>
          <p className="page-subtitle">Real-time logistics activity and performance metrics.</p>
        </div>
        <div className="stats-update-time">
          <TrendingUp size={16} />
          <span>Auto-updating</span>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="stats-grid">
        <div className="stat-card card blue">
          <div className="stat-icon-wrapper blue">
            <Package size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Shipments</span>
            <h2 className="stat-value text-gradient-primary">{counts.totalShipments}</h2>
          </div>
        </div>

        <div className="stat-card card amber">
          <div className="stat-icon-wrapper amber">
            <Clock size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Active Shipments</span>
            <h2 className="stat-value text-gradient-primary">{counts.activeShipments}</h2>
          </div>
        </div>

        <div className="stat-card card emerald">
          <div className="stat-icon-wrapper emerald">
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Delivered Shipments</span>
            <h2 className="stat-value text-gradient-primary">{counts.deliveredShipments}</h2>
          </div>
        </div>

        <div className="stat-card card indigo">
          <div className="stat-icon-wrapper indigo">
            <Users size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Total Drivers</span>
            <h2 className="stat-value text-gradient-primary">{counts.totalDrivers}</h2>
          </div>
        </div>

        <div className="stat-card card cyan">
          <div className="stat-icon-wrapper cyan">
            <Truck size={24} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Active Fleet</span>
            <h2 className="stat-value text-gradient-primary">{counts.totalVehicles}</h2>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="charts-grid">
        <div className="chart-card card">
          <h3 className="chart-title">Weekly Deliveries</h3>
          <p className="chart-subtitle">Successful deliveries over the last 7 days</p>
          <div className="chart-wrapper">
            {weeklyDeliveries.length === 0 ? (
              <div className="no-data">No delivery data recorded this week.</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyDeliveries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="_id" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    labelStyle={{ color: '#f3f4f6', fontWeight: 600 }}
                  />
                  <Bar dataKey="count" fill="url(#barGradient)" radius={[4, 4, 0, 0]} name="Deliveries" />
                  <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="chart-card card">
          <h3 className="chart-title">Monthly Shipments & Revenue</h3>
          <p className="chart-subtitle">Shipment volume and revenue trend for current year</p>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyShipments}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#00e5ff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#9ca3af" fontSize={11} />
                <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} allowDecimals={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#00e5ff" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  labelStyle={{ color: '#f3f4f6', fontWeight: 600 }}
                  formatter={(value, name) => name === 'Revenue' ? [`$${value}`, name] : [value, name]}
                />
                <Area yAxisId="right" type="monotone" dataKey="revenue" stroke="#00e5ff" fillOpacity={1} fill="url(#colorRevenue)" name="Revenue" />
                <Line yAxisId="left" type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4 }} name="Shipments" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card" style={{ gridColumn: 'span 2' }}>
          <h3 className="chart-title">Carrier Usage Distribution</h3>
          <p className="chart-subtitle">Top carriers based on assigned shipments</p>
          <div className="chart-wrapper" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {carrierUsage && carrierUsage.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={carrierUsage}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={{ stroke: 'rgba(255,255,255,0.2)', strokeWidth: 1 }}
                  >
                    {carrierUsage.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '12px', color: '#9ca3af' }}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="no-data">No carrier assignment data available yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* ── ShipNova Network Insights (Premium Feature Teaser) ── */}
      <div className="page-header-section" style={{ marginTop: '40px' }}>
        <div>
          <h2 className="page-title text-gradient" style={{ fontSize: '1.5rem' }}>ShipNova Network Insights</h2>
          <p className="page-subtitle">Live marketplace activity across the public load board.</p>
        </div>
        {!hasNetworkAccess && (
          <div className="premium-badge-large" style={{ background: 'linear-gradient(135deg, #00e5ff, #00b3cc)', color: '#000', padding: '4px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.8rem' }}>
            PRO FEATURE
          </div>
        )}
      </div>

      <div className="stats-grid" style={{ opacity: hasNetworkAccess ? 1 : 0.7, filter: hasNetworkAccess ? 'none' : 'grayscale(0.5)' }}>
        <div className="stat-card card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Compass size={24} style={{ color: '#00e5ff' }} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Active Carriers Online</span>
            <h2 className="stat-value" style={{ color: '#fff' }}>14,285</h2>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <TrendingUp size={24} style={{ color: '#00e5ff' }} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Avg. Spot Market CPM</span>
            <h2 className="stat-value" style={{ color: '#fff' }}>$2.34</h2>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon-wrapper" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <Package size={24} style={{ color: '#00e5ff' }} />
          </div>
          <div className="stat-details">
            <span className="stat-label">Open Bids Today</span>
            <h2 className="stat-value" style={{ color: '#fff' }}>1,294</h2>
          </div>
        </div>
      </div>
      {!hasNetworkAccess && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => window.location.href = '/pricing'}
            style={{ background: 'transparent', border: '1px solid #00e5ff', color: '#00e5ff', padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', letterSpacing: '1px' }}
          >
            UPGRADE PLAN TO UNLOCK NETWORK
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
