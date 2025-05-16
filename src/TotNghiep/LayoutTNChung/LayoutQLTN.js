import { NavLink, Outlet } from 'react-router-dom';
import './LayoutTN.css';
import { FiSettings,
  FiLogOut,
  FiLock,
  FiFileText,
  FiMenu } from 'react-icons/fi';
import React, { useState, useEffect } from 'react';

function LayoutQLTN() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [tenHienThi, setTenHienThi] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleDropdown = () => setShowDropdown(!showDropdown);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const closeMenus = () => {
    setShowDropdown(false);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const name = localStorage.getItem('tenHienThi');
    if (name) {
      setTenHienThi(name);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <div>
      <nav className="nav-bar">
        <span className="logo-text">QUẢN LÝ TỐT NGHIỆP</span>

        <button className="hamburger" onClick={toggleMobileMenu}>
          <FiMenu size={24} />
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="danh-sach-sv-dk-tn"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Danh Sách SV ĐK Tốt Nghiệp
          </NavLink>

          <NavLink
            to="danh-sach-sv-duoc-xn"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Danh Sách SV Được Xác Nhận
          </NavLink>

          <NavLink
            to="cac-dot-tot-nghiep"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Danh Sách Các Đợt Tốt Nghiệp
          </NavLink>

        </div>

        <div className="setting-container">
          <button onClick={toggleDropdown} className="setting-btn">
            <FiSettings size={20} />
          </button>

          {showDropdown && (
            <div className="dropdown">
              <div className="dropdown-item" style={{ fontWeight: 'bold', color: '#333' }}>
                👤 {tenHienThi || 'Chưa đăng nhập'}
              </div>
                <NavLink
                                to="/layout-cbql-chung/danh-sach-sv-duoc-xac-nhan-tu-clb"
                                className="dropdown-item"
                                onClick={closeMenus}
                              >
                                <FiFileText size={16} /> QL THỰC TẬP
                </NavLink>
              <button
                onClick={handleLogout}
                className="dropdown-item"
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
              >
                <FiLogOut size={16} style={{ marginRight: '8px' }} />
                Đăng xuất
              </button>

              <NavLink
                to="doi-mat-khau"
                className="dropdown-item"
                onClick={closeMenus}
              >
                <FiLock size={16} style={{ marginRight: '8px' }} />
                Đổi Mật Khẩu
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className="main-content">
        <Outlet />
      </div>
    </div>
  );
}

export default LayoutQLTN;
