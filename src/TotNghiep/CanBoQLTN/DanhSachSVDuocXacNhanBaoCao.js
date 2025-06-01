// // File: DanhSachSVDuocXacNhan.js
// import React, { useEffect, useState, useMemo } from 'react';
// import axios from 'axios';
// import './DanhSachSVDuocXacNhanBaoCao.css';
// import * as XLSX from 'xlsx';
// import { saveAs } from 'file-saver';


// function DanhSachSVDuocXacNhan() {
//   const [students, setStudents] = useState([]);
//   const [filesMap, setFilesMap] = useState({});
//   const [reportFilesMap, setReportFilesMap] = useState({});
//   const [expandedMssv, setExpandedMssv] = useState(null);
//   const [expandedRepMssv, setExpandedRepMssv] = useState(null);
//   const [previewLink, setPreviewLink] = useState('');
//   const [reportPreviewLink, setReportPreviewLink] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [dotTNFilter, setDotTNFilter] = useState('');
//   const [gvFilter, setGvFilter] = useState('');
//   const [hosoFilter, setHosoFilter] = useState('');

//   useEffect(() => {
//     axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/get-all`)
//       .then(res => {
//         const normalized = res.data
//           .map(sv => ({
//             ...sv,
//             daNopThuyetMinh: sv.daNopThuyetMinh === 'True',
//             duDieuKienBaoCao: sv.duDieuKienBaoCao === 'True',
//             ketQuaTotNghiep: sv.ketQuaTotNghiep === 'True',
//             dacCachTotNghiep: sv.dacCachTotNghiep === 'True',
//             diemTotNghiep: parseFloat(sv.diemTotNghiep) || 0,
//             maTrangThai: parseInt(sv.maTrangThai, 10) || 0
//           }))
//           .filter(sv => sv.maTrangThai === 1 && sv.duDieuKienBaoCao); // Chỉ lấy sinh viên được báo cáo
//         setStudents(normalized);
//       })
//       .catch(err => console.error('Lỗi tải danh sách sinh viên:', err))
//       .finally(() => setLoading(false));
//   }, []);

//   const exportToExcel = () => {
//   const data = filteredStudents.map(sv => ({
//     MSSV: sv.mssv,
//     'Họ tên': `${sv.hoSinhVien} ${sv.tenSinhVien}`,
//     'Đợt TN': sv.tenDotDKTN,
//     'GV hướng dẫn': sv.hoTenGiaoVien,
//     'Tên đề tài': sv.tenDeTaiTotNghiep,
//     'Mục tiêu': sv.mucTieu,
//     'Nội dung NC': sv.noiDungNghienCuu,
//     'HS ĐK': (filesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
//     'HS BC': (reportFilesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
//     'Điểm TN': sv.diemTotNghiep,
//     'Kết quả TN': sv.ketQuaTotNghiep ? '✔' : '',
//     'Đặc cách TN': sv.dacCachTotNghiep ? '✔' : '',
//   }));

//   const worksheet = XLSX.utils.json_to_sheet(data);
//   const workbook = XLSX.utils.book_new();
//   XLSX.utils.book_append_sheet(workbook, worksheet, 'DaXacNhan');

//   const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
//   const blob = new Blob([buffer], { type: 'application/octet-stream' });
//   saveAs(blob, 'DanhSachSVDuocXacNhan.xlsx');
// };


//   useEffect(() => {
//     if (!loading) {
//       const fetchFiles = async () => {
//         const regReqs = students.map(sv =>
//           axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/list-files/${sv.mssv}`)
//             .then(res => ({ mssv: sv.mssv, files: res.data }))
//             .catch(() => ({ mssv: sv.mssv, files: [] }))
//         );
//         const repReqs = students.map(sv =>
//           axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/list-files/${sv.mssv}`)
//             .then(res => ({ mssv: sv.mssv, files: res.data }))
//             .catch(() => ({ mssv: sv.mssv, files: [] }))
//         );
//         const [regResults, repResults] = await Promise.all([
//           Promise.all(regReqs),
//           Promise.all(repReqs)
//         ]);
//         const newFilesMap = {};
//         regResults.forEach(({ mssv, files }) => {
//           newFilesMap[mssv] = files;
//         });
//         setFilesMap(newFilesMap);

//         const newRepMap = {};
//         repResults.forEach(({ mssv, files }) => {
//           newRepMap[mssv] = files;
//         });
//         setReportFilesMap(newRepMap);
//       };
//       fetchFiles();
//     }
//   }, [loading, students]);

//   const filteredStudents = useMemo(() => {
//     return students.filter(sv => {
//       const fullName = `${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase();
//       const tenDeTaiTotNghiep = `${sv.tenDeTaiTotNghiep}`.toLowerCase();

//       const matchesSearch =
//         sv.mssv.toLowerCase().includes(searchTerm.toLowerCase()) ||
//         fullName.includes(searchTerm.toLowerCase()) || 
//         tenDeTaiTotNghiep.includes(searchTerm.toLowerCase());
//       const matchesDot = dotTNFilter ? sv.tenDotDKTN === dotTNFilter : true;
//       const matchesGV = gvFilter ? sv.hoTenGiaoVien === gvFilter : true;
//       const files = filesMap[sv.mssv] || [];
//       const matchesHoso =
//         hosoFilter === 'nophoso' ? files.length > 0 :
//         hosoFilter === 'chuanophoso' ? files.length === 0 : true;

//       return matchesSearch && matchesDot && matchesGV && matchesHoso;
//     });
//   }, [students, searchTerm, dotTNFilter, gvFilter, hosoFilter, filesMap]);

//   const handleExpand = mssv => {
//     setExpandedMssv(prev => (prev === mssv ? null : mssv));
//   };

//   const handleExpandRep = mssv => {
//     setExpandedRepMssv(prev => (prev === mssv ? null : mssv));
//   };

//   const handlePreviewInline = id => {
//     axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/preview/${id}`)
//       .then(res => setPreviewLink(res.data.previewLink))
//       .catch(() => alert('Lấy preview thất bại'));
//   };

//   const handlePreviewReport = id => {
//     axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/preview/${id}`)
//       .then(res => setReportPreviewLink(res.data.previewLink))
//       .catch(() => alert('Lấy preview báo cáo thất bại'));
//   };

//   const handleDownloadHoso = async mssv => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/download-ho-so/${mssv}`,
//         { responseType: 'blob' }
//       );
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `${mssv}_hoso.zip`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       console.error('Tải hồ sơ thất bại:', err);
//       alert('Không thể tải hồ sơ.');
//     }
//   };

//   const handleDownloadReportHoso = async mssv => {
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/download-ho-so/${mssv}`,
//         { responseType: 'blob' }
//       );
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', `${mssv}_hoso_baocao.zip`);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       console.error('Tải hồ sơ báo cáo thất bại:', err);
//       alert('Không thể tải hồ sơ báo cáo.');
//     }
//   };

//   const handleDownloadAllReportHoso = async () => {
//     const mssvs = filteredStudents.filter(sv => (reportFilesMap[sv.mssv] || []).length > 0).map(sv => sv.mssv);
//     try {
//       const response = await axios.get(
//         `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/download-ho-so-multiple?mssvs=${mssvs.join(',')}`,
//         { responseType: 'blob' }
//       );
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', 'hoso_baocao_all.zip');
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//     } catch (err) {
//       console.error('Tải toàn bộ hồ sơ báo cáo thất bại:', err);
//       alert('Không thể tải hồ sơ báo cáo.');
//     }
//   };

//   const handleDownloadAllHoso = async () => {
//   const mssvs = filteredStudents.filter(sv => (filesMap[sv.mssv] || []).length > 0).map(sv => sv.mssv);
//   try {
//     const response = await axios.get(
//       `${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/download-ho-so-multiple?mssvs=${mssvs.join(',')}`,
//       { responseType: 'blob' }
//     );
//     const url = window.URL.createObjectURL(new Blob([response.data]));
//     const link = document.createElement('a');
//     link.href = url;
//     link.setAttribute('download', 'hoso_all.zip');
//     document.body.appendChild(link);
//     link.click();
//     link.remove();
//   } catch (err) {
//     console.error('Tải toàn bộ hồ sơ thất bại:', err);
//     alert('Không thể tải hồ sơ.');
//   }
// };

// const handleDeleteStudent = async (mssv, maDotDKTN) => {
//   if (!window.confirm(`Bạn có chắc chắn muốn xóa sinh viên ${mssv}?`)) return;

//   try {
//     await axios.delete(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/delete/${mssv}/${maDotDKTN}`);
//     setStudents(prev => prev.filter(sv => sv.mssv !== mssv || sv.maDotDKTN !== maDotDKTN));
//   } catch (err) {
//     console.error('Lỗi xóa sinh viên:', err);
//     alert('Không thể xóa sinh viên.');
//   }
// };

// const handleFieldChange = async (sv, field, value) => {
//   const updated = { ...sv, [field]: value };

//   // Tự động set kết quả tốt nghiệp nếu điểm >= 5
//   if (field === 'diemTotNghiep') {
//     updated.ketQuaTotNghiep = parseFloat(value) >= 5;
//   }

//   const payload = {
//     mssv: updated.mssv,
//     maDotDKTN: updated.maDotDKTN,
//     maGiaoVien: updated.maGiaoVien || "NV0000000",
//     tenDeTaiTotNghiep: updated.tenDeTaiTotNghiep || null,
//     mucTieu: updated.mucTieu || null,
//     noiDungNghienCuu: updated.noiDungNghienCuu || null,
//     daNopThuyetMinh: updated.daNopThuyetMinh ?? null,
//     ngayNopThuyetMinh: updated.ngayNopThuyetMinh
//       ? new Date(updated.ngayNopThuyetMinh).toISOString()
//       : null,
//     linkThuyetMinh: updated.linkThuyetMinh || null,
//     ngayXetDuDieuKien: updated.ngayXetDuDieuKien ?? null,
//     quyetDinhDacCach: updated.quyetDinhDacCach || null,
//     hinhThucTotNghiep: updated.hinhThucTotNghiep || null,
//     ketQuaTotNghiep: updated.ketQuaTotNghiep ?? null,
//     diemTotNghiep: updated.diemTotNghiep ?? null,
//     dacCachTotNghiep: updated.dacCachTotNghiep ?? null,
//     maTrangThai: updated.maTrangThai ?? 1
//   };

//   try {
//     await axios.put(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/svdktn-updatebyCBQL`, payload);
//     setStudents(prev => prev.map(item => item.mssv === sv.mssv ? { ...item, ...updated } : item));
//   } catch (err) {
//     console.error('Lỗi cập nhật:', err);
//     alert('Không thể cập nhật thông tin.');
//   }
// };





//   return (
//     <div className="sv-xac-nhan-container">
//       <h2>DANH SÁCH SINH VIÊN ĐƯỢC BÁO CÁO</h2>
//       <div className="filters">
//         <input placeholder="Tìm mssv, họ tên, tên đề tài" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
//         <select value={dotTNFilter} onChange={e => setDotTNFilter(e.target.value)}>
//           <option value="">-- Đợt TN --</option>
//           {[...new Set(students.map(s => s.tenDotDKTN))].map(dot => <option key={dot} value={dot}>{dot}</option>)}
//         </select>
//         <select value={gvFilter} onChange={e => setGvFilter(e.target.value)}>
//           <option value="">-- GV Hướng dẫn --</option>
//           {[...new Set(students.map(s => s.hoTenGiaoVien))].map(gv => <option key={gv} value={gv}>{gv}</option>)}
//         </select>
//         <select value={hosoFilter} onChange={e => setHosoFilter(e.target.value)}>
//           <option value="">-- Tình trạng hồ sơ --</option>
//           <option value="nophoso">Đã nộp</option>
//           <option value="chuanophoso">Chưa nộp</option>
//         </select>
//         <button onClick={handleDownloadAllHoso}>Tải tất cả hồ sơ ĐK đã nộp</button>
//         <button onClick={handleDownloadAllReportHoso}>Tải tất cả hồ sơ BC đã nộp</button>
//         <button onClick={exportToExcel}>📄 Xuất Excel</button>
//         <button className="print-btn" onClick={() => window.print()}>In danh sách</button>

//       </div>
//       <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
//   <thead>
//     <tr>
//       <th>MSSV</th>
//       <th>Họ tên SV</th>
//       <th>Đợt TN</th>
//       <th>GV hướng dẫn</th>
//       <th>Tên đề tài</th>
//       <th>Mục tiêu</th>
//       <th>Nội dung NC</th>
//       <th>Tải file thuyết minh</th>
//       <th>File thuyết minh</th>
//       <th>Tải hồ sơ báo cáo</th>
//       <th>Hồ sơ báo cáo</th>
//       <th>Điểm TN</th>
//       <th>Kết Quả TN</th>
//       <th>Đặc Cách TN</th>
//       <th>Xóa</th>
//     </tr>
//   </thead>
//   <tbody>
//     {filteredStudents.map(sv => {
//       const regFiles = filesMap[sv.mssv] || [];
//       const repFiles = reportFilesMap[sv.mssv] || [];

//       return (
//         <React.Fragment key={sv.mssv}>
//           <tr>
//             <td>{sv.mssv}</td>
//             <td>{`${sv.hoSinhVien} ${sv.tenSinhVien}`}</td>
//             <td>{sv.tenDotDKTN}</td>
//             <td>{sv.hoTenGiaoVien}</td>
//             <td>{sv.tenDeTaiTotNghiep}</td>
//             <td>{sv.mucTieu}</td>
//             <td>{sv.noiDungNghienCuu}</td>
//             <td>
//               <button onClick={() => handleDownloadHoso(sv.mssv)}>Tải</button>
//             </td>
//             <td>
//               {regFiles.length > 0 ? (
//                 <span onClick={() => handleExpand(sv.mssv)} style={{ cursor: 'pointer', color: '#007bff' }}>
//                   Đã nộp ({regFiles.length})
//                 </span>
//               ) : (
//                 <span className="no-files">Chưa nộp</span>
//               )}
//             </td>
//             <td>
//               <button onClick={() => handleDownloadReportHoso(sv.mssv)}>Tải</button>
//             </td>
//             <td>
//               {repFiles.length > 0 ? (
//                 <span onClick={() => handleExpandRep(sv.mssv)} style={{ cursor: 'pointer', color: '#007bff' }}>
//                   Đã nộp ({repFiles.length})
//                 </span>
//               ) : (
//                 <span className="no-files">Chưa nộp</span>
//               )}
//             </td>
//             <td>
//               <input
//                 type="number"
//                 value={sv.diemTotNghiep}
//                 onChange={e => handleFieldChange(sv, 'diemTotNghiep', parseFloat(e.target.value))}
//                 style={{ width: 60 }}
//               />
//             </td>
//             <td>
//               <input
//                 type="checkbox"
//                 checked={sv.ketQuaTotNghiep}
//                 onChange={e => handleFieldChange(sv, 'ketQuaTotNghiep', e.target.checked)}
//               />
//             </td>
//             <td>
//               <input
//                 type="checkbox"
//                 checked={sv.dacCachTotNghiep}
//                 onChange={e => handleFieldChange(sv, 'dacCachTotNghiep', e.target.checked)}
//               />
//             </td>
//             <td>
//               <button
//                 style={{ backgroundColor: 'red', color: 'white', padding: '4px 8px', border: 'none', borderRadius: 4 }}
//                 onClick={() => handleDeleteStudent(sv.mssv, sv.maDotDKTN)}
//               >
//                 Xóa
//               </button>
//             </td>
//           </tr>

//           {expandedMssv === sv.mssv && regFiles.length > 0 && (
//             <tr>
//               <td colSpan={15} className="files-expanded">
//                 <ul className="file-list-inline">
//                   {regFiles.map(file => (
//                     <li key={file.id} onClick={() => handlePreviewInline(file.id)}>{file.name}</li>
//                   ))}
//                 </ul>
//               </td>
//             </tr>
//           )}

//           {expandedRepMssv === sv.mssv && repFiles.length > 0 && (
//             <tr>
//               <td colSpan={15} className="files-expanded">
//                 <ul className="file-list-inline">
//                   {repFiles.map(file => (
//                     <li key={file.id} onClick={() => handlePreviewReport(file.id)}>{file.name}</li>
//                   ))}
//                 </ul>
//               </td>
//             </tr>
//           )}
//         </React.Fragment>
//       );
//     })}
//   </tbody>
// </table>

// {previewLink && (
//   <div className="modal-overlay" onClick={() => setPreviewLink('')}>
//     <div className="modal-content" onClick={e => e.stopPropagation()}>
//       <button className="close-btn" onClick={() => setPreviewLink('')}>×</button>
//       <iframe src={previewLink} title="Preview" style={{ width: '100%', height: '90vh', border: 'none' }} />
//     </div>
//   </div>
// )}

// {reportPreviewLink && (
//   <div className="modal-overlay" onClick={() => setReportPreviewLink('')}>
//     <div className="modal-content" onClick={e => e.stopPropagation()}>
//       <button className="close-btn" onClick={() => setReportPreviewLink('')}>×</button>
//       <iframe src={reportPreviewLink} title="Preview báo cáo" style={{ width: '100%', height: '90vh', border: 'none' }} />
//     </div>
//   </div>
// )}

//     </div>
//   );
// }

// export default DanhSachSVDuocXacNhan;
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import './DanhSachSVDuocXacNhanBaoCao.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Import NotificationCard mới


function DanhSachSVDuocXacNhan() {
  const [students, setStudents] = useState([]);
  const [filesMap, setFilesMap] = useState({});
  const [reportFilesMap, setReportFilesMap] = useState({});
  const [expandedMssv, setExpandedMssv] = useState(null);
  const [expandedRepMssv, setExpandedRepMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState('');
  const [reportPreviewLink, setReportPreviewLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dotTNFilter, setDotTNFilter] = useState('');
  const [gvFilter, setGvFilter] = useState('');
  const [hosoFilter, setHosoFilter] = useState('');

  // States cho modal xác nhận xóa
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);

  // States cho Notification Card
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success'); // 'success' hoặc 'error'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/get-all`)
      .then(res => {
        const normalized = res.data
          .map(sv => ({
            ...sv,
            daNopThuyetMinh: sv.daNopThuyetMinh === 'True',
            duDieuKienBaoCao: sv.duDieuKienBaoCao === 'True',
            ketQuaTotNghiep: sv.ketQuaTotNghiep === 'True',
            dacCachTotNghiep: sv.dacCachTotNghiep === 'True',
            diemTotNghiep: parseFloat(sv.diemTotNghiep) || 0,
            maTrangThai: parseInt(sv.maTrangThai, 10) || 0
          }))
          .filter(sv => sv.maTrangThai === 1 && sv.duDieuKienBaoCao); // Chỉ lấy sinh viên được báo cáo
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
    'HS ĐK': (filesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    'HS BC': (reportFilesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    'Điểm TN': sv.diemTotNghiep,
    'Kết quả TN': sv.ketQuaTotNghiep ? '✔' : '',
    'Đặc cách TN': sv.dacCachTotNghiep ? '✔' : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DaXacNhan');

  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/octet-stream' });
  saveAs(blob, 'DanhSachSVDuocXacNhan.xlsx');
};


  useEffect(() => {
    if (!loading) {
      const fetchFiles = async () => {
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
        const [regResults, repResults] = await Promise.all([
          Promise.all(regReqs),
          Promise.all(repReqs)
        ]);
        const newFilesMap = {};
        regResults.forEach(({ mssv, files }) => {
          newFilesMap[mssv] = files;
        });
        setFilesMap(newFilesMap);

        const newRepMap = {};
        repResults.forEach(({ mssv, files }) => {
          newRepMap[mssv] = files;
        });
        setReportFilesMap(newRepMap);
      };
      fetchFiles();
    }
  }, [loading, students]);

  const filteredStudents = useMemo(() => {
    return students.filter(sv => {
      const fullName = `${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase();
      const tenDeTaiTotNghiep = `${sv.tenDeTaiTotNghiep}`.toLowerCase();

      const matchesSearch =
        sv.mssv.toLowerCase().includes(searchTerm.toLowerCase()) ||
        fullName.includes(searchTerm.toLowerCase()) || 
        tenDeTaiTotNghiep.includes(searchTerm.toLowerCase());
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

  const handleExpandRep = mssv => {
    setExpandedRepMssv(prev => (prev === mssv ? null : mssv));
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

  const handleDownloadAllReportHoso = async () => {
    const mssvs = filteredStudents.filter(sv => (reportFilesMap[sv.mssv] || []).length > 0).map(sv => sv.mssv);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoBaoCaoTotNghiep/download-ho-so-multiple?mssvs=${mssvs.join(',')}`,
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'hoso_baocao_all.zip');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Tải toàn bộ hồ sơ báo cáo thất bại:', err);
      alert('Không thể tải hồ sơ báo cáo.');
    }
  };

  const handleDownloadAllHoso = async () => {
  const mssvs = filteredStudents.filter(sv => (filesMap[sv.mssv] || []).length > 0).map(sv => sv.mssv);
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

// Hàm hiển thị modal xác nhận xóa
const handleDeleteStudent = (mssv, maDotDKTN) => {
  setStudentToDelete({ mssv, maDotDKTN });
  setShowDeleteConfirmModal(true);
};

// Hàm thực hiện xóa khi xác nhận
const confirmDeleteStudent = async () => {
  if (!studentToDelete) return;

  const { mssv, maDotDKTN } = studentToDelete;

  try {
    await axios.delete(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/delete/${mssv}/${maDotDKTN}`);
    setStudents(prev => prev.filter(sv => sv.mssv !== mssv || sv.maDotDKTN !== maDotDKTN));
    // Hiển thị thông báo thành công
    setNotificationType('success');
    setNotificationMessage('Xóa thành công!');
    setNotificationSubText(`Sinh viên ${mssv} đã được xóa.`);
    setShowNotification(true);
  } catch (err) {
    console.error('Lỗi xóa sinh viên:', err);
    // Hiển thị thông báo thất bại
    setNotificationType('error');
    setNotificationMessage('Xóa thất bại!');
    setNotificationSubText(`Không thể xóa sinh viên ${mssv}. Vui lòng thử lại.`);
    setShowNotification(true);
  } finally {
    setShowDeleteConfirmModal(false);
    setStudentToDelete(null);
    // Tự động ẩn thông báo sau vài giây
    setTimeout(() => {
      setShowNotification(false);
    }, 5000); // Ẩn sau 5 giây
  }
};

const handleFieldChange = async (sv, field, value) => {
  const updated = { ...sv, [field]: value };

  // Tự động set kết quả tốt nghiệp nếu điểm >= 5
  if (field === 'diemTotNghiep') {
    updated.ketQuaTotNghiep = parseFloat(value) >= 5;
  }

  const payload = {
    mssv: updated.mssv,
    maDotDKTN: updated.maDotDKTN,
    maGiaoVien: updated.maGiaoVien || "NV0000000",
    tenDeTaiTotNghiep: updated.tenDeTaiTotNghiep || null,
    mucTieu: updated.mucTieu || null,
    noiDungNghienCuu: updated.noiDungNghienCuu || null,
    daNopThuyetMinh: updated.daNopThuyetMinh ?? null,
    ngayNopThuyetMinh: updated.ngayNopThuyetMinh
      ? new Date(updated.ngayNopThuyetMinh).toISOString()
      : null,
    linkThuyetMinh: updated.linkThuyetMinh || null,
    ngayXetDuDieuKien: updated.ngayXetDuDieuKien ?? null,
    quyetDinhDacCach: updated.quyetDinhDacCach || null,
    hinhThucTotNghiep: updated.hinhThucTotNghiep || null,
    ketQuaTotNghiep: updated.ketQuaTotNghiep ?? null,
    diemTotNghiep: updated.diemTotNghiep ?? null,
    dacCachTotNghiep: updated.dacCachTotNghiep ?? null,
    maTrangThai: updated.maTrangThai ?? 1
  };

  try {
    await axios.put(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/svdktn-updatebyCBQL`, payload);
    setStudents(prev => prev.map(item => item.mssv === sv.mssv ? { ...item, ...updated } : item));
  } catch (err) {
    console.error('Lỗi cập nhật:', err);
    alert('Không thể cập nhật thông tin.');
  }
};


  return (
    <div className="sv-xac-nhan-container">
      <h2>DANH SÁCH SINH VIÊN ĐƯỢC BÁO CÁO</h2>
      <div className="filters">
        <input placeholder="Tìm mssv, họ tên, tên đề tài" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
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
        <button onClick={handleDownloadAllHoso}>Tải tất cả hồ sơ ĐK đã nộp</button>
        <button onClick={handleDownloadAllReportHoso}>Tải tất cả hồ sơ BC đã nộp</button>
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
      <th>Tải file thuyết minh</th>
      <th>File thuyết minh</th>
      <th>Tải hồ sơ báo cáo</th>
      <th>Hồ sơ báo cáo</th>
      <th>Điểm TN</th>
      <th>Kết Quả TN</th>
      <th>Đặc Cách TN</th>
      <th>Xóa</th>
    </tr>
  </thead>
  <tbody>
    {filteredStudents.map(sv => {
      const regFiles = filesMap[sv.mssv] || [];
      const repFiles = reportFilesMap[sv.mssv] || [];

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
            <td>
              <button onClick={() => handleDownloadHoso(sv.mssv)}>Tải</button>
            </td>
            <td>
              {regFiles.length > 0 ? (
                <span onClick={() => handleExpand(sv.mssv)} style={{ cursor: 'pointer', color: '#007bff' }}>
                  Đã nộp ({regFiles.length})
                </span>
              ) : (
                <span className="no-files">Chưa nộp</span>
              )}
            </td>
            <td>
              <button onClick={() => handleDownloadReportHoso(sv.mssv)}>Tải</button>
            </td>
            <td>
              {repFiles.length > 0 ? (
                <span onClick={() => handleExpandRep(sv.mssv)} style={{ cursor: 'pointer', color: '#007bff' }}>
                  Đã nộp ({repFiles.length})
                </span>
              ) : (
                <span className="no-files">Chưa nộp</span>
              )}
            </td>
            <td>
              <input
                type="number"
                value={sv.diemTotNghiep}
                onChange={e => handleFieldChange(sv, 'diemTotNghiep', parseFloat(e.target.value))}
                style={{ width: 60 }}
              />
            </td>
            <td>
              <input
                type="checkbox"
                checked={sv.ketQuaTotNghiep}
                onChange={e => handleFieldChange(sv, 'ketQuaTotNghiep', e.target.checked)}
              />
            </td>
            <td>
              <input
                type="checkbox"
                checked={sv.dacCachTotNghiep}
                onChange={e => handleFieldChange(sv, 'dacCachTotNghiep', e.target.checked)}
              />
            </td>
            <td>
              <button
                style={{ backgroundColor: 'red', color: 'white', padding: '4px 8px', border: 'none', borderRadius: 4 }}
                onClick={() => handleDeleteStudent(sv.mssv, sv.maDotDKTN)}
              >
                Xóa
              </button>
            </td>
          </tr>

          {expandedMssv === sv.mssv && regFiles.length > 0 && (
            <tr>
              <td colSpan={15} className="files-expanded">
                <ul className="file-list-inline">
                  {regFiles.map(file => (
                    <li key={file.id} onClick={() => handlePreviewInline(file.id)}>{file.name}</li>
                  ))}
                </ul>
              </td>
            </tr>
          )}

          {expandedRepMssv === sv.mssv && repFiles.length > 0 && (
            <tr>
              <td colSpan={15} className="files-expanded">
                <ul className="file-list-inline">
                  {repFiles.map(file => (
                    <li key={file.id} onClick={() => handlePreviewReport(file.id)}>{file.name}</li>
                  ))}
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

{reportPreviewLink && (
  <div className="modal-overlay" onClick={() => setReportPreviewLink('')}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <button className="close-btn" onClick={() => setReportPreviewLink('')}>×</button>
      <iframe src={reportPreviewLink} title="Preview báo cáo" style={{ width: '100%', height: '90vh', border: 'none' }} />
    </div>
  </div>
)}

{/* Modal xác nhận xóa */}
{showDeleteConfirmModal && studentToDelete && (
  <div className="modal-overlay" onClick={() => setShowDeleteConfirmModal(false)}>
    <div className="modal-content" onClick={e => e.stopPropagation()}>
      <h3>Xác nhận xóa sinh viên</h3>
      <p>Bạn có chắc chắn muốn xóa sinh viên **{studentToDelete.mssv}**?</p>
      <div className="modal-actions">
        <button className="btn-cancel" onClick={() => setShowDeleteConfirmModal(false)}>Hủy</button>
        <button className="btn-confirm-delete" onClick={confirmDeleteStudent}>Xóa</button>
      </div>
    </div>
  </div>
)}

{/* Notification Card */}
{showNotification && (
  <NotificationCard
    type={notificationType}
    message={notificationMessage}
    subText={notificationSubText}
    onClose={() => setShowNotification(false)}
  />
)}

    </div>
  );
}

export default DanhSachSVDuocXacNhan;