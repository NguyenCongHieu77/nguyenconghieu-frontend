// TaoTaiKhoanChoQLCLB.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaoTaiKhoanChoQLCLB.css';

const TaoTaiKhoanChoQLCLB = () => {
  const [tenTaiKhoan, setTenTaiKhoan] = useState('');
  const [tenHienThi, setTenHienThi] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [donViList, setDonViList] = useState([]);
  const [maDonViThucTap, setMaDonViThucTap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Lấy danh sách đơn vị thực tập
    axios.get('http://118.69.126.49:5225/api/DonViThucTap')
      .then(res => setDonViList(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const payload = {
        tenTaiKhoan,
        tenHienThi,
        matKhau,
        maNhomTaiKhoan: 5,              // Mặc định nhóm tài khoản = 5
        maDonViThucTap: Number(maDonViThucTap),
      };

      await axios.post('http://118.69.126.49:5225/api/Account/dangkytaikhoan', payload);
      setMessage('Tạo tài khoản thành công!');
      // Reset form
      setTenTaiKhoan('');
      setTenHienThi('');
      setMatKhau('');
      setMaDonViThucTap('');
    } catch (error) {
      const errMsg = error.response?.data || 'Có lỗi khi tạo tài khoản';
      setMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="taotaikhoanqlclb-container">
      <form className="taotaikhoanqlclb-form" onSubmit={handleSubmit}>
        <h2 className="taotaikhoanqlclb-title">TẠO TÀI KHOẢN CHO QL CLB</h2>

        <label className="taotaikhoanqlclb-label" htmlFor="tenTaiKhoan">Tên tài khoản</label>
        <input
          id="tenTaiKhoan"
          className="taotaikhoanqlclb-input"
          type="text"
          value={tenTaiKhoan}
          onChange={e => setTenTaiKhoan(e.target.value)}
          required
        />

        <label className="taotaikhoanqlclb-label" htmlFor="tenHienThi">Họ và Tên</label>
        <input
          id="tenHienThi"
          className="taotaikhoanqlclb-input"
          type="text"
          value={tenHienThi}
          onChange={e => setTenHienThi(e.target.value)}
          required
        />

        <label className="taotaikhoanqlclb-label" htmlFor="matKhau">Mật khẩu</label>
        <input
          id="matKhau"
          className="taotaikhoanqlclb-input"
          type="password"
          value={matKhau}
          onChange={e => setMatKhau(e.target.value)}
          required
        />

        <label className="taotaikhoanqlclb-label" htmlFor="donVi">Đơn vị thực tập</label>
        <select
          id="donVi"
          className="taotaikhoanqlclb-select"
          value={maDonViThucTap}
          onChange={e => setMaDonViThucTap(e.target.value)}
          required
        >
          <option value="" disabled>Chọn đơn vị thực tập</option>
          {donViList.map(dv => (
            <option key={dv.maDonViThucTap} value={dv.maDonViThucTap}>
              {dv.tenDonViThucTap}
            </option>
          ))}
        </select>

        <button
          className="taotaikhoanqlclb-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>

        {message && (
          <p className="taotaikhoanqlclb-message">{message}</p>
        )}
      </form>
    </div>
  );
};

export default TaoTaiKhoanChoQLCLB;