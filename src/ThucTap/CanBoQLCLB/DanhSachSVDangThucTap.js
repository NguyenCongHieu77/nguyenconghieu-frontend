import React, { useEffect, useState } from 'react';
import './DanhSachSVDangThucTap.css';


const DanhSachSVDangThucTap = () => {
  const [students, setStudents] = useState([]);
  const [hours, setHours] = useState([]);
  const [expandedMSSV, setExpandedMSSV] = useState(null);
  const [newHour, setNewHour] = useState({ thang: '', soGioThucTap: '' });
  const [editing, setEditing] = useState(null);
  const [internshipPeriods, setInternshipPeriods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [svRes, hourRes, periodRes] = await Promise.all([
        fetch('http://118.69.126.49:5225/api/ChiTietThucTap/get-all'),
        fetch('http://118.69.126.49:5225/api/GioThucTapSinhVien/get-all'),
        fetch('http://118.69.126.49:5225/api/LoaiThucTap')
      ]);
      const [svData, hourData, periodData] = await Promise.all([
        svRes.json(),
        hourRes.json(),
        periodRes.json()
      ]);
      setStudents(svData);
      setHours(hourData);
      setInternshipPeriods(periodData);
    } catch (err) {
      console.error('Lỗi fetch dữ liệu:', err);
    }
  };

  const toggleDetail = (mssv) => {
    setExpandedMSSV(expandedMSSV === mssv ? null : mssv);
    setNewHour({ thang: '', soGioThucTap: '' });
    setEditing(null);
  };

  const handleInsert = async (mssv, maDotThucTap) => {
    try {
      const internshipPeriod = internshipPeriods.find(period => period.maDotThucTap === maDotThucTap);
      const maxMonths = internshipPeriod ? internshipPeriod.soThangThucTap : 0;

      if (newHour.thang > maxMonths) {
        alert(`Số tháng đăng ký không thể lớn hơn ${maxMonths} tháng.`);
        return;
      }

      const body = { mssv, maDotThucTap, ...newHour };
      const res = await fetch('http://118.69.126.49:5225/api/GioThucTapSinhVien/insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        throw new Error('Lỗi thêm giờ thực tập');
      }

      fetchData();
      setNewHour({ thang: '', soGioThucTap: '' });
    } catch (err) {
      alert('Lỗi thêm giờ: ' + err.message);
    }
  };

  const handleUpdate = async (gio) => {
    try {
      await fetch('http://118.69.126.49:5225/api/GioThucTapSinhVien/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gio)
      });
      fetchData();
      setEditing(null);
    } catch (err) {
      alert('Lỗi cập nhật giờ: ' + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Xoá giờ thực tập này?')) {
      await fetch(`http://118.69.126.49:5225/api/GioThucTapSinhVien/delete/${id}`, { method: 'DELETE' });
      fetchData();
    }
  };

  const getHoursByMSSV = (mssv) => hours.filter(h => h.mssv === mssv);
  const getTotalHours = (mssv) => getHoursByMSSV(mssv).reduce((sum, h) => sum + h.soGioThucTap, 0);

  const filteredStudents = students.filter(sv =>
    sv.mssv.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h2>DANH SÁCH SINH VIÊN ĐANG THỰC TẬP</h2>

      <div style={{ marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Tìm theo MSSV hoặc Họ Tên..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ padding: '5px', width: '300px' }}
        />
        
      </div>

      <div style={{ marginBottom: '15px', fontWeight: 'bold' }}>
        Tổng số sinh viên: {filteredStudents.length}
      </div>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ Tên</th>
            <th>Đơn Vị</th>
            <th>Kỳ Thực Tập</th>
            <th>Ngày Bắt Đầu</th>
            <th>Ngày Kết Thúc</th>
            <th>Tổng Số Giờ</th>
            <th>Chi Tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(sv => (
            <React.Fragment key={sv.mssv}>
              <tr>
                <td>{sv.mssv}</td>
                <td>{sv.hoSinhVien} {sv.tenSinhVien}</td>
                <td>{sv.tenDonViThucTap}</td>
                <td>{sv.tenDotThucTap}</td>
                <td>{new Date(sv.ngayBatDau).toLocaleDateString()}</td>
                <td>{new Date(sv.ngayKetThuc).toLocaleDateString()}</td>
                <td>{getTotalHours(sv.mssv)}</td>
                <td><button onClick={() => toggleDetail(sv.mssv)}>{expandedMSSV === sv.mssv ? 'Ẩn' : 'Chi tiết'}</button></td>
              </tr>
              {expandedMSSV === sv.mssv && (
                <tr>
                  <td colSpan="8">
                    <h4>Chi tiết giờ đã nhập:</h4>
                    <table border="1" cellPadding="5">
                      <thead>
                        <tr>
                          <th>Tháng</th>
                          <th>Số Giờ</th>
                          <th>Hành Động</th>
                        </tr>
                      </thead>
                      <tbody>
                        {getHoursByMSSV(sv.mssv).map((h) => (
                          <tr key={h.maGioThucTapSinhVien}>
                            <td>
                              {editing?.maGioThucTapSinhVien === h.maGioThucTapSinhVien ? (
                                <input type="number" value={editing.thang} onChange={(e) => setEditing({ ...editing, thang: e.target.value })} />
                              ) : h.thang}
                            </td>
                            <td>
                              {editing?.maGioThucTapSinhVien === h.maGioThucTapSinhVien ? (
                                <input type="number" value={editing.soGioThucTap} onChange={(e) => setEditing({ ...editing, soGioThucTap: e.target.value })} />
                              ) : h.soGioThucTap}
                            </td>
                            <td>
                              {editing?.maGioThucTapSinhVien === h.maGioThucTapSinhVien ? (
                                <>
                                  <button onClick={() => handleUpdate(editing)}>Lưu</button>
                                  <button onClick={() => setEditing(null)}>Huỷ</button>
                                </>
                              ) : (
                                <>
                                  <button onClick={() => setEditing(h)}>Sửa</button>
                                  <button onClick={() => handleDelete(h.maGioThucTapSinhVien)}>Xoá</button>
                                </>
                              )}
                            </td>
                          </tr>
                        ))}
                        <tr>
                          <td><input type="number" placeholder="Tháng" value={newHour.thang} onChange={e => setNewHour({ ...newHour, thang: e.target.value })} /></td>
                          <td><input type="number" placeholder="Số giờ" value={newHour.soGioThucTap} onChange={e => setNewHour({ ...newHour, soGioThucTap: e.target.value })} /></td>
                          <td><button onClick={() => handleInsert(sv.mssv, sv.maDotThucTap)}>Xác nhận</button></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DanhSachSVDangThucTap;
