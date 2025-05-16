import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './DanhSachSVDangKyTN.css';

function DanhSachSVDangKyTN() {
  const [students, setStudents] = useState([]);
  const [filesMap, setFilesMap] = useState({});
  const [expandedMssv, setExpandedMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dotTNFilter, setDotTNFilter] = useState('');
  const [gvFilter, setGvFilter] = useState('');
  const [hosoFilter, setHosoFilter] = useState('');

  useEffect(() => {
    axios.get('http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/get-all')
      .then(res => {
        const normalized = res.data.map(sv => ({
          ...sv,
          daNopThuyetMinh: sv.daNopThuyetMinh === 'True',
          duDieuKienBaoCao: sv.duDieuKienBaoCao === 'True',
          ketQuaTotNghiep: sv.ketQuaTotNghiep === 'True',
          dacCachTotNghiep: sv.dacCachTotNghiep === 'True',
          diemTotNghiep: parseFloat(sv.diemTotNghiep) || 0,
          maTrangThai: parseInt(sv.maTrangThai, 10) || 0
        })).filter(sv => sv.maTrangThai !== 1); // Hide confirmed students
        setStudents(normalized);
      })
      .catch(err => console.error('Lỗi tải danh sách sinh viên:', err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      const fetchFiles = async () => {
        const fileRequests = students.map(sv =>
          axios.get(`http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/list-files/${sv.mssv}`)
            .then(res => ({ mssv: sv.mssv, files: res.data }))
            .catch(() => ({ mssv: sv.mssv, files: [] }))
        );
        const results = await Promise.all(fileRequests);
        const newFilesMap = {};
        results.forEach(({ mssv, files }) => {
          newFilesMap[mssv] = files;
        });
        setFilesMap(newFilesMap);
      };
      fetchFiles();
    }
  }, [loading, students]);

  const filteredStudents = useMemo(() => {
    return students.filter(sv => {
      const fullName = `${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase();
      const matchesSearch =
        sv.mssv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase());
      const matchesDot = dotTNFilter ? sv.tenDotDKTN === dotTNFilter : true;
      const matchesGV = gvFilter ? sv.hoTenGiaoVien === gvFilter : true;
      const files = filesMap[sv.mssv] || [];
      const matchesHoso =
        hosoFilter === 'nophoso' ? files.length > 0 :
        hosoFilter === 'chuanophoso' ? files.length === 0 : true;

      return matchesSearch && matchesDot && matchesGV && matchesHoso;
    });
  }, [students, searchTerm, dotTNFilter, gvFilter, hosoFilter, filesMap]);

  const handleExpand = mssv => {
    setExpandedMssv(prev => (prev === mssv ? null : mssv));
  };

  const handlePreviewInline = id => {
    axios.get(`http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/preview/${id}`)
      .then(res => setPreviewLink(res.data.previewLink))
      .catch(() => alert('Lấy preview thất bại'));
  };

  const handleDownloadHoso = async mssv => {
    try {
      const response = await axios.get(
        `http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/download-ho-so/${mssv}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${mssv}_hoso.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Tải hồ sơ thất bại:', err);
      alert('Không thể tải hồ sơ.');
    }
  };

  const handleDownloadAllHoso = async () => {
    const mssvs = filteredStudents.filter(sv => (filesMap[sv.mssv] || []).length > 0).map(sv => sv.mssv);
    try {
      const response = await axios.get(
        `http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/download-ho-so-multiple?mssvs=${mssvs.join(',')}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hoso_all.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Tải toàn bộ hồ sơ thất bại:', err);
      alert('Không thể tải hồ sơ.');
    }
  };

  const bulkUpdateTrangThai = async (value) => {
    for (const sv of filteredStudents) {
      await handleTrangThaiChange(sv, value);
    }
  };

  const bulkDeleteRejected = async () => {
    const rejected = filteredStudents.filter(sv => sv.maTrangThai === 2);
    for (const sv of rejected) {
      try {
        await axios.delete(`http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/delete/${sv.mssv}/${sv.maDotDKTN}`);
        setStudents(prev => prev.filter(s => s.mssv !== sv.mssv || s.maDotDKTN !== sv.maDotDKTN));
      } catch (err) {
        console.error('Lỗi khi xóa sinh viên:', err);
      }
    }
  };

  const handleTrangThaiChange = async (sv, trangThaiValue) => {
    const newTrangThai = sv.maTrangThai === trangThaiValue ? 0 : trangThaiValue;
    try {
      await axios.put('http://118.69.126.49:5225/api/ChiTietSinhVienDKTN/update-trangthai', {
        mssv: sv.mssv,
        maDotDKTN: sv.maDotDKTN,
        maTrangThai: newTrangThai
      });
      setStudents(prev => prev.map(item =>
        item.mssv === sv.mssv ? { ...item, maTrangThai: newTrangThai } : item
      ));
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật trạng thái.');
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="sv-xac-nhan-container">
      <h2>DANH SÁCH SINH VIÊN ĐĂNG KÝ TỐT NGHIỆP</h2>

      <div className="filters">
        <input placeholder="Tìm MSSV hoặc họ tên" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select value={dotTNFilter} onChange={e => setDotTNFilter(e.target.value)}>
          <option value="">-- Đợt TN --</option>
          {[...new Set(students.map(s => s.tenDotDKTN))].map(dot => <option key={dot} value={dot}>{dot}</option>)}
        </select>
        <select value={gvFilter} onChange={e => setGvFilter(e.target.value)}>
          <option value="">-- GV Hướng dẫn --</option>
          {[...new Set(students.map(s => s.hoTenGiaoVien))].map(gv => <option key={gv} value={gv}>{gv}</option>)}
        </select>
        <select value={hosoFilter} onChange={e => setHosoFilter(e.target.value)}>
          <option value="">-- Tình trạng hồ sơ --</option>
          <option value="nophoso">Đã nộp</option>
          <option value="chuanophoso">Chưa nộp</option>
        </select>
        <button onClick={() => bulkUpdateTrangThai(1)}>Xác nhận tất cả</button>
        <button onClick={() => bulkUpdateTrangThai(2)}>Từ chối tất cả</button>
        <button onClick={bulkDeleteRejected}>Xóa tất cả bị từ chối</button>
        <button onClick={handleDownloadAllHoso}>Tải tất cả hồ sơ đã nộp</button>
      </div>

      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên SV</th>
            <th>Đợt TN</th>
            <th>GV hướng dẫn</th>
            <th>Tên đề tài</th>
            <th>Mục tiêu</th>
            <th>Nội dung NC</th>
            <th>Tải hồ sơ</th>
            <th>Hồ sơ đăng ký</th>
            <th>Đã nộp TM</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(sv => {
            const files = filesMap[sv.mssv] || [];
            return (
              <React.Fragment key={sv.mssv}>
                <tr>
                  <td>{sv.mssv}</td>
                  <td>{`${sv.hoSinhVien} ${sv.tenSinhVien}`}</td>
                  <td>{sv.tenDotDKTN}</td>
                  <td>{sv.hoTenGiaoVien}</td>
                  <td>{sv.tenDeTaiTotNghiep}</td>
                  <td>{sv.mucTieu}</td>
                  <td>{sv.noiDungNghienCuu}</td>
                  <td style={{ textAlign: 'center' }}>
                    <button onClick={() => handleDownloadHoso(sv.mssv)}>Tải</button>
                  </td>
                  <td>{files.length > 0 ? <span onClick={() => handleExpand(sv.mssv)} style={{ cursor: 'pointer', color: '#007bff' }}>Đã nộp ({files.length})</span> : <span className="no-files">Chưa nộp</span>}</td>
                  <td><input type="checkbox" checked={sv.daNopThuyetMinh} readOnly /></td>
                  <td>
                    <button onClick={() => handleTrangThaiChange(sv, 1)} style={{ marginRight: 8, backgroundColor: sv.maTrangThai === 1 ? 'green' : '#ccc', color: 'white' }}>Xác nhận</button>
                    <button onClick={() => handleTrangThaiChange(sv, 2)} style={{ backgroundColor: sv.maTrangThai === 2 ? 'red' : '#ccc', color: 'white' }}>Từ chối</button>
                  </td>
                </tr>
                {expandedMssv === sv.mssv && files.length > 0 && (
                  <tr>
                    <td colSpan={11}>
                      <ul className="file-list-inline">
                        {files.map(file => <li key={file.id} onClick={() => handlePreviewInline(file.id)}>{file.name}</li>)}
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
            <iframe src={previewLink} title="Preview" style={{ width: '100%', height: '90vh', border: 'none' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DanhSachSVDangKyTN;
