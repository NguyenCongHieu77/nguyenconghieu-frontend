import React, { useState } from 'react';
import axios from 'axios';
import './QuenMatKhau.css';

const QuenMatKhau = () => {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '',
    otp: '',
    tenTaiKhoan: '',
    matKhauMoi: ''
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [resetDone, setResetDone] = useState(false); // thêm trạng thái này

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 4000);
  };

  const handleSendOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/otp/send`, {
        email: form.email
      });
      showMessage('success', 'Đã gửi OTP tới email!');
      setStep(2);
    } catch {
      showMessage('error', 'Không thể gửi OTP. Kiểm tra email!');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/otp/verify`, {
        email: form.email,
        otp: form.otp
      });
      showMessage('success', 'OTP hợp lệ!');
      setStep(3);
    } catch {
      showMessage('error', 'OTP không đúng hoặc đã hết hạn!');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/otp/reset-password`, {
        email: form.email,
        tenTaiKhoan: form.tenTaiKhoan,
        otp: form.otp,
        matKhauMoi: form.matKhauMoi
      });
      showMessage('success', 'Đổi mật khẩu thành công!');
      setStep(1);
      setResetDone(true); // đánh dấu đã reset thành công
      setForm({ email: '', otp: '', tenTaiKhoan: '', matKhauMoi: '' });
    } catch (err) {
      const msg = err.response?.data || 'Lỗi, vui lòng thử lại.';
      showMessage('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    window.location.href = '/'; // hoặc dùng navigate nếu bạn có React Router
  };

  return (
    <div className="reset-password-wrapper">
      <h2>KHÔI PHỤC MẬT KHẨU</h2>

      {message.text && (
        <div className={`message ${message.type}`}>{message.text}</div>
      )}

      {!resetDone && step === 1 && (
        <div className="step">
          <label>Email:</label>
          <input type="email" name="email" value={form.email} onChange={handleChange} />
          <button onClick={handleSendOtp} disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi OTP'}
          </button>
        </div>
      )}

      {!resetDone && step === 2 && (
        <div className="step">
          <label>Mã OTP:</label>
          <input type="text" name="otp" value={form.otp} onChange={handleChange} />
          <button onClick={handleVerifyOtp} disabled={loading}>
            {loading ? 'Đang kiểm tra...' : 'Xác minh OTP'}
          </button>
        </div>
      )}

      {!resetDone && step === 3 && (
        <div className="step">
          <label>Tên tài khoản:</label>
          <input type="text" name="tenTaiKhoan" value={form.tenTaiKhoan} onChange={handleChange} />
          <label>Mật khẩu mới:</label>
          <input type="password" name="matKhauMoi" value={form.matKhauMoi} onChange={handleChange} />
          <button onClick={handleResetPassword} disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
          </button>
        </div>
      )}

      {resetDone && (
        <div className="step">
          <button onClick={handleBackToLogin}>
            Quay về trang Đăng nhập
          </button>
        </div>
      )}
    </div>
  );
};

export default QuenMatKhau;
