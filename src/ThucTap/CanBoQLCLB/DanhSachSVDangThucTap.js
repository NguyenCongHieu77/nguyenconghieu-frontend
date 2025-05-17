import React, { useEffect, useState } from 'react';
import './DanhSachSVDangThucTap.css';
import { FiDownload } from 'react-icons/fi';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';



const DanhSachSVDangThucTap = () => {
  const [students, setStudents] = useState([]);
  const [hours, setHours] = useState([]);
  const [expandedMSSV, setExpandedMSSV] = useState(null);
  const [newHour, setNewHour] = useState({ soGioThucTap: '' });
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

  const [kyFilter, setKyFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
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

  const exportToExcel = () => {
  const data = filteredStudents.map(sv => ({
    MSSV: sv.mssv,
    'Họ tên': `${sv.hoSinhVien} ${sv.tenSinhVien}`,
    'Đơn vị': sv.tenDonViThucTap,
    'Kỳ': sv.tenDotThucTap,
    'Ngày BĐ': new Date(sv.ngayBatDau).toLocaleDateString(),
    'Ngày KT': new Date(sv.ngayKetThuc).toLocaleDateString(),
    'HS ĐK': (dsFilesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    'HS KT': (dsFilesKetThucMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    'Tổng giờ': getTotalHours(sv.mssv)
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SinhVienDangTT');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, 'DanhSachSinhVienDangThucTap.xlsx');
};


  const toggleDetail = mssv => {
    setExpandedMSSV(prev => prev === mssv ? null : mssv);
    setNewHour({ soGioThucTap: '' });
    setEditing(null);
  };

  const handleInsert = async (mssv, maDotThucTap) => {
    try {
      const existing = getHoursByMSSV(mssv).length;
      const period = internshipPeriods.find(p => p.maDotThucTap === maDotThucTap);
      const nextMonth = existing + 1;

      if (period && nextMonth > period.soThangThucTap) {
        return alert(`Tháng không thể lớn hơn ${period.soThangThucTap}`);
      }

      await axios.post(`${apiInsertHour}/insert`, {
        mssv,
        maDotThucTap,
        ngayBatDau: new Date().toISOString(),
        ngayKetThuc: new Date().toISOString(),
        soGioThucTap: Number(newHour.soGioThucTap),
        xacNhanGiaovien: true
      });

      fetchData();
      setNewHour({ soGioThucTap: '' });
    } catch (err) {
      alert('Lỗi thêm giờ: ' + err.message);
    }
  };

  const handleUpdate = async gio => {
    try {
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
      await axios.delete(`${apiInsertHour}/delete/${id}`);
      fetchData();
    }
  };

  const handleDeleteStudent = async (mssv, maDotThucTap) => {
    if (window.confirm(`Xoá sinh viên ${mssv}?`)) {
      try {
        await axios.delete(`http://118.69.126.49:5225/api/ChiTietThucTap/delete/${mssv}/${maDotThucTap}`);
        fetchData();
      } catch (err) {
        alert('Xoá sinh viên thất bại: ' + err.message);
      }
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

  const getTotalHours = mssv => {
    const studentHours = getHoursByMSSV(mssv);
    return studentHours.reduce((sum, h) => {
      const hours = Number(h.soGioThucTap);
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0);
  };

  const filteredStudents = students
  .filter(sv =>
    sv.mssv.includes(searchTerm) ||
    (`${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase().includes(searchTerm.toLowerCase()))
  )
  .filter(sv => !kyFilter || sv.tenDotThucTap === kyFilter);


  return (
    <div>
      <h2 className="title">DANH SÁCH SINH VIÊN ĐANG THỰC TẬP</h2>

      <div className="controls">
        <input
          placeholder="Tìm MSSV hoặc Họ tên..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={kyFilter} onChange={e => setKyFilter(e.target.value)}>
  <option value="">-- Tất cả đợt --</option>
  {[...new Set(students.map(sv => sv.tenDotThucTap))].map((ky, i) => (
    <option key={i} value={ky}>{ky}</option>
  ))}
</select>

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
        <button onClick={exportToExcel}>📄 Xuất Excel</button>

      </div>

      <table className="main-table">
        <thead>
          <tr>
            <th>MSSV</th><th>Họ Tên</th><th>Đơn Vị</th><th>Đợt</th>
            <th>Ngày BĐ</th><th>Ngày KT</th><th>HS ĐK</th><th>HS KT</th>
            <th>Tổng giờ</th><th>Chi tiết</th><th>Xoá SV</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(sv => {
            const hsbd = dsFilesMap[sv.mssv] || [];
            const hskt = dsFilesKetThucMap[sv.mssv] || [];
            return (
              <React.Fragment key={sv.mssv}>
                <tr>
                  <td>{sv.mssv}</td>
                  <td>{sv.hoSinhVien} {sv.tenSinhVien}</td>
                  <td>{String(sv.tenDonViThucTap)}</td>
                  <td>{String(sv.tenDotThucTap)}</td>
                  <td>{new Date(sv.ngayBatDau).toLocaleDateString()}</td>
                  <td>{new Date(sv.ngayKetThuc).toLocaleDateString()}</td>
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
                  <td>
                    <button onClick={() => handleDeleteStudent(sv.mssv, sv.maDotThucTap)}>
                      Xoá
                    </button>
                  </td>
                </tr>

                {expandedMSSV === sv.mssv && (
                  <tr>
                    <td colSpan={11}>
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
                          <tr>
                            <td>Tháng {getHoursByMSSV(sv.mssv).length + 1}</td>
                            <td><input
                              type="number"
                              placeholder="Giờ"
                              value={newHour.soGioThucTap}
                              onChange={e => setNewHour({ ...newHour, soGioThucTap: e.target.value })}
                            /></td>
                            <td><button onClick={() => handleInsert(sv.mssv, sv.maDotThucTap)}>Xác nhận</button></td>
                          </tr>
                        </tbody>
                      </table>

                      <h4>Hồ sơ ĐK</h4>
                      <ul className="file-list">
                        {hsbd.length
                          ? hsbd.map(f =>
                              <li key={f.id} onClick={() => preview(f.id, false)}>{f.name}</li>
                            )
                          : <li>Chưa nộp hồ sơ ĐK</li>
                        }
                      </ul>

                      <h4>Hồ sơ KT</h4>
                      <ul className="file-list">
                        {hskt.length
                          ? hskt.map(f =>
                              <li key={f.id} onClick={() => preview(f.id, true)}>{f.name}</li>
                            )
                          : <li>Chưa nộp hồ sơ KT</li>
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
