// LayoutTotNghiep.js
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSettings, FiLogOut, FiLock, FiBell, FiFileText } from 'react-icons/fi';
import './LayoutTN.css';

function LayoutTotNghiep() {
  const [showSetting, setShowSetting] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [tenHienThi, setTenHienThi] = useState('');
  const [notifCount, setNotifCount] = useState(0);
  const [notifs, setNotifs] = useState([]);
  const navigate = useNavigate();

  // Toggle dropdowns
  const toggleSetting = () => setShowSetting(s => !s);
  const toggleNotif = () => setShowNotif(s => !s);

  useEffect(() => {
    // load display name
    const name = localStorage.getItem('tenHienThi') || '';
    setTenHienThi(name);

    // load notifications (from endpoint for graduation if different)
    const mssv = localStorage.getItem('username');
    if (mssv) {
      axios
        .get(`http://localhost:5225/api/ThongBao/thongbao/${mssv}`)
        .then(res => {
          setNotifs(res.data);
          setNotifCount(res.data.length);
        })
        .catch(err => console.error('Lỗi khi tải thông báo:', err));
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <nav className="nav-bar">
        <span className="logo-text">TỐT NGHIỆP</span>

        <NavLink to="dang-ky-tot-nghiep" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Đăng Ký Tốt Nghiệp
        </NavLink>
        <NavLink to="thong-tin-tot-nghiep" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Thông Tin Tốt Nghiệp
        </NavLink>

        {/* Notification Bell */}
        <div className="notif-container">
          <button onClick={toggleNotif} className="notif-btn">
            <FiBell size={20} />
            {notifCount > 0 && <span className="notif-dot" />}
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              {notifs.length === 0
                ? <div className="notif-item">Không có thông báo</div>
                : notifs.map((n, i) => (
                  <div key={i} className="notif-item">{n.noiDung}</div>
                ))
              }
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="setting-container">
          <button onClick={toggleSetting} className="setting-btn">
            <FiSettings size={20} />
          </button>
          {showSetting && (
            <div className="dropdown">
              <div className="dropdown-item profile">
                👤 {tenHienThi || 'Chưa đăng nhập'}
              </div>
              <NavLink to="/layout-sv/dang-ky-thuc-tap" className="dropdown-item">
                <FiFileText size={16} /> Đăng Ký TT
                </NavLink>
              <button onClick={handleLogout} className="dropdown-item">
                <FiLogOut size={16} /> Đăng xuất
              </button>
              <NavLink to="doi-mat-khau" className="dropdown-item">
                <FiLock size={16} /> Đổi mật khẩu
              </NavLink>
            </div>
          )}
        </div>
      </nav>

      <div className="main-content">
        <main style={{ padding: '20px' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default LayoutTotNghiep;
