import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import './DanhSachSVDuocXacNhanTuCLB.css';
import * as XLSX from 'xlsx';


function DanhSachSVDuocXacNhanTuCLB() {
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [dsHoSo, setDsHoSo] = useState([]);
  const [dsFilesMap, setDsFilesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDotThucTap, setFilterDotThucTap] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');
  const [filterXacNhan, setFilterXacNhan] = useState('');
  const [filterHasFiles, setFilterHasFiles] = useState(''); // Lọc HS đăng ký
  const [expandedMssv, setExpandedMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState('');

  const apiChiTiet = 'http://118.69.126.49:5225/api/ChiTietThucTap';
  const apiHoSo = 'http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau';
  const apiUpsertGV = 'http://118.69.126.49:5225/api/ChiTietThucTap/gv-upsert';

  const booleanFields = [
    { label: 'Đơn đăng ký DVTT', stateKey: 'xacNhanCBQLDaNopDonDangKyDonViThucTap', apiKey: 'xacNhanCBQLDonDangKyDonViThucTap' },
    { label: 'Giấy tiếp nhận', stateKey: 'xacNhanCBQLDaNopGiayTiepNhanSVThucTap', apiKey: 'xacNhanCBQLGiayTiepNhanSVThucTap' },
    { label: 'Cam kết DVTT', stateKey: 'xacNhanCBQLDaNopDonCamKetTuTimDVTT', apiKey: 'xacNhanCBQLDonCamKetTuTimDVTT' }
  ];

  // tải dữ liệu
  useEffect(() => {
    Promise.all([
      axios.get(`${apiChiTiet}/get-all`),
      axios.get(`${apiHoSo}/get-all-ho-so-ban-dau`)
    ])
      .then(([resChiTiet, resHoSo]) => {
        setDsChiTiet(resChiTiet.data);
        setDsHoSo(resHoSo.data);
      })
      .catch(err => console.error('Lỗi khi tải dữ liệu:', err))
      .finally(() => setLoading(false));
  }, []);

  const exportToExcel = () => {
  const data = filtered.map(item => ({
    MSSV: item.mssv,
    'Họ tên': `${item.hoSinhVien} ${item.tenSinhVien}`,
    'Đợt thực tập': item.tenDotThucTap,
    'Đơn vị': item.tenDonViThucTap,
    'Trạng thái xác nhận': item.tinhTrangXacNhan,
    'Nộp đơn đăng ký DVTT': item.xacNhanCBQLDaNopDonDangKyDonViThucTap ? '✔' : '',
    'Nộp giấy tiếp nhận': item.xacNhanCBQLDaNopGiayTiepNhanSVThucTap ? '✔' : '',
    'Nộp cam kết tự tìm': item.xacNhanCBQLDaNopDonCamKetTuTimDVTT ? '✔' : '',
    'Số file đã nộp': (dsFilesMap[item.mssv] || []).length,
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachSV');

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
  saveAs(blob, 'DanhSachSinhVienThucTap.xlsx');
};


  // tải files cho mỗi sinh viên
  useEffect(() => {
    if (!loading) {
      dsHoSo.forEach(hs => {
        axios.get(`${apiHoSo}/list-files/${hs.mssv}`)
          .then(res => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: res.data })))
          .catch(() => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: [] })));
      });
    }
  }, [loading, dsHoSo]);

  // ghép chi tiết + hồ sơ
  const merged = dsChiTiet.map(ct => {
    const hs = dsHoSo.find(h => h.mssv === ct.mssv && h.maDotThucTap === ct.maDotThucTap) || {};
    return { ...ct, ...hs };
  });

  // search + filter
  const filtered = merged
    .filter(i => i.tenTinhTrang === 'Đang thực tập')
    .filter(i => (
      `${i.hoSinhVien || ''} ${i.tenSinhVien || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.mssv.includes(searchTerm)
    ))
    .filter(i => !filterDotThucTap || i.tenDotThucTap === filterDotThucTap)
    .filter(i => !filterDonVi || i.tenDonViThucTap === filterDonVi)
    .filter(i => !filterXacNhan || i.tinhTrangXacNhan === filterXacNhan)
    .filter(i => {
      if (filterHasFiles === 'has') return (dsFilesMap[i.mssv] || []).length > 0;
      if (filterHasFiles === 'none') return (dsFilesMap[i.mssv] || []).length === 0;
      return true;
    });

  const getUnique = field => [...new Set(merged.map(x => x[field]).filter(Boolean))];

  // cập nhật trạng thái trên UI
  const updateTinhTrang = (mssv, maDot, newStatus) => {
    setDsChiTiet(prev => prev.map(ct => (
      ct.mssv === mssv && ct.maDotThucTap === maDot
        ? { ...ct, tinhTrangXacNhan: newStatus }
        : ct
    )));
  };

  const handleApprove = async item => {
    try {
      await axios.put(apiUpsertGV, {
        mssv: item.mssv,
        maDotThucTap: item.maDotThucTap,
        tinhTrangXacNhan: 'Đã xác nhận'
      });
      updateTinhTrang(item.mssv, item.maDotThucTap, 'Đã xác nhận');
    } catch (e) {
      console.error('Lỗi xác nhận:', e);
      alert('Xác nhận thất bại');
    }
  };

  // Từ chối 1
  const handleReject = async item => {
    try {
      await axios.put(apiUpsertGV, {
        mssv: item.mssv,
        maDotThucTap: item.maDotThucTap,
        tinhTrangXacNhan: 'Bị từ chối'
      });
      updateTinhTrang(item.mssv, item.maDotThucTap, 'Bị từ chối');
    } catch (e) {
      console.error('Lỗi từ chối:', e);
      alert('Từ chối thất bại');
    }
  };

  // Xác nhận tất cả
  const handleApproveAll = () => {
    filtered.forEach(item => handleApprove(item));
  };

  // Từ chối tất cả
  const handleRejectAll = () => {
    filtered.forEach(item => handleReject(item));
  };

  // Xóa tất cả đã từ chối
  const handleDeleteRejected = async () => {
    const toDelete = dsChiTiet.filter(ct => ct.tinhTrangXacNhan === 'Bị từ chối');
    for (const item of toDelete) {
      try {
        await axios.delete(`${apiChiTiet}/delete/${item.mssv}/${item.maDotThucTap}`);
        setDsChiTiet(prev => prev.filter(ct => !(ct.mssv === item.mssv && ct.maDotThucTap === item.maDotThucTap)));
        setDsHoSo(prev => prev.filter(hs => !(hs.mssv === item.mssv && hs.maDotThucTap === item.maDotThucTap)));
      } catch (e) {
        console.error('Lỗi xóa:', e);
        alert(`Xóa ${item.mssv} thất bại`);
      }
    }
  };

  // Download 1 hồ sơ ban đầu
  const handleDownload = async mssv => {
    try {
      const res = await axios.get(`${apiHoSo}/download-ho-so/${mssv}`, { responseType: 'blob' });
      saveAs(res.data, `${mssv}_HoSoBanDau.zip`);
    } catch {
      alert(`Tải HS của ${mssv} thất bại`);
    }
  };

  // Download tất cả có file
  const handleDownloadAll = () => {
    filtered
      .filter(item => (dsFilesMap[item.mssv] || []).length > 0)
      .forEach(item => handleDownload(item.mssv));
  };

  // Toggle checkbox hồ sơ
  const handleToggle = async (item, field) => {
  const newValue = !item[field.stateKey];

  // Tạo bản sao đầy đủ của trạng thái hiện tại để gửi đúng payload
  const body = {
    mssv: item.mssv,
    maDotThucTap: item.maDotThucTap,
    xacNhanCBQLDonDangKyDonViThucTap: item.xacNhanCBQLDaNopDonDangKyDonViThucTap,
    xacNhanCBQLGiayTiepNhanSVThucTap: item.xacNhanCBQLDaNopGiayTiepNhanSVThucTap,
    xacNhanCBQLDonCamKetTuTimDVTT: item.xacNhanCBQLDaNopDonCamKetTuTimDVTT,
  };

  // Ghi đè field bị toggle
  switch (field.apiKey) {
    case 'xacNhanCBQLDonDangKyDonViThucTap':
      body.xacNhanCBQLDonDangKyDonViThucTap = newValue;
      break;
    case 'xacNhanCBQLGiayTiepNhanSVThucTap':
      body.xacNhanCBQLGiayTiepNhanSVThucTap = newValue;
      break;
    case 'xacNhanCBQLDonCamKetTuTimDVTT':
      body.xacNhanCBQLDonCamKetTuTimDVTT = newValue;
      break;
    default:
      break;
  }

  try {
    await axios.put(
      'http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau/cap-nhat-tinh-trang-ho-so-ban-dau-byCBQL',
      body
    );
    setDsHoSo(prev =>
      prev.map(hs =>
        hs.mssv === item.mssv && hs.maDotThucTap === item.maDotThucTap
          ? { ...hs, [field.stateKey]: newValue }
          : hs
      )
    );
  } catch (e) {
    console.error('❌ Lỗi cập nhật hồ sơ:', e);
    alert('Cập nhật thất bại');
  }
};



  // Expand / collapse danh sách file
  const handleExpand = mssv => setExpandedMssv(prev => prev === mssv ? null : mssv);

  // Preview inline
  const handlePreviewInline = async id => {
    try {
      const res = await axios.get(`${apiHoSo}/preview/${id}`);
      setPreviewLink(res.data.previewLink);
    } catch {
      alert('Lấy preview thất bại');
    }
  };

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="sv-xac-nhan-container">
      <h2>DANH SÁCH SINH VIÊN GỬI ĐĂNG KÝ THỰC TẬP</h2>

      {/* Search, filters, và các nút thao tác */}
      <div className="search-bar">
        <div className="search-input">
          <FaSearch />
          <input
            placeholder="Tìm MSSV hoặc Họ tên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select value={filterDotThucTap} onChange={e => setFilterDotThucTap(e.target.value)}>
            <option value="">Tất cả đợt</option>
            {getUnique('tenDotThucTap').map((v,i) => <option key={i} value={v}>{v}</option>)}
          </select>
          <select value={filterDonVi} onChange={e => setFilterDonVi(e.target.value)}>
            <option value="">Tất cả đơn vị</option>
            {getUnique('tenDonViThucTap').map((v,i) => <option key={i} value={v}>{v}</option>)}
          </select>
          <select value={filterXacNhan} onChange={e => setFilterXacNhan(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="Đã xác nhận">Đã xác nhận</option>
            <option value="Bị từ chối">Bị từ chối</option>
          </select>
          {/* Filter for registration dossier */}
          <select value={filterHasFiles} onChange={e => setFilterHasFiles(e.target.value)}>
            <option value="">Tất cả HS đăng ký</option>
            <option value="has">Đã nộp</option>
            <option value="none">Chưa nộp</option>
          </select>
        </div>
        <span className="total-count">Tổng: {filtered.length}</span>
        <button onClick={handleDownloadAll}>Tải tất cả HS</button>
        <button onClick={handleApproveAll} style={{ marginLeft: '8px' }}>Xác nhận tất cả</button>
        <button onClick={handleRejectAll} style={{ marginLeft: '8px' }}>Bị từ chối tất cả</button>
        <button onClick={handleDeleteRejected} style={{ marginLeft: '8px' }}>Xóa tất cả Bị từ chối</button>
        <button onClick={exportToExcel} style={{ marginLeft: '8px' }}>📄 Xuất Excel</button>
        <button className="print-btn" onClick={() => window.print()}>In danh sách</button>

      </div>

      {/* Bảng dữ liệu */}
      <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Đợt</th>
            <th>Đơn vị</th>
            <th>HS ban đầu</th>
            <th>Hồ sơ đăng ký</th>
            {booleanFields.map((f, idx) => <th key={idx}>{f.label}</th>)}
            <th>Tình trạng</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(item => {
            const files = dsFilesMap[item.mssv] || [];
            return (
              <React.Fragment key={`${item.mssv}-${item.maDotThucTap}`}>
                <tr>
                  <td>{item.mssv}</td>
                  <td>{item.hoSinhVien} {item.tenSinhVien}</td>
                  <td>{item.tenDotThucTap}</td>
                  <td>{item.tenDonViThucTap}</td>
                  <td><button onClick={() => handleDownload(item.mssv)}>📥</button></td>
                  <td className="files-cell">
                    {files.length > 0 ? (
                      <span onClick={() => handleExpand(item.mssv)} style={{ cursor: 'pointer' }}>
                        Đã nộp hồ sơ ({files.length})
                      </span>
                    ) : (
                      <span className="no-files">Sinh viên chưa nộp hồ sơ</span>
                    )}
                  </td>
                  {booleanFields.map((f, idx) => (
                    <td key={idx} style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={!!item[f.stateKey]}
                        onChange={() => handleToggle(item, f)}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      onClick={() => handleApprove(item)}
                      style={{
                        backgroundColor: item.tinhTrangXacNhan === 'Đã xác nhận' ? 'green' : undefined,
                        color: item.tinhTrangXacNhan === 'Đã xác nhận' ? '#fff' : undefined
                      }}
                    >
                      Đã xác nhận
                    </button>
                    <button
                      onClick={() => handleReject(item)}
                      style={{
                        marginLeft: '8px',
                        backgroundColor: item.tinhTrangXacNhan === 'Bị từ chối' ? 'red' : undefined,
                        color: item.tinhTrangXacNhan === 'Bị từ chối' ? '#fff' : undefined
                      }}
                    >
                      Bị từ chối
                    </button>
                  </td>
                </tr>
                {files.length > 0 && expandedMssv === item.mssv && (
                  <tr>
                    <td colSpan={7 + booleanFields.length + 1} className="files-expanded">
                      <ul className="file-list-inline">
                        {files.map(file => (
                          <li key={file.id} onClick={() => handlePreviewInline(file.id)}>{file.name}</li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7 + booleanFields.length + 1} style={{ textAlign: 'center' }}>
                Không có kết quả
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal xem trước inline */}
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

export default DanhSachSVDuocXacNhanTuCLB;
