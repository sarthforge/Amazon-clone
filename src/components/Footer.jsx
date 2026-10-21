import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer">
      {/* 1. Back to Top Button */}
      <div className="foot-panel1" onClick={scrollToTop}>
        Back to Top
      </div>

      {/* 2. Links Section */}
      <div className="foot-panel2">
        <ul>
          <h3>Get to Know Us</h3>
          <li><a href="#careers">Careers</a></li>
          <li><a href="#blog">Blog</a></li>
          <li><a href="#about">About Amazon</a></li>
          <li><a href="#investors">Investor Relations</a></li>
          <li><a href="#devices">Amazon Devices</a></li>
        </ul>

        <ul>
          <h3>Make Money with Us</h3>
          <li><a href="#sell">Sell products on Amazon</a></li>
          <li><a href="#sell-apps">Sell on Amazon Business</a></li>
          <li><a href="#affiliate">Become an Affiliate</a></li>
          <li><a href="#advertise">Advertise Your Products</a></li>
        </ul>

        <ul>
          <h3>Amazon Payment Products</h3>
          <li><a href="#card">Amazon Business Card</a></li>
          <li><a href="#points">Shop with Points</a></li>
          <li><a href="#reload">Reload Your Balance</a></li>
        </ul>

        <ul>
          <h3>Let Us Help You</h3>
          <li><a href="#account">Amazon and COVID-19</a></li>
          <li><a href="#shipping">Your Account</a></li>
          <li><a href="#returns">Your Orders</a></li>
          <li><a href="#rates">Shipping Rates & Policies</a></li>
          <li><a href="#help">Help</a></li>
        </ul>
      </div>

      {/* 3. Logo Section */}
      <div className="foot-panel3">
        <div className="footer-logo">
          <Link to="/" onClick={scrollToTop}>
            <div className="logo"></div>
          </Link>
        </div>
      </div>

      {/* 4. Bottom Disclaimer & Copyright */}
      <div className="foot-panel5">
        <div className="pages">
          <a href="#conditions">Conditions of Use</a>
          <a href="#privacy">Privacy Notice</a>
          <a href="#interest-ads">Your Ads Privacy Choices</a>
        </div>
        <div className="copyright">
          © 1996-2025, Amazon.com, Inc. or its affiliates (React Refactor Clone)
        </div>
      </div>
    </footer>
  );
}

export default Footer;