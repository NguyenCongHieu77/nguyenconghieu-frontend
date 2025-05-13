// src/pages/DangKyTotNghiep.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DangKyTotNghiep.css';

const DangKyTotNghiep = () => {
  const [dots, setDots] = useState([]);
  const [regs, setRegs] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);
  const [formData, setFormData] = useState({
    mssv: '',
    hoTen: '',
    tenDeTaiTotNghiep: '',
    mucTieu: '',
    noiDungNghienCuu: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const mssv = localStorage.getItem('username');
        const [dotsRes, regsRes] = await Promise.all([
          axios.get('http://localhost:5225/api/DotDangKyTotNghiep/get-all', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://localhost:5225/api/ChiTietSinhVienDKTN/get-all', {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setDots(dotsRes.data.filter(d => !d.isDelete));
        setRegs(regsRes.data
          .filter(r => r.mssv === mssv)
          .map(r => r.maDotDKTN)
        );
      } catch (err) {
        console.error('Lỗi fetch:', err);
      }
    };
    fetchData();
  }, []);

  const closeModal = () => setShowModal(false);

  const handleSelectDot = dot => {
    // Nếu đã đăng ký rồi thì không cho đăng ký thêm
    if (regs.length > 0) {
      setMessage({ type: 'info', text: 'Bạn đã đăng ký tốt nghiệp rồi' });
      setShowModal(true);
      return;
    }
    const now = new Date();
    const start = new Date(dot.tuNgay);
    const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);
    if (now > expire) {
      setMessage({ type: 'error', text: 'Đã hết hạn đăng ký cho đợt này.' });
      setShowModal(true);
      return;
    }
    const mssv = localStorage.getItem('username') || '';
    const hoTen = localStorage.getItem('tenHienThi') || '';
    setSelectedDot(dot);
    setFormData({ mssv, hoTen, tenDeTaiTotNghiep: '', mucTieu: '', noiDungNghienCuu: '' });
    setMessage({ type: '', text: '' });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        mssv: formData.mssv,
        maDotDKTN: selectedDot.maDotDKTN,
        tenDeTaiTotNghiep: formData.tenDeTaiTotNghiep,
        mucTieu: formData.mucTieu,
        noiDungNghienCuu: formData.noiDungNghienCuu
      };
      const token = localStorage.getItem('accessToken');
      await axios.post(
        'http://localhost:5225/api/ChiTietSinhVienDKTN/insert-by-sinhvien',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Đăng ký thành công!' });
      setRegs(r => [...r, selectedDot.maDotDKTN]);
      setSelectedDot(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi, vui lòng thử lại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  return (
    <div className="dang-ky-tot-nghiep">
      <h2>Chọn đợt đăng ký tốt nghiệp</h2>
      <div className="dot-list">
        {dots.map(dot => {
          const now = new Date();
          const start = new Date(dot.tuNgay);
          const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);
          const isExpired = now > expire;
          const isReg = regs.includes(dot.maDotDKTN);
          const disabled = regs.length > 0;
          return (
            <div
              key={dot.maDotDKTN}
              className={`dot-card ${
                selectedDot?.maDotDKTN === dot.maDotDKTN ? 'active' : ''
              } ${isReg ? 'registered' : ''} ${isExpired ? 'expired' : ''} ${disabled ? 'disabled' : ''}`}
              onClick={() => handleSelectDot(dot)}
            >
              <h3>{dot.tenDotDKTN}</h3>
              <p>
                {start.toLocaleDateString()} – {new Date(dot.denNgay).toLocaleDateString()}
              </p>
              {dot.ghiChu && <span className="note">{dot.ghiChu}</span>}
              {isExpired && <div className="badge expired">Hết hạn</div>}
              {isReg && <div className="badge registered">Đã đăng ký</div>}
            </div>
          );
        })}
      </div>

      {selectedDot && !regs.includes(selectedDot.maDotDKTN) && (
        <form className="reg-form" onSubmit={handleSubmit}>
          <h2>Đăng ký đợt: {selectedDot.tenDotDKTN}</h2>
          <div className="field">
            <label>MSSV</label>
            <input type="text" name="mssv" value={formData.mssv} readOnly />
          </div>
          <div className="field">
            <label>Họ và tên</label>
            <input type="text" name="hoTen" value={formData.hoTen} readOnly />
          </div>
          <div className="field">
            <label>Tên đề tài tốt nghiệp</label>
            <input
              type="text"
              name="tenDeTaiTotNghiep"
              value={formData.tenDeTaiTotNghiep}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Mục tiêu</label>
            <textarea
              name="mucTieu"
              rows={3}
              value={formData.mucTieu}
              onChange={handleChange}
              required
            />
          </div>
          <div className="field">
            <label>Nội dung nghiên cứu</label>
            <textarea
              name="noiDungNghienCuu"
              rows={4}
              value={formData.noiDungNghienCuu}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Gửi đăng ký'}
          </button>
        </form>
      )}

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">
            <p className={`modal-${message.type}`}>{message.text}</p>
            <button className="modal-close" onClick={closeModal}>Đóng</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DangKyTotNghiep;
