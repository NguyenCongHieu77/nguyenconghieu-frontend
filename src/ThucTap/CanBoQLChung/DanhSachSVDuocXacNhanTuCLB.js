import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import { saveAs } from 'file-saver';
import './DanhSachSVDuocXacNhanTuCLB.css';

function DanhSachSVDuocXacNhanTuCLB() {
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [dsHoSo, setDsHoSo] = useState([]);
  const [dsFilesMap, setDsFilesMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDotThucTap, setFilterDotThucTap] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');

  const [expandedMssv, setExpandedMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState('');

  const apiChiTiet = 'http://localhost:5225/api/ChiTietThucTap';
  const apiHoSo = 'http://localhost:5225/api/ChiTietHoSoThucTapBanDau';
  const apiUpsertGV = 'http://localhost:5225/api/ChiTietThucTap/gv-upsert';

  // Load dữ liệu chi tiết và hồ sơ ban đầu
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

  // Load danh sách files cho mỗi MSSV
  useEffect(() => {
    if (!loading) {
      dsHoSo.forEach(hs => {
        axios.get(`${apiHoSo}/list-files/${hs.mssv}`)
          .then(res => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: res.data })))
          .catch(() => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: [] })));
      });
    }
  }, [loading, dsHoSo]);

  // Ghép dữ liệu chi tiết + hồ sơ
  const merged = dsChiTiet.map(ct => {
    const hs = dsHoSo.find(h => h.mssv === ct.mssv && h.maDotThucTap === ct.maDotThucTap) || {};
    return { ...ct, ...hs };
  });

  // Áp dụng search + filter
  const filtered = merged
    .filter(i => i.tenTinhTrang === 'Đang thực tập')
    .filter(i => (
      `${i.hoSinhVien || ''} ${i.tenSinhVien || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.mssv.includes(searchTerm)
    ))
    .filter(i => !filterDotThucTap || i.tenDotThucTap === filterDotThucTap)
    .filter(i => !filterDonVi || i.tenDonViThucTap === filterDonVi);

  const getUnique = field => [...new Set(merged.map(x => x[field]).filter(Boolean))];

  // Approve (Đã xác nhận)
  const handleApprove = async item => {
    try {
      await axios.put(apiUpsertGV, {
        MSSV: item.mssv,
        MaDotThucTap: item.maDotThucTap,
        TinhTrangXacNhan: 'Đã xác nhận'
      });
      alert('Đã xác nhận thành công');
    } catch (e) {
      console.error('Lỗi khi xác nhận:', e);
      alert('Xác nhận thất bại');
    }
  };

  // Reject (Bị từ chối)
  const handleReject = async item => {
    try {
      await axios.put(apiUpsertGV, {
        MSSV: item.mssv,
        MaDotThucTap: item.maDotThucTap,
        TinhTrangXacNhan: 'Bị từ chối'
      });
      alert('Đã từ chối thành công');
    } catch (e) {
      console.error('Lỗi khi từ chối:', e);
      alert('Từ chối thất bại');
    }
  };

  // Download hồ sơ ban đầu
  const handleDownload = async mssv => {
    try {
      const res = await axios.get(`${apiHoSo}/download-ho-so/${mssv}`, { responseType: 'blob' });
      saveAs(res.data, `${mssv}_HoSoBanDau.zip`);
    } catch {
      alert('Tải HS thất bại');
    }
  };

  // Expand/collapse files list
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
      <h2>SV Được Xác Nhận Từ CLB</h2>

      {/* Search & Filters */}
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
        </div>
        <span className="total-count">Tổng: {filtered.length}</span>
        <button onClick={() => filtered.forEach(sv => handleDownload(sv.mssv))}>Tải tất cả HS</button>
      </div>

      {/* Table */}
      <table border="1" cellPadding="8" style={{ width:'100%', borderCollapse:'collapse' }}>
        <thead>
          <tr>
            <th>MSSV</th><th>Họ tên</th><th>Đợt</th><th>Đơn vị</th><th>HS ban đầu</th><th>Files</th><th>Xác nhận</th>
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
                      <span onClick={() => handleExpand(item.mssv)} style={{cursor:'pointer'}}>
                        Files ({files.length})
                      </span>
                    ) : (
                      <span className="no-files">Sinh viên chưa nộp hồ sơ</span>
                    )}
                  </td>
                  <td>
                    <button onClick={() => handleApprove(item)}>Đã xác nhận</button>
                    <button onClick={() => handleReject(item)} style={{ marginLeft: '8px' }}>Bị từ chối</button>
                  </td>
                </tr>
                {files.length > 0 && expandedMssv === item.mssv && (
                  <tr><td colSpan="7" className="files-expanded">
                    <ul className="file-list-inline">
                      {files.map(file => (
                        <li key={file.id} onClick={() => handlePreviewInline(file.id)}>{file.name}</li>
                      ))}
                    </ul>
                  </td></tr>
                )}
              </React.Fragment>
            );
          })}
          {filtered.length === 0 && (
            <tr><td colSpan="7" style={{ textAlign:'center' }}>Không có kết quả</td></tr>
          )}
        </tbody>
      </table>

      {/* Modal preview inline */}
      {previewLink && (
        <div className="modal-overlay" onClick={() => setPreviewLink('')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPreviewLink('')}>×</button>
            <iframe src={previewLink} title="Preview" style={{ width:'100%',height:'90vh',border:'none' }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DanhSachSVDuocXacNhanTuCLB;
