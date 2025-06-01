// // src/components/DangNhap.js
// import React, { useState } from 'react';
// import axios from 'axios';           // sẽ dùng baseURL
// import { useNavigate } from 'react-router-dom';
// import './DangNhap.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye, faEyeSlash, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

// const DangNhap = () => {
//   const [tenTaiKhoan, setTenTaiKhoan] = useState('');
//   const [matKhau, setMatKhau]         = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError]             = useState('');
//   const [loading, setLoading]         = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);
//     try {
//       // <-- CHỈ ĐƯỜNG DẪN RELATIVE, axios tự nối với baseURL
//       const res = await axios.post('/api/Account/login', { tenTaiKhoan, matKhau });

//       // Swagger trả về { accessToken, maNhomTaiKhoan, tenHienThi, maDonViThucTap }
//       const { accessToken, maNhomTaiKhoan, tenHienThi,maDonViThucTap } = res.data;

//       // Lưu token + user info
//       localStorage.setItem('accessToken', accessToken);
//       localStorage.setItem('username', tenTaiKhoan);
//       localStorage.setItem('maNhomTaiKhoan', maNhomTaiKhoan);
//       localStorage.setItem('tenHienThi', tenHienThi);
//       localStorage.setItem('maDonViThucTap', maDonViThucTap);

//       // Redirect theo role
//       if (maNhomTaiKhoan === 5) {
//         navigate('/layout-cbql-clb/danh-sach-sv-dang-thuc-tap');
//       } else if (maNhomTaiKhoan === 3) {
//         navigate('/layout-sv/dang-ky-thuc-tap');
//       } else if (maNhomTaiKhoan === 1) {
//         navigate('/layout-cbql-chung/danh-sach-sv-duoc-xac-nhan-tu-clb');
//       } else {
//         setError('Quyền truy cập không hợp lệ.');
//       }
//     } catch (err) {
//       setError(
//         err.response?.data?.message === 'Tên đăng nhập hoặc mật khẩu không đúng.'
//           ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
//           : 'Đăng nhập thất bại.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="logo-side">
//         <img src="/image/logo.png" alt="Logo" className="logo" />
//         <h2>ĐĂNG NHẬP</h2>
//         <a href="/quen-mat-khau" className="forgot-password">QUÊN MẬT KHẨU</a>
//       </div>
//       <form className="form-side" onSubmit={handleSubmit}>
//         {error && <p className="error">{error}</p>}
//         <div className="input-wrapper">
//           <FontAwesomeIcon icon={faUser}/>
//           <input
//             type="text"
//             placeholder="Tên đăng nhập"
//             value={tenTaiKhoan}
//             onChange={e => setTenTaiKhoan(e.target.value)}
//             required
//           />
//         </div>
//         <div className="input-wrapper">
//           <FontAwesomeIcon icon={faLock}/>
//           <input
//             type={showPassword ? 'text' : 'password'}
//             placeholder="Mật khẩu"
//             value={matKhau}
//             onChange={e => setMatKhau(e.target.value)}
//             required
//           />
//           <FontAwesomeIcon
//             icon={showPassword ? faEyeSlash : faEye}
//             className="toggle-password"
//             onClick={() => setShowPassword(v => !v)}
//           />
//         </div>
//         <button className="login-btn" type="submit" disabled={loading}>
//           <FontAwesomeIcon icon={faLock}/> {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default DangNhap;


// import React, { useState } from 'react';
// import axios from 'axios';           // baseURL + withCredentials đã config
// import { useNavigate } from 'react-router-dom';
// import './DangNhap.css';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faEye, faEyeSlash, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

// const DangNhap = () => {
//   const [tenTaiKhoan, setTenTaiKhoan] = useState('');
//   const [matKhau, setMatKhau]         = useState('');
//   const [showPassword, setShowPassword] = useState(false);
//   const [error, setError]             = useState('');
//   const [loading, setLoading]         = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async e => {
//     e.preventDefault();
//     setError('');
//     setLoading(true);

//     try {
//       // Gửi login, browser tự nhận cookie HttpOnly
//       const { data } = await axios.post('/api/Account/login', {
//         tenTaiKhoan,
//         matKhau
//       });

//       // Server trả về chỉ user-info (không có token)
//       const { maNhomTaiKhoan, tenHienThi, maDonViThucTap } = data;

//       // Lưu vào localStorage để routing/UI
//       localStorage.setItem('maNhomTaiKhoan',    maNhomTaiKhoan);
//       localStorage.setItem('tenHienThi',        tenHienThi);
//       localStorage.setItem('maDonViThucTap',    maDonViThucTap);

//       // Điều hướng theo role
//       if (maNhomTaiKhoan === 5) {
//         navigate('/layout-cbql-clb/danh-sach-sv-dang-thuc-tap');
//       } else if (maNhomTaiKhoan === 3) {
//         navigate('/layout-sv/dang-ky-thuc-tap');
//       } else if (maNhomTaiKhoan === 1) {
//         navigate('/layout-cbql-chung/danh-sach-sv-duoc-xac-nhan-tu-clb');
//       } else {
//         setError('Quyền truy cập không hợp lệ.');
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message;
//       setError(
//         msg === 'Tên đăng nhập hoặc mật khẩu không đúng.'
//           ? msg
//           : 'Đăng nhập thất bại.'
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="logo-side">
//         <img src="/image/logo.png" alt="Logo" className="logo" />
//         <h2>ĐĂNG NHẬP</h2>
//         <a href="/quen-mat-khau" className="forgot-password">QUÊN MẬT KHẨU</a>
//       </div>
//       <form className="form-side" onSubmit={handleSubmit}>
//         {error && <p className="error">{error}</p>}
//         <div className="input-wrapper">
//           <FontAwesomeIcon icon={faUser} />
//           <input
//             type="text"
//             placeholder="Tên đăng nhập"
//             value={tenTaiKhoan}
//             onChange={e => setTenTaiKhoan(e.target.value)}
//             required
//           />
//         </div>
//         <div className="input-wrapper">
//           <FontAwesomeIcon icon={faLock} />
//           <input
//             type={showPassword ? 'text' : 'password'}
//             placeholder="Mật khẩu"
//             value={matKhau}
//             onChange={e => setMatKhau(e.target.value)}
//             required
//           />
//           <FontAwesomeIcon
//             icon={showPassword ? faEyeSlash : faEye}
//             className="toggle-password"
//             onClick={() => setShowPassword(v => !v)}
//           />
//         </div>
//         <button className="login-btn" type="submit" disabled={loading}>
//           <FontAwesomeIcon icon={faLock} /> {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default DangNhap;


import React, { useState } from 'react';
import axios from 'axios';           // sẽ dùng baseURL
import { useNavigate } from 'react-router-dom';
import './DangNhap.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash, faLock, faUser } from '@fortawesome/free-solid-svg-icons';

const DangNhap = () => {
  const [tenTaiKhoan, setTenTaiKhoan] = useState('');
  const [matKhau, setMatKhau]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // <-- CHỈ ĐƯỜNG DẪN RELATIVE, axios tự nối với baseURL
      const res = await axios.post('/api/Account/login', { tenTaiKhoan, matKhau });

      // Swagger trả về { accessToken, maNhomTaiKhoan, tenHienThi, maDonViThucTap }
      const { accessToken, maNhomTaiKhoan, tenHienThi,maDonViThucTap } = res.data;

      // Lưu token + user info
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('username', tenTaiKhoan);
      localStorage.setItem('maNhomTaiKhoan', maNhomTaiKhoan);
      localStorage.setItem('tenHienThi', tenHienThi);
      localStorage.setItem('maDonViThucTap', maDonViThucTap);

      // Redirect theo role
      if (maNhomTaiKhoan === 5) {
        navigate('/layout-cbql-clb/danh-sach-sv-dang-thuc-tap');
      } else if (maNhomTaiKhoan === 3) {
        navigate('/layout-sv/dang-ky-thuc-tap');
      } else if (maNhomTaiKhoan === 1) {
        navigate('/layout-cbql-chung/danh-sach-sv-duoc-xac-nhan-tu-clb');
      } else {
        setError('Quyền truy cập không hợp lệ.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message === 'Tên đăng nhập hoặc mật khẩu không đúng.'
          ? 'Tên đăng nhập hoặc mật khẩu không đúng.'
          : 'Đăng nhập thất bại.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="logo-side">
        <img src="/image/logo.png" alt="Logo" className="logo" />
        <h2>ĐĂNG NHẬP</h2>
        <a href="/quen-mat-khau" className="forgot-password">QUÊN MẬT KHẨU</a>
      </div>
      <form className="form-side" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <div className="input-wrapper">
          <FontAwesomeIcon icon={faUser}/>
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={tenTaiKhoan}
            onChange={e => setTenTaiKhoan(e.target.value)}
            required
          />
        </div>
        <div className="input-wrapper">
          <FontAwesomeIcon icon={faLock}/>
          <input
            type={showPassword ? 'text' : 'password'}
placeholder="Mật khẩu"
            value={matKhau}
            onChange={e => setMatKhau(e.target.value)}
            required
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="toggle-password"
            onClick={() => setShowPassword(v => !v)}
          />
        </div>
        <button className="login-btn" type="submit" disabled={loading}>
          <FontAwesomeIcon icon={faLock}/> {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
        </button>
      </form>
    </div>
  );
};

export default DangNhap;