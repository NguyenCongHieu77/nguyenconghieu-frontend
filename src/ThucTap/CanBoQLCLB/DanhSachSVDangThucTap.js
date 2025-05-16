import React, { useEffect, useState } from 'react';
import './DanhSachSVDangThucTap.css';
import { FiDownload } from 'react-icons/fi';
import axios from 'axios';
import { saveAs } from 'file-saver';

const DanhSachSVDangThucTap = () => {
  const [students, setStudents] = useState([]);
  const [hours, setHours] = useState([]);
  const [expandedMSSV, setExpandedMSSV] = useState(null);
  const [newHours, setNewHours] = useState({});
  const [editing, setEditing] = useState(null);
  const [internshipPeriods, setInternshipPeriods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dsFilesMap, setDsFilesMap] = useState({});
  const [dsFilesKetThucMap, setDsFilesKetThucMap] = useState({});
  const [previewLink, setPreviewLink] = useState('');

  const apiChiTiet = 'http://118.69.126.49:5225/api/ChiTietThucTap/get-all';
  const apiGio = 'http://118.69.126.49:5225/api/GioThucTapSinhVien/get-all';
  const apiPeriods = 'http://118.69.126.49:5225/api/LoaiThucTap';
  const apiHoSo = 'http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau';
  const apiKetThuc = 'http://118.69.126.49:5225/api/ChiTietHoSoThucTapKetThuc';
  const apiInsertHour = 'http://118.69.126.49:5225/api/GioThucTapSinhVien';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [svRes, hourRes, periodRes] = await Promise.all([
        fetch('http://118.69.126.49:5225/api/ChiTietThucTap/get-all'),
        fetch('http://118.69.126.49:5225/api/GioThucTapSinhVien/get-all'),
        fetch('http://118.69.126.49:5225/api/LoaiThucTap')
      const [svRes, hourRes, periodRes, hsRes, ktRes] = await Promise.all([
        axios.get(apiChiTiet),
        axios.get(apiGio),
        axios.get(apiPeriods),
        axios.get(`${apiHoSo}/get-all-ho-so-ban-dau`),
        axios.get(`${apiKetThuc}/get-all-ho-so-ket-thuc`)

      ]);

      setStudents(svRes.data);
      setHours(hourRes.data);
      setInternshipPeriods(periodRes.data);

      const fileMap = {}, fileKTMap = {};
      await Promise.all(hsRes.data.map(async hs => {
        try {
          const list = (await axios.get(`${apiHoSo}/list-files/${hs.mssv}`)).data;
          fileMap[hs.mssv] = list;
        } catch {
          fileMap[hs.mssv] = [];
        }
      }));
      await Promise.all(ktRes.data.map(async kt => {
        try {
          const list = (await axios.get(`${apiKetThuc}/list-files/${kt.mssv}`)).data;
          fileKTMap[kt.mssv] = list;
        } catch {
          fileKTMap[kt.mssv] = [];
        }
      }));
      setDsFilesMap(fileMap);
      setDsFilesKetThucMap(fileKTMap);

    } catch (err) {
      console.error('Lỗi fetch dữ liệu:', err);
    }
  };

  const toggleDetail = mssv => {
    setExpandedMSSV(prev => prev === mssv ? null : mssv);
    setNewHours({});
    setEditing(null);
  };

  const generateMonthInputs = (ngayBatDau, ngayKetThuc, mssv) => {
    const start = new Date(ngayBatDau);
    const end = new Date(ngayKetThuc);
    const inputs = [];

    while (start <= end) {
      const month = start.getMonth() + 1;
      const year = start.getFullYear();
      const key = `${year}-${month}`;

      const existing = hours.find(h => h.mssv === mssv && h.thang === month);
      if (!existing) {
        inputs.push({ thang: month, nam: year, key });
      }

      start.setMonth(start.getMonth() + 1);
    }
    return inputs;
  };

  const handleInsert = async (mssv, maDotThucTap, thang, ngayBatDau, ngayKetThuc) => {
    const gio = Number(newHours[thang]) || 0;
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

      await axios.post(`${apiInsertHour}/insert`, {
        mssv,
        maDotThucTap,
        ngayBatDau,
        ngayKetThuc,
        soGioThucTap: gio,
        xacNhanGiaovien: true

      });
      fetchData();
      setNewHours(prev => ({ ...prev, [thang]: '' }));
    } catch (err) {
      alert('Lỗi thêm giờ: ' + err.message);
    }
  };

  const handleUpdate = async gio => {
    try {

      await fetch('http://118.69.126.49:5225/api/GioThucTapSinhVien/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gio)
      await axios.put(`${apiInsertHour}/update`, {
        mssv: gio.mssv,
        maDotThucTap: gio.maDotThucTap,
        thang: gio.thang,
        soGioThucTap: gio.soGioThucTap

      });

      fetchData();
      setEditing(null);
    } catch (err) {
      alert('Lỗi cập nhật giờ: ' + err.message);
    }
  };

  const handleDelete = async id => {
    if (window.confirm('Xoá giờ thực tập này?')) {

      await fetch(`http://118.69.126.49:5225/api/GioThucTapSinhVien/delete/${id}`, { method: 'DELETE' });

      await axios.delete(`${apiInsertHour}/delete/${id}`);

      fetchData();
    }
  };

  const downloadFile = async (mssv, isKT = false) => {
    const url = isKT
      ? `${apiKetThuc}/download-ho-so/${mssv}`
      : `${apiHoSo}/download-ho-so/${mssv}`;
    try {
      const res = await axios.get(url, { responseType: 'blob' });
      saveAs(res.data, `${mssv}_${isKT ? 'HoSoKetThuc' : 'HoSoBanDau'}.zip`);
    } catch {
      alert(`Tải ${isKT ? 'HS kết thúc' : 'HS ban đầu'} thất bại`);
    }
  };

  const preview = async (id, isKT = false) => {
    const url = isKT
      ? `${apiKetThuc}/preview/${id}`
      : `${apiHoSo}/preview/${id}`;
    try {
      const res = await axios.get(url);
      setPreviewLink(res.data.previewLink);
    } catch {
      alert('Lấy preview thất bại');
    }
  };

  const getHoursByMSSV = mssv => hours.filter(h => h.mssv === mssv);
  const getTotalHours = mssv => getHoursByMSSV(mssv).reduce((sum, h) => sum + h.soGioThucTap, 0);

  const filteredStudents = students.filter(sv =>
    sv.mssv.includes(searchTerm) ||
    (`${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div>
      <div className="controls">
        <h2>DANH SÁCH SINH VIÊN ĐANG THỰC TẬP</h2>
        <input
          placeholder="Tìm MSSV hoặc Họ tên..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <button onClick={() => filteredStudents.forEach(sv => downloadFile(sv.mssv))}>
          Tải tất cả HS ĐK
        </button>
        <button onClick={() => {
          const mssvs = filteredStudents.map(sv => sv.mssv);
          axios.post(`${apiKetThuc}/download-ho-so-multiple`, mssvs, { responseType: 'blob' })
            .then(r => saveAs(r.data, 'HoSoKT_All.zip'))
            .catch(() => alert('Tải tất cả HS KT thất bại'));
        }}>
          Tải tất cả HS KT
        </button>
      </div>

      <table className="main-table">
        <thead>
          <tr>
            <th>MSSV</th><th>Họ Tên</th><th>Đơn Vị</th><th>Kỳ</th>
            <th>Ngày BĐ</th><th>Ngày KT</th><th>HS ĐK</th><th>HS KT</th>
            <th>Tổng giờ</th><th>Chi tiết</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(sv => {
            const hsbd = dsFilesMap[sv.mssv] || [];
            const hskt = dsFilesKetThucMap[sv.mssv] || [];
            const gioSinhVien = hours.find(h => h.mssv === sv.mssv);
            const ngayBD = gioSinhVien?.ngayBatDau || sv.ngayBatDau;
            const ngayKT = gioSinhVien?.ngayKetThuc || sv.ngayKetThuc;

            return (
              <React.Fragment key={sv.mssv}>
                <tr>
                  <td>{sv.mssv}</td>
                  <td>{sv.hoSinhVien} {sv.tenSinhVien}</td>
                  <td>{String(sv.tenDonViThucTap)}</td>
                  <td>{String(sv.tenDotThucTap)}</td>
                  <td>{new Date(ngayBD).toLocaleDateString()}</td>
                  <td>{new Date(ngayKT).toLocaleDateString()}</td>
                  <td>{hsbd.length
                    ? <button onClick={() => downloadFile(sv.mssv)}><FiDownload /></button>
                    : 'Chưa nộp'}</td>
                  <td>{hskt.length
                    ? <button onClick={() => downloadFile(sv.mssv, true)}><FiDownload /></button>
                    : 'Chưa nộp'}</td>
                  <td>{getTotalHours(sv.mssv)}</td>
                  <td>
                    <button onClick={() => toggleDetail(sv.mssv)}>
                      {expandedMSSV === sv.mssv ? 'Ẩn' : 'Chi tiết'}
                    </button>
                  </td>
                </tr>

                {expandedMSSV === sv.mssv && (
                  <tr>
                    <td colSpan={10}>
                      <h4>Giờ thực tập</h4>
                      <table className="sub-table">
                        <thead>
                          <tr><th>Tháng</th><th>Giờ</th><th>HĐ</th></tr>
                        </thead>
                        <tbody>
                          {getHoursByMSSV(sv.mssv).map(h =>
                            <tr key={h.maGioThucTapSinhVien}>
                              <td>{h.thang}</td>
                              <td>
                                {editing?.maGioThucTapSinhVien === h.maGioThucTapSinhVien
                                  ? <input
                                      type="number"
                                      value={editing.soGioThucTap}
                                      onChange={e =>
                                        setEditing({ ...editing, soGioThucTap: Number(e.target.value) })
                                      }
                                    />
                                  : h.soGioThucTap}
                              </td>
                              <td>
                                {editing?.maGioThucTapSinhVien === h.maGioThucTapSinhVien
                                  ? <>
                                      <button onClick={() => handleUpdate(editing)}>Lưu</button>
                                      <button onClick={() => setEditing(null)}>Huỷ</button>
                                    </>
                                  : <>
                                      <button onClick={() => setEditing(h)}>Sửa</button>
                                      <button onClick={() => handleDelete(h.maGioThucTapSinhVien)}>Xoá</button>
                                    </>}
                              </td>
                            </tr>
                          )}
                          {generateMonthInputs(ngayBD, ngayKT, sv.mssv).map(({ thang, key }) => (
                            <tr key={key}>
                              <td>Tháng {thang}</td>
                              <td>
                                <input
                                  type="number"
                                  placeholder="Giờ"
                                  value={newHours[thang] || ''}
                                  onChange={e =>
                                    setNewHours(prev => ({ ...prev, [thang]: e.target.value }))
                                  }
                                />
                              </td>
                              <td>
                                <button onClick={() =>
                                  handleInsert(sv.mssv, sv.maDotThucTap, thang, ngayBD, ngayKT)
                                }>
                                  Xác nhận
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>

                      <h4>Hồ sơ đăng ký</h4>
                      <ul className="file-list">
                        {hsbd.length
                          ? hsbd.map(f =>
                              <li key={f.id} onClick={() => preview(f.id, false)}>{f.name}</li>
                            )
                          : <li>Chưa nộp hồ sơ đăng ký</li>
                        }
                      </ul>

                      <h4>Hồ sơ kết thúc</h4>
                      <ul className="file-list">
                        {hskt.length
                          ? hskt.map(f =>
                              <li key={f.id} onClick={() => preview(f.id, true)}>{f.name}</li>
                            )
                          : <li>Chưa nộp hồ sơ kết thúc</li>
                        }
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {previewLink && (
        <div className="modal-overlay" onClick={() => setPreviewLink('')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPreviewLink('')}>×</button>
            <iframe
              src={previewLink}
              title="Preview"
              style={{ width: '100%', height: '90vh', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DanhSachSVDangThucTap;
