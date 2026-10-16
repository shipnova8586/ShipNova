import React from 'react';
import './ShipNovaLogo.css';

const ShipNovaLogo = ({ className = '', style = {} }) => {
  return (
    <div className={`shipnova-brand-logo ${className}`} style={style}>
      {/* 
        Using the EXACT original vector SVG logo extracted from the reference website's CDN!
        This guarantees 100% pixel-perfect matching for fonts, corners, colors, and the swirl.
      */}
      <img src="/nav-brand.svg" alt="ShipNova" className="nav-brand-img" />
    </div>
  );
};

export default ShipNovaLogo;
