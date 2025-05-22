import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ThongTinTotNghiep.css';

const ThongTinTotNghiep = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [linkInput, setLinkInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [reportInfo, setReportInfo] = useState(null);
  const [reportLinkInput, setReportLinkInput] = useState('');
  const [reportSubmitting, setReportSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const mssv = localStorage.getItem('username');

        const res = await axios.get(
          'http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/get-all',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const myInfo = res.data.find(item => item.mssv === mssv);
        if (myInfo) {
          setInfo(myInfo);
          setLinkInput(myInfo.linkThuyetMinh || '');
        }

        const resReport = await axios.get(
          'http://118.69.126.49:5225/api/ChiTietHoSoBaoCaoTotNghiep/get-all',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const myReport = resReport.data.find(item => item.mssv === mssv);
        if (myReport) {
          setReportInfo(myReport);
          setReportLinkInput(myReport.linkHoSoBaoCaoTotNghiep || '');
        }
      } catch (err) {
        console.error('Fetch error:', err);
        alert('Không tải được thông tin, vui lòng thử lại.');
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
          linkThuyetMinh: linkInput
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const refresh = await axios.get(
        'http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/get-all',
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const updated = refresh.data.find(item => item.mssv === info.mssv);
      if (updated) {
        setInfo(updated);
        setLinkInput(updated.linkThuyetMinh || '');
      }
      alert('Nộp thuyết minh thành công.');
    } catch (err) {
      console.error('Submit error:', err);
      alert('Nộp thuyết minh thất bại.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReportSubmit = async () => {
  const mssv = info?.mssv?.toString();
  const maDotDKTN = info?.maDotDKTN;
  const link = reportLinkInput.trim();

  if (!mssv || !maDotDKTN || !link) {
    alert('Thiếu thông tin MSSV, đợt TN hoặc link báo cáo.');
    return;
  }

  try {
    setReportSubmitting(true);
    const token = localStorage.getItem('accessToken');

    await axios.post(
      'http://118.69.126.49:5225/api/ChiTietHoSoBaoCaoTotNghiep/nop-link',
      {
        mssv: mssv,
        maDotDKTN: maDotDKTN,
        linkHoSoBaoCaoTotNghiep: link
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert('Nộp Hồ sơ Báo cáo TN thành công.');

    // Reload lại dữ liệu báo cáo
    const resReport = await axios.get(
      'http://118.69.126.49:5225/api/ChiTietHoSoBaoCaoTotNghiep/get-all',
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const updated = resReport.data.find(item => item.mssv === mssv);
    if (updated) {
      setReportInfo(updated);
      setReportLinkInput(updated.linkHoSoBaoCaoTotNghiep || '');
    }
  } catch (err) {
    console.error('Report submit error:', err);
    alert('Nộp Hồ sơ Báo cáo TN thất bại.');
  } finally {
    setReportSubmitting(false);
  }
};


  if (loading) return <div className="thong-tin-tot-nghiep-card status-text">Đang tải thông tin...</div>;
  if (!info) return <div className="thong-tin-tot-nghiep-card status-text">Không tìm thấy thông tin đăng ký.</div>;

  return (
    <>
      <>
  <div className="thong-tin-tot-nghiep-card" onClick={handleCardClick}>
    <h2>THÔNG TIN TỐT NGHIỆP</h2>
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
  </div>

  {showDetails && (
    <div className="chi-tiet-below-card">
      <div className="chi-tiet-section">
        <h3>THÔNG TIN CHI TIẾT</h3>
        <p><strong>Ngày nộp thuyết minh:</strong> {info.ngayNopThuyetMinh || 'Chưa có'}</p>
        <p><strong> </strong></p>
        <p><strong>Ngày xét điều kiện:</strong> {info.ngayXetDuDieuKien || 'Chưa có'}</p>
        <p><strong>Kết quả TN:</strong> {info.ketQuaTotNghiep === 'True' ? 'Đạt' : 'Chưa đạt'}</p>
        <p><strong>Điểm TN:</strong> {info.diemTotNghiep}</p>
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

        {/* Thuyết minh */}
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

        {/* Báo cáo TN */}
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
</>

    </>
  );
};

export default ThongTinTotNghiep;
