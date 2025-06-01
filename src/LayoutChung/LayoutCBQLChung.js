// import { NavLink, Outlet } from 'react-router-dom';
// import './Layout.css';
// import { FiSettings, FiLogOut, FiLock, FiFileText, FiMenu, FiUserPlus } from 'react-icons/fi';
// import React, { useState, useEffect } from 'react';

// function LayoutCBQLChung() {
//   const [showDropdown, setShowDropdown] = useState(false);
//   const [tenHienThi, setTenHienThi] = useState('');
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const toggleDropdown = () => setShowDropdown(!showDropdown);
//   const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

//   const closeMenus = () => {
//     setShowDropdown(false);
//     setMobileMenuOpen(false);
//   };

//   useEffect(() => {
//     const name = localStorage.getItem('tenHienThi');
//     if (name) {
//       setTenHienThi(name);
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     window.location.href = '/';
//   };

//   return (
//     <div>
//       <nav className="nav-bar">
//         <span className="logo-text">QUẢN LÝ THỰC TẬP</span>

//         <button className="hamburger" onClick={toggleMobileMenu}>
//           <FiMenu size={24} />
//         </button>

//         <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
//           <NavLink
//             to="danh-sach-sv-duoc-xac-nhan-tu-clb"
//             className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
//             onClick={closeMenus}
//           >
//             Danh Sách SV Gửi Đăng Ký
//           </NavLink>

          

//           <NavLink
//             to="danh-sach-sv-hien-dang-thuc-tap"
//             className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
//             onClick={closeMenus}
//           >
//             Các SV Hiện Đang Thực Tập
//           </NavLink>

//           <NavLink
//             to="danh-sach-sv-duoc-bao-cao"
//             className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
//             onClick={closeMenus}
//           >
//             Các SV Được Báo Cáo
//           </NavLink>

//           <NavLink
//             to="danh-sach-cac-don-vi-thuc-tap"
//             className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
//             onClick={closeMenus}
//           >
//             Các Đơn Vị Thực Tập
//           </NavLink>

//           <NavLink
//             to="danh-sach-cac-dot-thuc-tap"
//             className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
//             onClick={closeMenus}
//           >
//             Các Đợt Thực Tập
//           </NavLink>

//           <NavLink
//             to="thong-ke-tt"
//             className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
//             onClick={closeMenus}
//           >
//             Thống Kê Thực Tập
//           </NavLink>
//         </div>

//         <div className="setting-container">
//           <button onClick={toggleDropdown} className="setting-btn">
//             <FiSettings size={20} />
//           </button>

//           {showDropdown && (
//             <div className="dropdown">
//               <div className="dropdown-item" style={{ fontWeight: 'bold', color: '#333' }}>
//                 👤 {tenHienThi || 'Chưa đăng nhập'}
//               </div>

//               <NavLink
//                          to="/layout-ql-tn/danh-sach-sv-dk-tn"
//                          className="dropdown-item"
//                      onClick={closeMenus}
//                                             >
//                     <FiFileText size={16} />  QL TỐT NGHIỆP
//                </NavLink>
//               <NavLink
//                 to="tao-tai-khoan-cho-qlclb"
//                 className="dropdown-item"
//                 onClick={closeMenus}
//               >
//                 <FiUserPlus size={16} style={{ marginRight: '8px' }} />
//                 Tạo tài khoản CLB
//               </NavLink>

//               <button
//                 onClick={handleLogout}
//                 className="dropdown-item"
//                 style={{ border: 'none', background: 'none', cursor: 'pointer' }}
//               >
//                 <FiLogOut size={16} style={{ marginRight: '8px' }} />
//                 Đăng xuất
//               </button>

//               <NavLink
//                 to="doi-mat-khau"
//                 className="dropdown-item"
//                 onClick={closeMenus}
//               >
//                 <FiLock size={16} style={{ marginRight: '8px' }} />
//                 Đổi Mật Khẩu
//               </NavLink>
//             </div>
//           )}
//         </div>
//       </nav>

//       <div className="main-content">
//         <Outlet />
//       </div>
//     </div>
//   );
// }

// export default LayoutCBQLChung;
import { NavLink, Outlet } from 'react-router-dom';
import './Layout.css';
import { FiSettings, FiLogOut, FiLock, FiFileText, FiMenu, FiUserPlus } from 'react-icons/fi';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function LayoutCBQLChung() {
  const [showDropdown, setShowDropdown] = useState(false);
  const [tenHienThi, setTenHienThi] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false); // New state for logout in progress

  const navigate = useNavigate(); // Initialize useNavigate hook

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
    if (isLoggingOut) { // Prevent multiple clicks if already logging out
      return;
    }

    setIsLoggingOut(true); // Set logging out state to true

    localStorage.clear(); // Clear local storage

    // Use navigate.replace() to prevent going back
    // Adding a small delay for demonstration, but in a real app,
    // this would be the final step after successful backend logout.
    setTimeout(() => {
      navigate('/', { replace: true });
      setIsLoggingOut(false); // Reset in case navigate fails (though unlikely here)
    }, 100); // Small delay to allow state update to render button disabled, adjust as needed or remove
  };

  return (
    <div>
      <nav className="nav-bar">
        <span className="logo-text">QUẢN LÝ THỰC TẬP</span>

        <button className="hamburger" onClick={toggleMobileMenu}>
          <FiMenu size={24} />
        </button>

        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <NavLink
            to="danh-sach-sv-duoc-xac-nhan-tu-clb"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Danh Sách SV Gửi Đăng Ký
          </NavLink>

          <NavLink
            to="danh-sach-sv-hien-dang-thuc-tap"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Các SV Hiện Đang Thực Tập
          </NavLink>

          <NavLink
            to="danh-sach-sv-duoc-bao-cao"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Các SV Được Báo Cáo
          </NavLink>

          <NavLink
            to="danh-sach-cac-don-vi-thuc-tap"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Các Đơn Vị Thực Tập
          </NavLink>

          <NavLink
            to="danh-sach-cac-dot-thuc-tap"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Các Đợt Thực Tập
          </NavLink>

          <NavLink
            to="thong-ke-tt"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            onClick={closeMenus}
          >
            Thống Kê Thực Tập
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
                to="/layout-ql-tn/danh-sach-sv-dk-tn"
                className="dropdown-item"
                onClick={closeMenus}
              >
                <FiFileText size={16} /> &nbsp;QL TỐT NGHIỆP
              </NavLink>
              <NavLink
                to="tao-tai-khoan-cho-qlclb"
                className="dropdown-item"
                onClick={closeMenus}
              >
                <FiUserPlus size={16} style={{ marginRight: '8px' }} />
                Tạo tài khoản CLB
              </NavLink>

              <button
                onClick={handleLogout}
                className="dropdown-item"
                style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                disabled={isLoggingOut} // Disable the button while logging out
              >
                <FiLogOut size={16} style={{ marginRight: '8px' }} />
                {isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'} {/* Change text while logging out */}
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

export default LayoutCBQLChung;