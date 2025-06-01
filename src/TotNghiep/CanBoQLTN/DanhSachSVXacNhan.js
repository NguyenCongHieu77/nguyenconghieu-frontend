// DanhSachSVDangKyTN.js
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './DanhSachSVXacNhan.css'; // Make sure this CSS file is present for styling
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


function DanhSachSVXacNhan() {
  const [students, setStudents] = useState([]);
  const [filesMap, setFilesMap] = useState({});
  const [reportFilesMap, setReportFilesMap] = useState({});
  const [reportStatusMap, setReportStatusMap] = useState({});
  const [expandedRegMssv, setExpandedRegMssv] = useState(null);
  const [expandedRepMssv, setExpandedRepMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState('');
  const [reportPreviewLink, setReportPreviewLink] = useState('');
  const [loading, setLoading] = useState(true);

  // filters & search
  const [searchTerm, setSearchTerm] = useState('');
  const [dotTNFilter, setDotTNFilter] = useState('');
  const [gvFilter, setGvFilter] = useState('');
  const [hosoFilter, setHosoFilter] = useState('');

  // 1) Load students
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/get-all`)
      .then(res => {
        const normalized = res.data.map(sv => ({
          ...sv,
          daNopThuyetMinh: sv.daNopThuyetMinh === 'True',
          duDieuKienBaoCao: sv.duDieuKienBaoCao === 'True', // Ensure this is boolean
          ketQuaTotNghiep: sv.ketQuaTotNghiep === 'True',
          dacCachTotNghiep: sv.dacCachTotNghiep === 'True',
          diemTotNghiep: parseFloat(sv.diemTotNghiep) || 0,
          maTrangThai: parseInt(sv.maTrangThai, 10) || 0
        }));
        setStudents(normalized);
      })
      .catch(err => console.error('Lỗi tải danh sách sinh viên:', err))
      .finally(() => setLoading(false));
  }, []);

  const exportToExcel = () => {
  const data = filteredStudents.map(sv => ({
    MSSV: sv.mssv,
    'Họ tên': `${sv.hoSinhVien} ${sv.tenSinhVien}`,
    'Đợt TN': sv.tenDotDKTN,
    'GV hướng dẫn': sv.hoTenGiaoVien,
    'Tên đề tài': sv.tenDeTaiTotNghiep,
    'Mục tiêu': sv.mucTieu,
    'Nội dung NC': sv.noiDungNghienCuu,
    'Hồ sơ ĐK': (filesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    // 'Đã nộp TM': sv.daNopThuyetMinh ? '✔' : '', // Removed from export
    'Hồ sơ báo cáo': (reportFilesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    'Cuốn báo cáo': reportStatusMap[sv.mssv]?.xacNhanCBQLDaNopFileCuonBaoCao ? '✔' : '',
    'Slide báo cáo': reportStatusMap[sv.mssv]?.xacNhanCBQLDaNopSlideBaoCao ? '✔' : '',
    'Source code': reportStatusMap[sv.mssv]?.xacNhanCBQLDaNopSourceCode ? '✔' : '',
    'Đủ điều kiện báo cáo': sv.duDieuKienBaoCao ? '✔' : '✖', // New column for export
    // 'Trạng thái': sv.maTrangThai === 1 ? 'Đã xác nhận' : sv.maTrangThai === 2 ? 'Bị từ chối' : '' // Removed from export
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SV_DangKyTN_BiTuChoi'); // Changed sheet name

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, 'DanhSachSinhVienBiTuChoi.xlsx'); // Changed filename
};


  // 2) Load report statuses
  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/get-all`)
      .then(res => {
        const statusMap = {};
        res.data.forEach(item => {
          statusMap[item.mssv] = item;
        });
        setReportStatusMap(statusMap);
      })
      .catch(err => console.error('Lỗi tải trạng thái báo cáo:', err));
  }, []);

  // 3) After students loaded, fetch both kinds of files
  useEffect(() => {
    if (!loading && students.length) {
      const regReqs = students.map(sv =>
        axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/list-files/${sv.mssv}`)
          .then(res => ({ mssv: sv.mssv, files: res.data }))
          .catch(() => ({ mssv: sv.mssv, files: [] }))
      );
      const repReqs = students.map(sv =>
        axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/list-files/${sv.mssv}`)
          .then(res => ({ mssv: sv.mssv, files: res.data }))
          .catch(() => ({ mssv: sv.mssv, files: [] }))
      );

      Promise.all([Promise.all(regReqs), Promise.all(repReqs)])
        .then(([regResults, repResults]) => {
          const newReg = {};
          regResults.forEach(({ mssv, files }) => { newReg[mssv] = files; });
          setFilesMap(newReg);

          const newRep = {};
          repResults.forEach(({ mssv, files }) => { newRep[mssv] = files; });
          setReportFilesMap(newRep);
        });
    }
  }, [loading, students]);

  // filtered & searched list
  const filteredStudents = useMemo(() =>
    students.filter(sv => {
      // ONLY show students with maTrangThai === 1 (Bị từ chối)
      if (sv.maTrangThai !== 1) return false; 
      // Ẩn sinh viên đủ điều kiện báo cáo
    if (sv.duDieuKienBaoCao) return false;

      const fullName = `${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase();
      const tenDeTaiTotNghiep = `${sv.tenDeTaiTotNghiep}`.toLowerCase();

      const matchesSearch =
        sv.mssv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase()) || 
        tenDeTaiTotNghiep.includes(searchTerm.toLowerCase());
      const matchesDot = dotTNFilter ? sv.tenDotDKTN === dotTNFilter : true;
      const matchesGV = gvFilter ? sv.hoTenGiaoVien === gvFilter : true;
      const regFiles = filesMap[sv.mssv] || [];
      const matchesHoso =
        hosoFilter === 'nophoso' ? regFiles.length > 0 :
        hosoFilter === 'chuanophoso' ? regFiles.length === 0 : true;
      return matchesSearch && matchesDot && matchesGV && matchesHoso;
    }),
    [students, searchTerm, dotTNFilter, gvFilter, hosoFilter, filesMap]
  );

  // expand & preview handlers
  const handleExpandReg = mssv => {
    setExpandedRegMssv(prev => prev === mssv ? null : mssv);
  };
  const handleExpandRep = mssv => {
    setExpandedRepMssv(prev => prev === mssv ? null : mssv);
  };
  const handlePreviewInline = id => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/preview/${id}`)
      .then(res => setPreviewLink(res.data.previewLink))
      .catch(() => alert('Lấy preview thất bại'));
  };
  const handlePreviewReport = id => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/preview/${id}`)
      .then(res => setReportPreviewLink(res.data.previewLink))
      .catch(() => alert('Lấy preview báo cáo thất bại'));
  };

  // download the registration dossier
  const handleDownloadHoso = async mssv => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/download-ho-so/${mssv}`,
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

  // download the report dossier
  const handleDownloadReportHoso = async mssv => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/download-ho-so/${mssv}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${mssv}_hoso_baocao.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Tải hồ sơ báo cáo thất bại:', err);
      alert('Không thể tải hồ sơ báo cáo.');
    }
  };

  const handleDownloadAllHoso = async () => {
    const mssvs = filteredStudents
      .filter(sv => (filesMap[sv.mssv] || []).length > 0)
      .map(sv => sv.mssv);
    if (mssvs.length === 0) {
      alert('Không có hồ sơ để tải.');
      return;
    }
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/download-ho-so-multiple?mssvs=${mssvs.join(',')}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hoso_all.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Tải toàn bộ hồ sơ thất bại:', err);
      alert('Không thể tải hồ sơ.');
    }
  };

  // toggle thesis submission - This function is now removed from the display
  // const handleToggleThuyetMinh = async sv => { ... };

  // update graduation status per student - This function will still be used internally
  // but the UI for it is removed. Only 'Bị từ chối' students are shown.
  const handleTrangThaiChange = async (sv, trangThaiValue) => {
    const newTrangThai = sv.maTrangThai === trangThaiValue ? 0 : trangThaiValue;
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/update-trangthai`,
        { mssv: sv.mssv, maDotDKTN: sv.maDotDKTN, maTrangThai: newTrangThai }
      );
      setStudents(prev =>
        prev.map(item =>
          item.mssv === sv.mssv ? { ...item, maTrangThai: newTrangThai } : item
        )
      );
    } catch (err) {
      console.error('Lỗi cập nhật trạng thái:', err);
      alert('Không thể cập nhật trạng thái.');
    }
  };

  // bulk update graduation status (for "Xác nhận tất cả" / "Từ chối tất cả" buttons in filters)
  const bulkUpdateTrangThai = async (value) => {
    for (const sv of filteredStudents) {
      // eslint-disable-next-line no-await-in-loop
      await handleTrangThaiChange(sv, value);
    }
  };

  // toggle report checkboxes immediately
  const handleToggleReportStatus = async (sv, field) => {
    const current = reportStatusMap[sv.mssv]?.[field] || false;
    const newStatus = !current;
    const base = reportStatusMap[sv.mssv] || {};
    const payload = {
      mssv: sv.mssv,
      maDotDKTN: sv.maDotDKTN,
      xacNhanCBQLDaNopFileCuonBaoCao: base.xacNhanCBQLDaNopFileCuonBaoCao || false,
      xacNhanCBQLDaNopSlideBaoCao: base.xacNhanCBQLDaNopSlideBaoCao || false,
      xacNhanCBQLDaNopSourceCode: base.xacNhanCBQLDaNopSourceCode || false,
    };
    payload[field] = newStatus;

    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/cap-nhat-tinh-trang-baocaototnghiep-by-CBQL`,
        payload
      );
      setReportStatusMap(prev => ({
        ...prev,
        [sv.mssv]: { ...prev[sv.mssv], [field]: newStatus }
      }));
    } catch (err) {
      console.error('Cập nhật báo cáo thất bại:', err);
      alert('Không thể cập nhật trạng thái báo cáo.');
    }
  };

  // NEW: Toggle 'duDieuKienBaoCao'
  const handleToggleDuDieuKienBaoCao = async (sv) => {
  const newStatus = !sv.duDieuKienBaoCao;

  const payload = {
    mssv: sv.mssv,
    maDotDKTN: sv.maDotDKTN,
    maGiaoVien: sv.maGiaoVien,
    duDieuKienBaoCao: newStatus
  };

  try {
    await axios.put(
      `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/svdktn-updatebyCBQL`,
      payload
    );

    setStudents(prev =>
      prev.map(item =>
        item.mssv === sv.mssv
          ? { ...item, duDieuKienBaoCao: newStatus }
          : item
      )
    );
  } catch (err) {
    console.error('Cập nhật điều kiện báo cáo thất bại:', err);
    alert('Không thể cập nhật đủ điều kiện báo cáo.');
  }
};



  if (loading) return <p>Đang tải dữ liệu…</p>;

  const uniqueDots = [...new Set(students.filter(s => s.maTrangThai === 1).map(s => s.tenDotDKTN))];
  const uniqueGVs = [...new Set(students.filter(s => s.maTrangThai === 1).map(s => s.hoTenGiaoVien))];

  return (
    <div className="sv-xac-nhan-container">
      <h2>DANH SÁCH SINH VIÊN ĐƯỢC XÁC NHẬN</h2> {/* Updated title */}
      <div className="filters">
        <input
          placeholder="MSSV, hoặc tên, tên đề tài"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={dotTNFilter} onChange={e => setDotTNFilter(e.target.value)}>
          <option value="">-- Đợt TN --</option>
          {uniqueDots.map(dot => <option key={dot} value={dot}>{dot}</option>)}
        </select>
        <select value={gvFilter} onChange={e => setGvFilter(e.target.value)}>
          <option value="">-- GV hướng dẫn --</option>
          {uniqueGVs.map(gv => <option key={gv} value={gv}>{gv}</option>)}
        </select>
        <select value={hosoFilter} onChange={e => setHosoFilter(e.target.value)}>
          <option value="">-- Tình trạng hồ sơ --</option>
          <option value="nophoso">Đã nộp</option>
          <option value="chuanophoso">Chưa nộp</option>
        </select>
        {/* Bulk update buttons for status are kept, but they will only affect visible students (maTrangThai === 2) */}
        {/* <button onClick={() => bulkUpdateTrangThai(1)}>Xác nhận tất cả sinh viên đang hiển thị</button>
        <button onClick={() => bulkUpdateTrangThai(2)}>Từ chối tất cả sinh viên đang hiển thị</button>  */}
        <button onClick={handleDownloadAllHoso}>Tải tất cả hồ sơ đã nộp</button>
        <button onClick={exportToExcel}>📄 Xuất Excel</button>
        <button className="print-btn" onClick={() => window.print()}>In danh sách</button>
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
            {/* Removed: <th>Tải file thuyết minh</th> */}
            {/* Removed: <th>File thuyết minh</th> */}
            {/* Removed: <th>Đã nộp TM</th> */}
            <th>Tải hồ sơ báo cáo</th>
            <th>Hồ sơ báo cáo</th>
            <th>File cuốn báo cáo</th>
            <th>Slide báo cáo</th>
            <th>Source code</th>
            <th>Xác nhận báo cáo</th> {/* NEW COLUMN HEADER */}
            {/* Removed: <th>Trạng thái</th> */}
          </tr>
        </thead>
        <tbody>
          {filteredStudents.length > 0 ? (
            filteredStudents.map(sv => {
              const regFiles = filesMap[sv.mssv] || [];
              const repFiles = reportFilesMap[sv.mssv] || [];
              const repStatus = reportStatusMap[sv.mssv] || {};

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
                    {/* Removed cells for 'Tải file thuyết minh', 'File thuyết minh', 'Đã nộp TM' */}
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => handleDownloadReportHoso(sv.mssv)}>Tải hồ sơ báo cáo</button>
                    </td>
                    <td className="files-cell">
                      {repFiles.length > 0 ? (
                        <span
                          onClick={() => handleExpandRep(sv.mssv)}
                          style={{ cursor: 'pointer', color: '#007bff' }}
                        >
                          Đã nộp báo cáo ({repFiles.length})
                        </span>
                      ) : (
                        <span className="no-files">Chưa nộp báo cáo</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={repStatus.xacNhanCBQLDaNopFileCuonBaoCao || false}
                        onChange={() => handleToggleReportStatus(sv, 'xacNhanCBQLDaNopFileCuonBaoCao')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={repStatus.xacNhanCBQLDaNopSlideBaoCao || false}
                        onChange={() => handleToggleReportStatus(sv, 'xacNhanCBQLDaNopSlideBaoCao')}
                      />
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={repStatus.xacNhanCBQLDaNopSourceCode || false}
                        onChange={() => handleToggleReportStatus(sv, 'xacNhanCBQLDaNopSourceCode')}
                      />
                    </td>
                    {/* NEW COLUMN: Xác nhận báo cáo */}
                    <td style={{ textAlign: 'center' }}>
                      <button onClick={() => handleToggleDuDieuKienBaoCao(sv)}>
  {sv.duDieuKienBaoCao ? 'Hủy đủ điều kiện' : 'Xác nhận đủ điều kiện'}
</button>

                    </td>
                    {/* Removed 'Trạng thái' column */}
                  </tr>

                  {/* Expanded Registration Files (if any) */}
                  {expandedRegMssv === sv.mssv && regFiles.length > 0 && (
                    <tr>
                      <td colSpan={11} className="files-expanded"> {/* Adjusted colspan */}
                        <ul className="file-list-inline">
                          {regFiles.map(file => (
                            <li key={file.id} onClick={() => handlePreviewInline(file.id)}>
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}

                  {/* Expanded Report Files (if any) */}
                  {expandedRepMssv === sv.mssv && repFiles.length > 0 && (
                    <tr>
                      <td colSpan={11} className="files-expanded"> {/* Adjusted colspan */}
                        <ul className="file-list-inline">
                          {repFiles.map(file => (
                            <li key={file.id} onClick={() => handlePreviewReport(file.id)}>
                              {file.name}
                            </li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
          ) : (
            <tr>
              <td colSpan="11" style={{ textAlign: 'center', padding: '20px' }}>
                Không có sinh viên nào trong danh sách.
              </td>
            </tr>
          )}
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

      {reportPreviewLink && (
        <div className="modal-overlay" onClick={() => setReportPreviewLink('')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setReportPreviewLink('')}>×</button>
            <iframe
              src={reportPreviewLink}
              title="Preview báo cáo"
              style={{ width: '100%', height: '90vh', border: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default DanhSachSVXacNhan;