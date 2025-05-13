import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ThongTinTotNghiep.css';

const ThongTinTotNghiep = () => {
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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
        if (myInfo) setInfo(myInfo);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchInfo();
  }, []);

  if (loading) return <div className="thong-tin-tot-nghiep-card status-text">Đang tải thông tin...</div>;
  if (!info) return <div className="thong-tin-tot-nghiep-card status-text">Không tìm thấy thông tin đăng ký.</div>;

  return (
    <div className="thong-tin-tot-nghiep-card">
      <h2>Thông tin tốt nghiệp</h2>
      <p><strong>MSSV:</strong> {info.mssv}</p>
      <p><strong>Họ và tên:</strong> {info.hoSinhVien} {info.tenSinhVien}</p>
      <p><strong>Đợt TN:</strong> {info.tenDotDKTN}</p>
      <p><strong>Giáo viên HD:</strong> {info.hoTenGiaoVien}</p>
      <p><strong>Tên đề tài:</strong> {info.tenDeTaiTotNghiep}</p>
      <p><strong>Mục tiêu:</strong> {info.mucTieu}</p>
      <p><strong>Nội dung nghiên cứu:</strong> {info.noiDungNghienCuu}</p>
      <p><strong>Thuyết minh:</strong> {info.daNopThuyetMinh === 'True' ? 'Đã nộp' : 'Chưa nộp'}</p>
      {info.linkThuyetMinh && (
        <p><strong>Link Thuyết minh:</strong> <a href={info.linkThuyetMinh} target="_blank" rel="noopener noreferrer">{info.linkThuyetMinh}</a></p>
      )}
      <p><strong>Trạng thái:</strong> {info.tenTrangThai}</p>
    </div>
  );
};

export default ThongTinTotNghiep;
