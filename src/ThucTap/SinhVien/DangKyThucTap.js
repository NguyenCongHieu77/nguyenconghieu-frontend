import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DangKyThucTap.css';
import { useNavigate } from 'react-router-dom';

const DangKyThucTap = () => {
  const savedUsername = localStorage.getItem('username') || '';
  const displayName = localStorage.getItem('tenHienThi') || '';

  const [dotThucTapList, setDotThucTapList] = useState([]);
  const [loaiThucTapList, setLoaiThucTapList] = useState([]);
  const [giangVienList, setGiangVienList] = useState([]);
  const [donViList, setDonViList] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);
  const [selectedDonVi, setSelectedDonVi] = useState(null);
  const [selectedLoai, setSelectedLoai] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [hasRegistered, setHasRegistered] = useState(false);

  const [formData, setFormData] = useState({
    mssv: savedUsername,
    maDotThucTap: 0,
    ngayBatDau: '',
    ngayKetThuc: '',
    lanThucTap: 1,
    maDonViThucTap: 0,
    maGiaoVien: 'NV0000000',
    xacNhanChoBaoCao: false,
    ketQuaBaoCao: false,
    diemBaoCao: 0,
    maTinhTrangThucTap: 1,
    tinhTrangXacNhan: 'Đang Xác Nhận...',
    ghiChu: 'Đăng ký thành công, vui lòng nộp Hồ Sơ Thực Tập',
  });

  const navigate = useNavigate();

  const addMonths = (dateStr, months) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== day) d.setDate(0);
    return d.toISOString().slice(0, 10);
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '';
  const safe = val => (val === null || val === undefined ? '' : typeof val === 'object' ? JSON.stringify(val) : val);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          dotsRes,
          loaiRes,
          gvRes,
          donViRes,
          dktRes
        ] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/api/DotThucTap`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/LoaiThucTap`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/GiangVien`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTap`),
          axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietThucTap/get-all`)
        ]);

        setDotThucTapList(dotsRes.data);
        setLoaiThucTapList(loaiRes.data);
        setGiangVienList(gvRes.data);
        setDonViList(donViRes.data);
        setHasRegistered(dktRes.data.some(item => item.mssv === savedUsername));
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };

    fetchData();
  }, [savedUsername]);

  const filtered = dotThucTapList.filter(dot => {
    const dt = new Date(dot.ngayBatDau);
    const m = dt.getMonth() + 1;
    const y = dt.getFullYear();
    return (
      (!selectedLoai || dot.maLoaiThucTap === +selectedLoai) &&
      (!selectedMonth || m === +selectedMonth) &&
      (!selectedYear || y === +selectedYear)
    );
  });

  const handleCardClick = dot => {
    setSelectedDot(dot);
    const bd = dot.ngayBatDau.slice(0, 10);

    let months = 4;
    switch (dot.tenLoaiThucTap) {
      case 'Thực tập sớm': months = 12; break;
      case 'Liên thông': months = 3; break;
      case 'Thực tập lại': months = 4; break;
      default: months = 4;
    }

    setFormData(prev => ({
      ...prev,
      maDotThucTap: dot.maDotThucTap,
      ngayBatDau: bd,
      ngayKetThuc: addMonths(bd, months)
    }));

    axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTapTheoDot/${dot.maDotThucTap}`)
      .then(res => setDonViList(res.data))
      .catch(console.error);
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDonViChange = e => {
    const id = +e.target.value;
    handleChange(e);

    if (!id) {
      setSelectedDonVi(null);
      return;
    }

    axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTap`)
      .then(res => {
        const donVi = res.data.find(dv => dv.maDonViThucTap === id);
        setSelectedDonVi(donVi || null);
      })
      .catch(console.error);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_API_URL}/api/ChiTietThucTap/insert-update`,
        formData
      );
      alert(res.data.message);
      setHasRegistered(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Đăng ký thất bại!');
    }
  };

  return (
    <div className="dot-container">
      <h2>DANH SÁCH CÁC ĐỢT THỰC TẬP</h2>

      <div className="filter-group">
        <label><strong>Loại:</strong></label>
        <select value={selectedLoai} onChange={e => setSelectedLoai(e.target.value)}>
          <option value="">-- Tất cả --</option>
          {loaiThucTapList.map(l => (
            <option key={l.maLoaiThucTap} value={l.maLoaiThucTap}>{l.tenLoaiThucTap}</option>
          ))}
        </select>

        <label><strong>Tháng:</strong></label>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
          <option value="">-- Tất cả --</option>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>Tháng {i + 1}</option>
          ))}
        </select>

        <label><strong>Năm:</strong></label>
        <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
          <option value="">-- Tất cả --</option>
          {[2023, 2024, 2025, 2026].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="dot-card-list">
        {filtered.map(dot => (
          <div
            key={dot.maDotThucTap}
            className={`dot-card ${
              dot.tenLoaiThucTap === 'Thực tập sớm' ? 'sinhvien-som' :
              dot.tenLoaiThucTap === 'Thực tập đúng đợt' ? 'sinhvien-dungdot' :
              dot.tenLoaiThucTap === 'Thực tập liên thông' ? 'sinhvien-lienthong' :
              dot.tenLoaiThucTap === 'Thực tập lại' ? 'sinhvien-lai' : ''
            }`}
            onClick={() => handleCardClick(dot)}
          >
            <h3>{dot.tenDotThucTap}</h3>
            <p><strong>Ngày bắt đầu:</strong> {formatDate(dot.ngayBatDau)}</p>
            <p><strong>Đối tượng:</strong> {dot.doiTuongDangKy}</p>
            <p><strong>Loại:</strong> {dot.tenLoaiThucTap}</p>
            <p><strong>Mô tả:</strong> {dot.moTa}</p>
          </div>
        ))}
      </div>

      {selectedDot && (
        <div className="registration-section">
          {hasRegistered ? (
            <div className="already-registered">
              <h2>Bạn đã đăng ký rồi nên không thể đăng ký lại.</h2>
            </div>
          ) : (
            <form className="registration-form" onSubmit={handleSubmit}>
              <h2>{selectedDot.tenDotThucTap}</h2>

              <label>Họ và tên:
                <input type="text" value={displayName} readOnly />
              </label>

              <label>Mã số sinh viên:
                <input type="text" name="mssv" value={formData.mssv} readOnly />
              </label>

              <label>Ngày bắt đầu:
                <input type="date" name="ngayBatDau" value={formData.ngayBatDau} onChange={handleChange} />
              </label>

              <label>Ngày kết thúc:
                <input type="date" name="ngayKetThuc" value={formData.ngayKetThuc} readOnly />
              </label>

              <label>Số lần thực tập:
                <input type="number" name="lanThucTap" value={formData.lanThucTap} onChange={handleChange} />
              </label>

              <label>Đơn vị thực tập:
                <select name="maDonViThucTap" value={formData.maDonViThucTap} onChange={handleDonViChange} required>
                  <option value="">-- Chọn đơn vị --</option>
                  {donViList.map(dv => (
                    <option key={dv.maDonViThucTap} value={dv.maDonViThucTap}>{dv.tenDonViThucTap}</option>
                  ))}
                </select>
              </label>

              {selectedDonVi && (
                <div className="donvi-info">
                  <h4>{safe(selectedDonVi.tenDonViThucTap)}</h4>
                  <p>Địa chỉ: {safe(selectedDonVi.diaChi)}</p>
                  <p>Điện thoại: {safe(selectedDonVi.dienThoai)}</p>
                  <p>Người hướng dẫn: {safe(selectedDonVi.nguoiHuongDan)}</p>
                  <p>Email: {safe(selectedDonVi.email)}</p>
                  <p>Mô tả: {safe(selectedDonVi.moTa)}</p>
                </div>
              )}

              {false && (
  <label>Giảng viên hướng dẫn:
    <select name="maGiaoVien" value={formData.maGiaoVien} onChange={handleChange} required>
      <option value="">_Chưa có giáo viên</option>
      {giangVienList.map(gv => (
        <option key={gv.maGiaoVien} value={gv.maGiaoVien}>{gv.hoTenGiaoVien}</option>
      ))}
    </select>
  </label>
)}


              <div className="form-buttons">
                <button type="submit">Gửi đăng ký</button>
                <button type="button" className="cancel-button" onClick={() => {
                  setSelectedDot(null);
                  setSelectedDonVi(null);
                  setDonViList([]);
                }}>Hủy</button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DangKyThucTap;
