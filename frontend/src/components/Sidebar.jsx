import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useClerk } from '@clerk/clerk-react';
import {
  LayoutDashboard,
  Truck,
  Users,
  Compass,
  UserCheck,
  Shield,
  Unlock,
  LogOut,
  Settings,
  Zap,
  ChevronUp,
  Building2
} from 'lucide-react';
import './Sidebar.css';
import ShipNovaLogo from './ShipNovaLogo';

// ── Custom User Menu Dropdown ──
const UserMenu = () => {
  const { user, logout } = useContext(AuthContext);
  const { openUserProfile } = useClerk();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  const plan = user.companyId?.subscriptionPlan || 'core';
  const isNetwork = plan === 'network';

  // Get initials for avatar
  const initials = (user.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    setOpen(false);
    await logout();
    navigate('/sign-in');
  };

  const handleManageAccount = () => {
    setOpen(false);
    openUserProfile();
  };

  const handleUpgrade = () => {
    setOpen(false);
    navigate('/pricing?upgrade=network');
  };

  return (
    <div className="user-menu-wrapper" ref={menuRef}>
      {/* Dropdown Panel — opens upward */}
      {open && (
        <div className="user-menu-dropdown">
          {/* Header */}
          <div className="user-menu-header">
            <div className="user-menu-avatar">{initials}</div>
            <div className="user-menu-info">
              <p className="user-menu-name">{user.name || 'User'}</p>
              <p className="user-menu-email">{user.email}</p>
            </div>
          </div>

          {/* Company + Plan Badge */}
          <div className="user-menu-company">
            <Building2 size={13} />
            <span>{user.companyId?.name || 'Your Company'}</span>
            <span className={`user-menu-plan-badge ${isNetwork ? 'plan-network' : 'plan-core'}`}>
              {isNetwork ? 'NETWORK' : 'CORE'}
            </span>
          </div>

          <div className="user-menu-divider" />

          {/* Actions */}
          <button className="user-menu-item" onClick={handleManageAccount}>
            <Settings size={16} />
            <span>Manage Account</span>
          </button>

          {!isNetwork && (
            <button className="user-menu-item upgrade" onClick={handleUpgrade}>
              <Zap size={16} />
              <span>Upgrade to Network</span>
            </button>
          )}

          <div className="user-menu-divider" />

          <button className="user-menu-item signout" onClick={handleSignOut}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Trigger Button */}
      <button
        className={`user-menu-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <div className="user-menu-avatar trigger-avatar">{initials}</div>
        <div className="user-menu-trigger-info">
          <span className="trigger-name">{user.name?.split(' ')[0] || 'Account'}</span>
          <span className={`trigger-plan ${isNetwork ? 'plan-network' : 'plan-core'}`}>
            {isNetwork ? '✦ Network Plan' : '· Core Plan'}
          </span>
        </div>
        <ChevronUp
          size={16}
          className="trigger-chevron"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(180deg)', transition: '0.2s ease' }}
        />
      </button>
    </div>
  );
};

// ── Main Sidebar ──
const Sidebar = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  if (!user) return null;

  const hasNetworkAccess = user.companyId?.subscriptionPlan === 'network';

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <ShipNovaLogo style={{ height: '54px' }} />
      </div>

      <div className="sidebar-divider"></div>

      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/shipments"
          className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
        >
          <Truck size={20} />
          <span>My Shipments</span>
        </NavLink>

        {['company_admin', 'dispatcher', 'manager'].includes(user.role) && (
          <NavLink
            to="/customers"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Users size={20} />
            <span>Customers</span>
          </NavLink>
        )}

        {['company_admin', 'manager'].includes(user.role) && (
          <>
            <NavLink
              to="/drivers"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <UserCheck size={20} />
              <span>Drivers</span>
            </NavLink>

            <NavLink
              to="/vehicles"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Truck size={20} />
              <span>Vehicles</span>
            </NavLink>
          </>
        )}

        {user.role === 'company_admin' && (
          <NavLink
            to="/team"
            className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
          >
            <Shield size={20} />
            <span>Team & Roles</span>
          </NavLink>
        )}

        {/* ── Marketplace Features (ShipNova Network) ── */}
        <div className="sidebar-section-title" style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <span>THE NETWORK</span>
          <span className="premium-badge">PRO</span>
        </div>

        {hasNetworkAccess ? (
          <>
            <NavLink
              to="/load-board"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <Compass size={20} />
              <span>Public Load Board</span>
              <Unlock size={14} className="lock-icon" style={{ color: '#00e5ff' }} />
            </NavLink>

            <NavLink
              to="/carriers"
              className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
            >
              <UserCheck size={20} />
              <span>Find Carriers</span>
              <Unlock size={14} className="lock-icon" style={{ color: '#00e5ff' }} />
            </NavLink>
          </>
        ) : (
          <>
            <div className="nav-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/pricing?upgrade=network')}>
              <Compass size={20} />
              <span>Public Load Board</span>
              <Shield size={14} className="lock-icon" style={{ color: '#00e5ff' }} />
            </div>

            <div className="nav-item" style={{ cursor: 'pointer' }} onClick={() => navigate('/pricing?upgrade=network')}>
              <UserCheck size={20} />
              <span>Find Carriers</span>
              <Shield size={14} className="lock-icon" style={{ color: '#00e5ff' }} />
            </div>
          </>
        )}
      </nav>

      {/* ── Custom User Menu (replaces Clerk UserButton) ── */}
      <div className="sidebar-footer">
        <UserMenu />
      </div>
    </aside>
  );
};

export default Sidebar;
