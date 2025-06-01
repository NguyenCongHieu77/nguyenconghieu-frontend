import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DangKyTotNghiep.css';
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Assuming NotificationCard is in the same directory or a common 'components' folder

const DangKyTotNghiep = () => {
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

  // State for Modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'info', 'error'
  const [modalMessage, setModalMessage] = useState('');

  // State for Notification Card
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(''); // 'success', 'error'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dotsRes, regsRes, teachersRes] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/get-all`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/GiangVien`)
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
        // Display an error notification for data fetching issues
        setShowNotification(true);
        setNotificationType('error');
        setNotificationMessage('Có lỗi khi tải dữ liệu.');
        setNotificationSubText('Vui lòng thử lại sau.');
      }
    };
    fetchData();
  }, [storedMssv]);

  const closeModal = () => setShowModal(false);
  const closeNotification = () => setShowNotification(false);

  const handleSelectDot = dot => {
    if (regs.length > 0) {
      setModalType('info');
      setModalMessage('Bạn đã đăng ký tốt nghiệp rồi.');
      setShowModal(true);
      return;
    }

    const now = new Date();
    const start = new Date(dot.tuNgay);
    const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days from 'tuNgay'

    if (now > expire) {
      setModalType('error');
      setModalMessage('Đã hết hạn đăng ký cho đợt này.');
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
    setShowModal(false); // Close any open modals when a new dot is selected
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setShowNotification(false); // Clear any previous notifications

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

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/insert-by-sinhvien`,
        payload
      );

      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Đăng ký thành công!');
      setNotificationSubText('Thông tin đăng ký của bạn đã được gửi.');

      setRegs(prev => [...prev, selectedDot.maDotDKTN]);
      setSelectedDot(null); // Clear selected dot after successful registration
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Lỗi, vui lòng thử lại.';
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Đăng ký thất bại!');
      setNotificationSubText(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const dotsWithExpire = dots.map(dot => {
    const start = new Date(dot.tuNgay);
    const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000); // 15 days from start date
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
            const disabled = regs.length > 0; // Disable all if already registered for any dot
            return (
              <div
                key={dot.maDotDKTN}
                className={`dktn-dot-card available ${
                  selectedDot?.maDotDKTN === dot.maDotDKTN ? 'active' : ''
                } ${isReg ? 'registered' : ''} ${disabled ? 'disabled' : ''}`}
                onClick={() => !disabled && handleSelectDot(dot)}
              >
                <h3>{dot.tenDotDKTN}</h3>
                <p>{new Date(dot.tuNgay).toLocaleDateString()} – {new Date(dot.denNgay).toLocaleDateString()}</p>
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
            <div className="dktn-field">
              <label>Hình thức tốt nghiệp</label>
              <select name="hinhThucTotNghiep" value={formData.hinhThucTotNghiep} onChange={handleChange} required>
                <option value="">-- Chọn hình thức --</option>
                <option value="Chính Khóa">Chính Khóa</option>
                <option value="Liên Thông">Liên Thông</option>
              </select>
            </div>
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

      {/* Modal for information/error messages */}
      {showModal && (
        <div className="dktn-modal-overlay" onClick={closeModal}>
          <div className="dktn-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Thông báo</h3>
            <p className={modalType === 'error' ? 'error-text' : ''}>{modalMessage}</p>
            <div className="modal-actions">
              <button className="dktn-modal-close" onClick={closeModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Card for success/failure of registration */}
      {showNotification && (
        <NotificationCard
          type={notificationType}
          message={notificationMessage}
          subText={notificationSubText}
          onClose={closeNotification}
        />
      )}
    </div>
  );
};

export default DangKyTotNghiep;