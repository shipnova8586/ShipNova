import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { User, Building2 } from 'lucide-react';
import './Header.css';

const Header = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  // Format roles into human-readable versions
  const formatRole = (role) => {
    switch (role) {
      case 'company_admin': return 'Company Administrator';
      case 'manager': return 'Logistics Manager';
      case 'driver': return 'Delivery Driver';
      case 'customer': return 'Portal Customer';
      case 'super_admin': return 'System Super Admin';
      default: return role;
    }
  };

  return (
    <header className="header">
      <div className="company-info">
        <Building2 size={22} className="company-icon" />
        <span className="company-name">{user.companyId?.name || 'My Organization'}</span>
      </div>

      <div className="user-profile">
        <div className="profile-details">
          <span className="user-name">{user.name}</span>
          <span className="user-role">{formatRole(user.role)}</span>
        </div>
        <div className="avatar">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Header;
