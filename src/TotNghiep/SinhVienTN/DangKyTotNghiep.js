import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DangKyTotNghiep.css';

const DangKyTotNghiep = () => {
  // Lấy MSSV và Họ tên từ localStorage sau khi đăng nhập
  const storedMssv = localStorage.getItem('username') || '';
  const storedHoTen = localStorage.getItem('tenHienThi') || '';

  const [dots, setDots] = useState([]);
  const [regs, setRegs] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);
  const [formData, setFormData] = useState({
    mssv: storedMssv,
    hoTen: storedHoTen,
    maGiaoVien: '',
    tenDeTaiTotNghiep: '',
    mucTieu: '',
    noiDungNghienCuu: '',
    hinhThucTotNghiep: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
<<<<<<< HEAD
        const mssv = localStorage.getItem('username');
        const [dotsRes, regsRes] = await Promise.all([
=======
        // Fetch đợt, đăng ký, và danh sách giảng viên
        const [dotsRes, regsRes, teachersRes] = await Promise.all([
>>>>>>> ea1f53b (code moi nhat)
          axios.get('http://118.69.126.49:5225/api/DotDangKyTotNghiep/get-all', {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/get-all', {
<<<<<<< HEAD
=======
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get('http://118.69.126.49:5225/api/GiangVien', {
>>>>>>> ea1f53b (code moi nhat)
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        const validDots = dotsRes.data.filter(d => !d.isDelete);
        const userRegs = regsRes.data
          .filter(r => r.mssv === storedMssv)
          .map(r => r.maDotDKTN);
        setDots(validDots);
        setRegs(userRegs);
        setTeachers(teachersRes.data || []);
      } catch (err) {
        console.error('Lỗi fetch:', err);
      }
    };
    fetchData();
  }, [storedMssv]);

  const closeModal = () => setShowModal(false);

  const handleSelectDot = dot => {
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
    setSelectedDot(dot);
    setFormData(f => ({
      ...f,
      maGiaoVien: '',
      tenDeTaiTotNghiep: '',
      mucTieu: '',
      noiDungNghienCuu: '',
      hinhThucTotNghiep: ''
    }));
    setMessage({ type: '', text: '' });
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const payload = {
        mssv: formData.mssv,
        maDotDKTN: selectedDot.maDotDKTN,
        maGiaoVien: formData.maGiaoVien,
        tenDeTaiTotNghiep: formData.tenDeTaiTotNghiep,
        mucTieu: formData.mucTieu,
        noiDungNghienCuu: formData.noiDungNghienCuu,
        hinhThucTotNghiep: formData.hinhThucTotNghiep
      };
      const token = localStorage.getItem('accessToken');
      await axios.post(
        'http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/insert-by-sinhvien',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage({ type: 'success', text: 'Đăng ký thành công!' });
      setRegs(prev => [...prev, selectedDot.maDotDKTN]);
      setSelectedDot(null);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi, vui lòng thử lại.';
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setLoading(false);
      setShowModal(true);
    }
  };

  const now = new Date();
  const dotsWithExpire = dots.map(dot => {
    const start = new Date(dot.tuNgay);
    const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);
    return { ...dot, isExpired: now > expire };
  });
  const nonExpiredDots = dotsWithExpire.filter(dot => !dot.isExpired);
  const expiredDots = dotsWithExpire.filter(dot => dot.isExpired);

  return (
    <div className="dktn-wrapper">
      <h2>CHỌN ĐỢT ĐĂNG KÝ TỐT NGHIỆP</h2>

      <div className="dktn-section">
        <h3>ĐỢT CÒN HẠN</h3>
        <div className="dktn-dot-list">
          {nonExpiredDots.map(dot => {
            const isReg = regs.includes(dot.maDotDKTN);
            const disabled = regs.length > 0;
            return (
              <div
                key={dot.maDotDKTN}
                className={`dktn-dot-card ${
                  selectedDot?.maDotDKTN === dot.maDotDKTN ? 'active' : ''
                } ${isReg ? 'registered' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && handleSelectDot(dot)}
              >
                <h3>{dot.tenDotDKTN}</h3>
                <p>
                  {new Date(dot.tuNgay).toLocaleDateString()} –{' '}
                  {new Date(dot.denNgay).toLocaleDateString()}
                </p>
                {dot.ghiChu && <span className="dktn-note">{dot.ghiChu}</span>}
                {isReg && <div className="dktn-badge registered">Đã đăng ký</div>}
              </div>
            );
          })}
        </div>

        {selectedDot && !selectedDot.isExpired && !regs.includes(selectedDot.maDotDKTN) && (
          <form className="dktn-reg-form" onSubmit={handleSubmit}>
            <h2>Đăng ký đợt: {selectedDot.tenDotDKTN}</h2>
            <div className="dktn-field"><label>MSSV</label><input type="text" name="mssv" value={formData.mssv} readOnly /></div>
            <div className="dktn-field"><label>Họ và tên</label><input type="text" name="hoTen" value={formData.hoTen} readOnly /></div>
            <div className="dktn-field">
              <label>Giáo viên hướng dẫn</label>
              <select name="maGiaoVien" value={formData.maGiaoVien} onChange={handleChange} required>
                <option value="">-- Chọn giáo viên --</option>
                {teachers.map(tv => (
                  <option key={tv.maGiaoVien} value={tv.maGiaoVien}>{tv.hoTenGiaoVien}</option>
                ))}
              </select>
            </div>
            <div className="dktn-field"><label>Tên đề tài tốt nghiệp</label><input type="text" name="tenDeTaiTotNghiep" value={formData.tenDeTaiTotNghiep} onChange={handleChange} required /></div>
            <div className="dktn-field"><label>Mục tiêu</label><textarea name="mucTieu" rows={3} value={formData.mucTieu} onChange={handleChange} required /></div>
            <div className="dktn-field"><label>Nội dung nghiên cứu</label><textarea name="noiDungNghienCuu" rows={4} value={formData.noiDungNghienCuu} onChange={handleChange} required /></div>
            <div className="dktn-field"><label>Hình thức tốt nghiệp</label><select name="hinhThucTotNghiep" value={formData.hinhThucTotNghiep} onChange={handleChange} required><option value="">-- Chọn hình thức --</option><option value="Chính Khóa">Chính Khóa</option><option value="Liên Thông">Liên Thông</option></select></div>
            <button type="submit" disabled={loading}>{loading ? 'Đang gửi...' : 'Gửi đăng ký'}</button>
          </form>
        )}
      </div>

      {expiredDots.length > 0 && (
        <div className="dktn-section">
          <h3>ĐỢT ĐÃ HẾT HẠN</h3>
          <div className="dktn-dot-list expired">
            {expiredDots.map(dot => (
              <div key={dot.maDotDKTN} className="dktn-dot-card expired">
                <h3>{dot.tenDotDKTN}</h3>
                <p>{new Date(dot.tuNgay).toLocaleDateString()} – {new Date(dot.denNgay).toLocaleDateString()}</p>
                {dot.ghiChu && <span className="dktn-note">{dot.ghiChu}</span>}
                <div className="dktn-badge expired">Hết hạn</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {showModal && (
        <div className="dktn-modal-overlay"><div className="dktn-modal"><p className={message.type}>{message.text}</p><button className="dktn-modal-close" onClick={closeModal}>Đóng</button></div></div>
      )}
    </div>
  );
};

export default DangKyTotNghiep;
