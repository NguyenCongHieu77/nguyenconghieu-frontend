// LayoutSV.jsx
import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  FiSettings,
  FiLogOut,
  FiLock,
  FiBell,
  FiFileText,
  FiMenu
} from 'react-icons/fi';
import './Layout.css';

function LayoutSV() {
  const [showSetting, setShowSetting] = useState(false);
  const [showNotif, setShowNotif]     = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [tenHienThi, setTenHienThi]   = useState('');
  const [notifCount, setNotifCount]   = useState(0);
  const [notifs, setNotifs]           = useState([]);
  const navigate = useNavigate();

  const toggleSetting    = () => setShowSetting(s => !s);
  const toggleNotif      = () => setShowNotif(s => !s);
  const toggleMobileMenu = () => setMobileMenuOpen(s => !s);

  const closeMenus = () => {
    setShowSetting(false);
    setShowNotif(false);
    setMobileMenuOpen(false);
  };

  // Fetch display name + notifications
  useEffect(() => {
    const name = localStorage.getItem('tenHienThi') || '';
    setTenHienThi(name);

    const mssv = localStorage.getItem('username');
    if (mssv) {
      axios
        .get(`${process.env.REACT_APP_API_URL}/api/ThongBao/thongbao/${mssv}`)
        .then(res => {
          const data = res.data;
          setNotifs(data);
          // count only the unread ones
          const unreadCount = data.filter(n => !n.daDoc).length;
          setNotifCount(unreadCount);
        })
        .catch(err => console.error('Lỗi khi tải thông báo:', err));
    }
  }, []);

  // Handle clicking a notification
  const handleNotifClick = async notif => {
    const mssv = localStorage.getItem('username');
    if (!notif.daDoc) {
      try {
        // mark as read on server
        await axios.put(
          `${process.env.REACT_APP_API_URL}/api/ThongBao/thongbaoread/${mssv}/${notif.maThongBao}`
        );
        // update local state
        setNotifs(prev =>
          prev.map(n =>
            n.maThongBao === notif.maThongBao ? { ...n, daDoc: true } : n
          )
        );
        setNotifCount(c => Math.max(0, c - 1));
      } catch (error) {
        console.error('Lỗi khi đánh dấu đã đọc:', error);
      }
    }

    // if this notification is a “nộp hồ sơ” request, navigate to the form page
    if (notif.noiDung.toLowerCase().includes('nộp hồ sơ')) {
      navigate('/layout-sv/thong-tin-thuc-tap');
    }

    closeMenus();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div>
      <nav className="nav-bar">
        <span className="logo-text">THỰC TẬP</span>

        {/* Hamburger menu for mobile */}
        <button className="hamburger" onClick={toggleMobileMenu}>
          <FiMenu size={24} />
        </button>

        {/* Mobile nav links */}
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="dang-ky-thuc-tap"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
            onClick={closeMenus}
          >
            Đăng Ký Thực Tập
          </NavLink>
          <NavLink
            to="thong-tin-thuc-tap"
            className={({ isActive }) =>
              isActive ? 'nav-link active' : 'nav-link'
            }
            onClick={closeMenus}
          >
            Thông Tin Thực Tập
          </NavLink>
        </div>

        {/* Notification bell */}
        <div className="notif-container">
          <button onClick={toggleNotif} className="notif-btn">
            <FiBell size={20} />
            {notifCount > 0 && <span className="notif-dot" />}
          </button>
          {showNotif && (
            <div className="notif-dropdown">
              {notifs.length === 0 ? (
                <div className="notif-item">Không có thông báo</div>
              ) : (
                notifs.map(n => (
                  <div
                    key={n.maThongBao}
                    className={`notif-item ${!n.daDoc ? 'unread' : ''}`}
                    onClick={() => handleNotifClick(n)}
                  >
                    {n.noiDung}
                  </div>
                ))
              )}
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
              <NavLink
                to="/layout-sv-tn/dang-ky-tot-nghiep"
                className="dropdown-item"
                onClick={closeMenus}
              >
                <FiFileText size={16} /> Đăng Ký TN
              </NavLink>
              <button onClick={handleLogout} className="dropdown-item">
                <FiLogOut size={16} /> Đăng xuất
              </button>
              <NavLink
                to="doi-mat-khau"
                className="dropdown-item"
                onClick={closeMenus}
              >
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

export default LayoutSV;
