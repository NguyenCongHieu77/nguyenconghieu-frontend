import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ThongTinTotNghiep.css';
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Make sure this path is correct

const ThongTinTotNghiep = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);
  const [reportLinkInput, setReportLinkInput] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  // State for Modal
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'info', 'error'
  const [modalMessage, setModalMessage] = useState('');

  // State for Notification Card
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(''); // 'success', 'error'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');

  // Helper functions to close modal/notification
  const closeModal = () => setShowModal(false);
  const closeNotification = () => setShowNotification(false);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const mssv = localStorage.getItem('username');

        const res = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/get-all`
        );
        const myInfo = res.data.find(item => item.mssv === mssv);
        if (myInfo) {
          setInfo(myInfo);
          setLinkInput(myInfo.linkThuyetMinh || '');
        }

        const resReport = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/get-all`
        );
        const myReport = resReport.data.find(item => item.mssv === mssv);
        if (myReport) {
          setReportInfo(myReport);
          setReportLinkInput(myReport.linkHoSoBaoCaoTotNghiep || '');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setShowNotification(true);
        setNotificationType('error');
        setNotificationMessage('Không tải được thông tin.');
        setNotificationSubText('Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getStatusClass = status => {
    switch (status) {
      case 'Đã duyệt': return 'status-approved';
      case 'Chờ duyệt': return 'status-pending';
      case 'Bị từ chối': return 'status-rejected';
      default: return '';
    }
  };

  const getThuyetMinhClass = value =>
    value === 'True' ? 'status-approved' : 'status-rejected';

  const handleCardClick = () => setShowDetails(v => !v);


  const handleSubmit = async () => {
    if (!linkInput.trim()) {
      setShowNotification(true);
      setNotificationType('info');
      setNotificationMessage('Vui lòng nhập link thuyết minh.');
      setNotificationSubText('Link không được để trống.');
      return;
    }
    try {
      setSubmitting(true);
      setShowNotification(false); // Clear previous notifications
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/nopthuyetminh`,
        {
          mssv: info.mssv,
          maDotDKTN: info.maDotDKTN,
          maGiaoVien: info.maGiaoVien,
          linkThuyetMinh: linkInput
        }
      );

      const refresh = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/get-all`
      );

      const updated = refresh.data.find(item => item.mssv === info.mssv);
      if (updated) {
        setInfo(updated);
        setLinkInput(updated.linkThuyetMinh || '');
      }

      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Nộp thuyết minh thành công.');
      setNotificationSubText('Thông tin thuyết minh của bạn đã được cập nhật.');

    } catch (err) {
      console.error('Submit error:', err);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Nộp thuyết minh thất bại.');
      setNotificationSubText(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };


  const handleReportSubmit = async () => {
    const mssv = info?.mssv?.toString();
    const maDotDKTN = info?.maDotDKTN;
    const link = reportLinkInput.trim();

    if (!mssv || !maDotDKTN || !link) {
      setModalType('info');
      setModalMessage('Thiếu thông tin MSSV, đợt TN hoặc link báo cáo.');
      setShowModal(true);
      return;
    }

    try {
      setReportSubmitting(true);
      setShowNotification(false); // Clear previous notifications
      // AccessToken might be automatically attached by axios-cookiejar-support or interceptors if set up globally.
      // If not, you might need to manually retrieve it from cookies if localStorage is not suitable.
      // const token = localStorage.getItem('accessToken'); // Your app might use cookies directly now.

      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/nop-link`,
        {
          mssv: mssv,
          maDotDKTN: maDotDKTN,
          linkHoSoBaoCaoTotNghiep: link
        }
        // No explicit headers needed if cookie-based authentication is set up on the backend and Axios handles it.
        // {
        //   headers: {
        //     'Content-Type': 'application/json',
        //     Authorization: `Bearer ${token}` // Only if using Bearer token from localStorage
        //   }
        // }
      );

      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Nộp Hồ sơ Báo cáo TN thành công.');
      setNotificationSubText('Hồ sơ báo cáo của bạn đã được gửi.');

      const resReport = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/get-all`
      );
      const updated = resReport.data.find(item => item.mssv === mssv);
      if (updated) {
        setReportInfo(updated);
        setReportLinkInput(updated.linkHoSoBaoCaoTotNghiep || '');
      }
    } catch (err) {
      console.error('Report submit error:', err);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Nộp Hồ sơ Báo cáo TN thất bại.');
      setNotificationSubText(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setReportSubmitting(false);
    }
  };

  if (loading) return <div className="thong-tin-tot-nghiep-card status-text">Đang tải thông tin...</div>;
  if (!info) return <div className="thong-tin-tot-nghiep-card status-text">Không tìm thấy thông tin đăng ký tốt nghiệp của bạn.</div>;

  return (
    <>
      <div className="thong-tin-tot-nghiep-card" onClick={handleCardClick}>
        <h2>THÔNG TIN TỐT NGHIỆP CỦA BẠN</h2>
        <p><strong>MSSV:</strong> {info.mssv}</p>
        <p><strong>Họ và tên:</strong> {info.hoSinhVien} {info.tenSinhVien}</p>
        <p><strong>Đợt TN:</strong> {info.tenDotDKTN}</p>
        <p><strong>Giáo viên HD:</strong> {info.hoTenGiaoVien}</p>
        <p><strong>Tên đề tài:</strong> {info.tenDeTaiTotNghiep}</p>
        <p><strong>Mục tiêu:</strong> {info.mucTieu}</p>
        <p><strong>Nội dung NC:</strong> {info.noiDungNghienCuu}</p>
        <p>
          <strong>Thuyết minh:</strong>{' '}
          <span className={getThuyetMinhClass(info.daNopThuyetMinh)}>
            {info.daNopThuyetMinh === 'True' ? 'Đã nộp' : 'Chưa nộp'}
          </span>
        </p>
        <p>
          <strong>Trạng thái:</strong>{' '}
          <span className={getStatusClass(info.tenTrangThai)}>
            {info.tenTrangThai}
          </span>
        </p>
        <p>
          <strong>Điều kiện báo cáo:</strong>{' '}
          <span className={info.duDieuKienBaoCao === 'True' ? 'status-approved' : 'status-rejected'}>
            {info.duDieuKienBaoCao === 'True' ? 'Được báo cáo' : 'Không đủ điều kiện báo cáo'}
          </span>
        </p>
      </div>

      {showDetails && (
        <div className="chi-tiet-below-card">
          <div className="chi-tiet-section">
            <h3>THÔNG TIN CHI TIẾT</h3>
            <p><strong>Ngày nộp thuyết minh:</strong> {info.ngayNopThuyetMinh ? new Date(info.ngayNopThuyetMinh).toLocaleDateString() : 'Chưa có'}</p>
            <p><strong>Ngày xét điều kiện:</strong> {info.ngayXetDuDieuKien ? new Date(info.ngayXetDuDieuKien).toLocaleDateString() : 'Chưa có'}</p>
            <p><strong>Kết quả TN:</strong> {info.ketQuaTotNghiep === 'True' ? 'Đạt' : 'Chưa đạt'}</p>
            <p><strong>Điểm TN:</strong> {info.diemTotNghiep || 'Chưa có'}</p>
            <p><strong>Đặc cách:</strong> {info.dacCachTotNghiep === 'True' ? 'Có' : 'Không'}</p>
            <p><strong>QĐ Đặc cách:</strong> {info.quyetDinhDacCach || 'Không có'}</p>
            <p><strong>Hình thức TN:</strong> {info.hinhThucTotNghiep || 'Không rõ'}</p>

            {info.linkThuyetMinh && (
              <p>
                <strong>Link Thuyết minh:</strong>{' '}
                <a href={info.linkThuyetMinh} target="_blank" rel="noopener noreferrer">
                  {info.linkThuyetMinh}
                </a>
              </p>
            )}

            {/* Thuyết minh Submission */}
            <div className="link-submit-section">
              <h4>{info.daNopThuyetMinh === 'True' ? 'Cập nhật Thuyết minh' : 'Nộp Thuyết minh'}</h4>
              <input
                type="text"
                value={linkInput}
                onChange={e => setLinkInput(e.target.value)}
                placeholder="Nhập link Google Drive"
              />
              <button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Nộp Thuyết Minh'}
              </button>
            </div>

            {/* Báo cáo TN Submission */}
            {reportInfo?.linkHoSoBaoCaoTotNghiep && (
              <p>
                <strong>Link Hồ sơ Báo cáo đã nộp:</strong>{' '}
                <a
                  href={reportInfo.linkHoSoBaoCaoTotNghiep}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {reportInfo.linkHoSoBaoCaoTotNghiep}
                </a>
              </p>
            )}

            <div className="report-submit-section">
              <h4>{reportInfo ? 'Cập nhật Hồ sơ Báo cáo TN' : 'Nộp Hồ sơ Báo cáo TN (Phải nộp đầy đủ thuyết minh & đã được duyệt)'}</h4>
              <input
                type="text"
                value={reportLinkInput}
                onChange={e => setReportLinkInput(e.target.value)}
                placeholder="Nhập link Google Drive Báo cáo TN"
              />
              <button onClick={handleReportSubmit} disabled={reportSubmitting}>
                {reportSubmitting ? 'Đang gửi...' : 'Nộp Báo Cáo TN'}
              </button>

              {reportInfo && (
                <>
                  <p><strong>Xác nhận file cứng:</strong> {reportInfo.xacNhanCBQLDaNopFileCuonBaoCao ? 'Có' : 'Chưa'}</p>
                  <p><strong>Xác nhận slide:</strong> {reportInfo.xacNhanCBQLDaNopSlideBaoCao ? 'Có' : 'Chưa'}</p>
                  <p><strong>Xác nhận source:</strong> {reportInfo.xacNhanCBQLDaNopSourceCode ? 'Có' : 'Chưa'}</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal for general info/error messages */}
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

      {/* Notification Card for submission success/failure */}
      {showNotification && (
        <NotificationCard
          type={notificationType}
          message={notificationMessage}
          subText={notificationSubText}
          onClose={closeNotification}
        />
      )}
    </>
  );
};

export default ThongTinTotNghiep;