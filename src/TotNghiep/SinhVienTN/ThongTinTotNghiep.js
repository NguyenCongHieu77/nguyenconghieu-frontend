import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ThongTinTotNghiep.css';

const ThongTinTotNghiep = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const mssv = localStorage.getItem('username');
        const res = await axios.get(
          'http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/get-all',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = res.data;
        const myInfo = data.find(item => item.mssv === mssv);
        if (myInfo) {
          setInfo(myInfo);
          setLinkInput(myInfo.linkThuyetMinh || '');
        }
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case 'Đã duyệt':
        return 'status-approved';
      case 'Chờ duyệt':
        return 'status-pending';
      case 'Bị từ chối':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const getThuyetMinhClass = (value) => {
    return value === 'True' ? 'status-approved' : 'status-rejected';
  };

  const handleCardClick = () => {
    setShowDetails(prev => !prev);
  };

  const handleSubmit = async () => {
    if (!linkInput) return;

    try {
      setSubmitting(true);
      const token = localStorage.getItem('accessToken');
      await axios.post(
        'http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/nopthuyetminh',
        {
          mssv: info.mssv,
          maDotDKTN: info.maDotDKTN,
          maGiaoVien: info.maGiaoVien,
          linkThuyetMinh: linkInput,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Fetch lại dữ liệu mới từ server thay vì chỉnh sửa trực tiếp trạng thái
      const refresh = await axios.get(
        'http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/get-all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = refresh.data;
      const updatedInfo = data.find(item => item.mssv === info.mssv);
      if (updatedInfo) {
        setInfo(updatedInfo);
        setLinkInput(updatedInfo.linkThuyetMinh || '');
      }
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="thong-tin-tot-nghiep-card status-text">Đang tải thông tin...</div>;
  if (!info) return <div className="thong-tin-tot-nghiep-card status-text">Không tìm thấy thông tin đăng ký.</div>;

  return (
    <>
      <div className="thong-tin-tot-nghiep-card" onClick={handleCardClick}>
        <h2>THÔNG TIN TỐT NGHIỆP</h2>
        <p><strong>MSSV:</strong> {info.mssv}</p>
        <p><strong>Họ và tên:</strong> {info.hoSinhVien} {info.tenSinhVien}</p>
        <p><strong>Đợt TN:</strong> {info.tenDotDKTN}</p>
        <p><strong>Giáo viên HD:</strong> {info.hoTenGiaoVien}</p>
        <p><strong>Tên đề tài:</strong> {info.tenDeTaiTotNghiep}</p>
        <p><strong>Mục tiêu:</strong> {info.mucTieu}</p>
        <p><strong>Nội dung nghiên cứu:</strong> {info.noiDungNghienCuu}</p>
        <p>
          <strong>Thuyết minh:</strong>{' '}
          <span className={getThuyetMinhClass(info.daNopThuyetMinh)}>
            {info.daNopThuyetMinh === 'True' ? 'Đã xác nhận nộp đủ' : 'Chưa nộp'}
          </span>
        </p>
        <p>
          <strong>Trạng thái:</strong>{' '}
          <span className={getStatusClass(info.tenTrangThai)}>
            {info.tenTrangThai}
          </span>
        </p>
      </div>

      {showDetails && (
        <div className="chi-tiet-below-card">
          <div className="chi-tiet-section">
            <h3>THÔNG TIN CHI TIẾT</h3>
            <p><strong>Ngày nộp thuyết minh:</strong> {info.ngayNopThuyetMinh || 'Chưa có'}</p>
            <p><strong>Đủ điều kiện báo cáo:</strong> {info.duDieuKienBaoCao === 'True' ? 'Có' : 'Không'}</p>
            <p><strong>Ngày xét điều kiện:</strong> {info.ngayXetDuDieuKien || 'Chưa có'}</p>
            <p><strong>Kết quả tốt nghiệp:</strong> {info.ketQuaTotNghiep === 'True' ? 'Đạt' : 'Chưa đạt'}</p>
            <p><strong>Điểm tốt nghiệp:</strong> {info.diemTotNghiep}</p>
            <p><strong>Đặc cách tốt nghiệp:</strong> {info.dacCachTotNghiep === 'True' ? 'Có' : 'Không'}</p>
            <p><strong>Quyết định đặc cách:</strong> {info.quyetDinhDacCach || 'Không có'}</p>
            <p><strong>Hình thức tốt nghiệp:</strong> {info.hinhThucTotNghiep || 'Không rõ'}</p>

            {info.linkThuyetMinh && (
              <p><strong>Link Thuyết minh đã nộp:</strong> <a href={info.linkThuyetMinh} target="_blank" rel="noopener noreferrer">{info.linkThuyetMinh}</a></p>
            )}

            <div className="link-submit-section">
              <h4>{info.daNopThuyetMinh === 'True' ? 'Cập nhật link Thuyết minh' : 'Nộp link Thuyết minh'}</h4>
              <input
                type="text"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Nhập link Google Drive"
              />
              <button onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Đang gửi...' : 'Nộp'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ThongTinTotNghiep;
