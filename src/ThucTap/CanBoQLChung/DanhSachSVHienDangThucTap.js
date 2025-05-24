

import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { saveAs } from "file-saver";
import './DanhSachSVHienDangThucTap.css';
import * as XLSX from "xlsx";


function DanhSachSVHienDangThucTap() {
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [dsHoSo, setDsHoSo] = useState([]);
  const [dsKetThuc, setDsKetThuc] = useState([]);
  const [dsFilesMap, setDsFilesMap] = useState({});
  const [dsFilesKetThucMap, setDsFilesKetThucMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDotThucTap, setFilterDotThucTap] = useState("");
  const [filterDonVi, setFilterDonVi] = useState("");
  const [filterDK, setFilterDK] = useState("");
  const [filterKT, setFilterKT] = useState("");
  const [expandedMssv, setExpandedMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState("");

  const apiChiTiet = `${process.env.REACT_APP_API_URL}/api/ChiTietThucTap`;
  const apiHoSo = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapBanDau`;
  const apiKetThuc = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapKetThuc`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietThucTap/get-all`);
        setDsChiTiet(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      }
    };
    fetchData();

    Promise.all([
      axios.get(`${apiChiTiet}/get-all`),
      axios.get(`${apiHoSo}/get-all-ho-so-ban-dau`),
      axios.get(`${apiKetThuc}/get-all-ho-so-ket-thuc`)
    ])
      .then(([resCT, resHS, resKT]) => {
        setDsChiTiet(resCT.data);
        setDsHoSo(resHS.data);
        setDsKetThuc(resKT.data);
      })
      .catch(err => console.error("Lỗi khi tải dữ liệu:", err))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      dsHoSo.forEach(hs => {
        axios.get(`${apiHoSo}/list-files/${hs.mssv}`)
          .then(res => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: res.data })))
          .catch(() => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: [] })));
      });
      dsKetThuc.forEach(kt => {
        axios.get(`${apiKetThuc}/list-files/${kt.mssv}`)
          .then(res => setDsFilesKetThucMap(prev => ({ ...prev, [kt.mssv]: res.data })))
          .catch(() => setDsFilesKetThucMap(prev => ({ ...prev, [kt.mssv]: [] })));
      });
    }
  }, [loading, dsHoSo, dsKetThuc]);

  const merged = dsChiTiet.map(ct => {
    const hs = dsHoSo.find(h => h.mssv === ct.mssv && h.maDotThucTap === ct.maDotThucTap) || {};
    const kt = dsKetThuc.find(k => k.mssv === ct.mssv && k.maDotThucTap === ct.maDotThucTap) || {};
    return { ...ct, ...hs, ...kt };
  });

  const exportToExcel = () => {
  const data = filtered.map(item => ({
    MSSV: item.mssv,
    'Họ tên': `${item.hoSinhVien} ${item.tenSinhVien}`,
    'Đợt': item.tenDotThucTap,
    'Đơn vị': item.tenDonViThucTap,
    'HS ĐK': (dsFilesMap[item.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    'HS KT': (dsFilesKetThucMap[item.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
    'Sổ nhật ký': item.xacNhanCBQLDaNopSoNhatKyThucTap ? '✔' : '',
    'Giấy tiếp nhận SV': item.xacNhanCBQLDaNopGiayTiepNhanSVThucTap ? '✔' : '',
    'Nhận xét ĐVTT': item.xacNhanCBQLDaNopPhieuNhanXetCuaDVTT ? '✔' : '',
    'Nhận xét NSHD': item.xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap ? '✔' : '',
    'Cam kết TT': item.xacNhanCBQLDaNopDonCamKetTuTimDVTT ? '✔' : '',
    'Báo cáo': item.xacNhanCBQLDaNopCuonBaoCao ? '✔' : '',
    'HĐ Lao động': item.xacNhanCBQLDaNopHopDongLaoDong ? '✔' : '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'SinhVienTT');

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
  saveAs(blob, "DanhSachSinhVienDangThucTap.xlsx");
};


  const filtered = merged
    .filter(item => !!item.tinhTrangXacNhan)
    .filter(item => {
      const fullName = `${item.hoSinhVien || ""} ${item.tenSinhVien || ""}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || item.mssv.includes(searchTerm);
    })
    .filter(item => !filterDotThucTap || item.tenDotThucTap === filterDotThucTap)
    .filter(item => !filterDonVi || item.tenDonViThucTap === filterDonVi)
    .filter(item => {
      if (filterDK === "yes") return (dsFilesMap[item.mssv] || []).length > 0;
      if (filterDK === "no") return (dsFilesMap[item.mssv] || []).length === 0;
      return true;
    })
    .filter(item => {
      if (filterKT === "yes") return (dsFilesKetThucMap[item.mssv] || []).length > 0;
      if (filterKT === "no") return (dsFilesKetThucMap[item.mssv] || []).length === 0;
      return true;
    })
.filter(item => !(item.xacNhanChoBaoCao === true || item.xacNhanChoBaoCao === "True" || item.xacNhanChoBaoCao === "true"))

  const getUnique = field => [...new Set(merged.map(x => x[field]).filter(Boolean))];

  const downloadInitial = async mssv => {
    try {
      const response = await axios.get(`${apiHoSo}/download-ho-so/${mssv}`, {
        responseType: "blob",
      });
      saveAs(new Blob([response.data]), `${mssv}_HoSoBanDau.zip`);
    } catch (error) {
      alert(`Tải HS của ${mssv} thất bại`);
    }
  };

  const downloadKetThuc = async mssv => {
    try {
      const response = await axios.get(`${apiKetThuc}/download-ho-so/${mssv}`, {
        responseType: "blob",
      });
      saveAs(new Blob([response.data]), `${mssv}_HoSoKetThuc.zip`);
    } catch (error) {
      alert(`Tải HS kết thúc của ${mssv} thất bại`);
    }
  };

  const downloadAllInitial = () => {
    filtered
      .filter(item => (dsFilesMap[item.mssv] || []).length > 0)
      .forEach(item => downloadInitial(item.mssv));
  };

  const downloadAllKetThuc = () => {
    const mssvs = filtered
      .filter(item => (dsFilesKetThucMap[item.mssv] || []).length > 0)
      .map(i => i.mssv);
    axios.post(`${apiKetThuc}/download-ho-so-multiple`, mssvs, { responseType: "blob" })
      .then(res => saveAs(new Blob([res.data]), `HoSoKetThuc_All.zip`))
      .catch(() => alert("Tải tất cả HS kết thúc thất bại"));
  };

  const handleXacNhanBaoCao = async (item, status) => {
  const payload = {
    mssv: item.mssv,
    maDotThucTap: item.maDotThucTap,
    ngayBatDau: item.ngayBatDau || new Date().toISOString(),
    ngayKetThuc: item.ngayKetThuc || new Date().toISOString(),
    lanThucTap: parseInt(item.lanThucTap) || 1,
    maDonViThucTap: parseInt(item.maDonViThucTap) || 1,
    maGiaoVien: item.maGiaoVien || "",
    hoSoThucTap: item.hoSoThucTap || "",
    hoSoDaNop: item.hoSoDaNop || "",
    xacNhanChoBaoCao: status,
    ketQuaBaoCao: item.ketQuaBaoCao === true || item.ketQuaBaoCao === "True", // ép về boolean
    diemBaoCao: parseFloat(item.diemBaoCao) || 0,
    maTinhTrangThucTap: parseInt(item.maTinhTrangThucTap) || 1,
    tinhTrangXacNhan: item.tinhTrangXacNhan || "",
    ghiChu: item.ghiChu || ""
  };

  console.log("Payload gửi:", payload); // debug

  try {
    await axios.put(`${apiChiTiet}/gv-upsert`, payload);
    setDsChiTiet(prev =>
      prev.map(sv =>
        sv.mssv === item.mssv && sv.maDotThucTap === item.maDotThucTap
          ? { ...sv, xacNhanChoBaoCao: status }
          : sv
      )
    );
    alert(`Đã ${status ? "xác nhận" : "từ chối"} báo cáo cho ${item.mssv}`);
  } catch (err) {
    console.error("Lỗi API:", err.response?.data || err.message);
    alert("Cập nhật xác nhận báo cáo thất bại.");
  }
};




  const handleExpand = mssv => setExpandedMssv(prev => (prev === mssv ? null : mssv));

  const handlePreviewInline = async (id, isKetThuc = false) => {
    try {
      const res = await axios.get(`${isKetThuc ? apiKetThuc : apiHoSo}/preview/${id}`);
      setPreviewLink(res.data.previewLink);
    } catch {
      alert("Lấy preview thất bại");
    }
  };

  const deleteSinhVien = async (mssv, maDotThucTap) => {
  if (!window.confirm(`Bạn có chắc chắn muốn xóa sinh viên ${mssv} khỏi đợt ${maDotThucTap}?`)) return;

  try {
    await axios.delete(`${apiChiTiet}/delete/${mssv}/${maDotThucTap}`);
    setDsChiTiet(prev => prev.filter(item => !(item.mssv === mssv && item.maDotThucTap === maDotThucTap)));
    alert("Xóa thành công!");
  } catch (error) {
    alert("Xóa thất bại. Vui lòng thử lại.");
  }
};




  const handleCheckboxChange = (item, field) => {
    const newValue = !item[field];
    const record =
    dsKetThuc.find(
      k => k.mssv === item.mssv && k.maDotThucTap === item.maDotThucTap
    ) || {};
    const payload = {
    mssv: item.mssv,
    maDotThucTap: item.maDotThucTap,
    xacNhanCBQLDaNopSoNhatKyThucTap:
      field === "xacNhanCBQLDaNopSoNhatKyThucTap"
        ? newValue
        : !!record.xacNhanCBQLDaNopSoNhatKyThucTap,
    xacNhanCBQLDaNopGiayTiepNhanSVThucTap:
      field === "xacNhanCBQLDaNopGiayTiepNhanSVThucTap"
        ? newValue
        : !!record.xacNhanCBQLDaNopGiayTiepNhanSVThucTap,
    xacNhanCBQLDaNopPhieuNhanXetCuaDVTT:
      field === "xacNhanCBQLDaNopPhieuNhanXetCuaDVTT"
        ? newValue
        : !!record.xacNhanCBQLDaNopPhieuNhanXetCuaDVTT,
    xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap:
      field === "xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap"
        ? newValue
        : !!record.xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap,
    // Đây là trường Đơn cam kết
    xacNhanCBQLDaNopDonCamKetTuTimDVTT:
      field === "xacNhanCBQLDaNopDonCamKetTuTimDVTT"
        ? newValue
        : !!record.xacNhanCBQLDaNopDonCamKetTuTimDVTT,
    xacNhanCBQLDaNopCuonBaoCao:
      field === "xacNhanCBQLDaNopCuonBaoCao"
        ? newValue
        : !!record.xacNhanCBQLDaNopCuonBaoCao,
    xacNhanCBQLDaNopHopDongLaoDong:
      field === "xacNhanCBQLDaNopHopDongLaoDong"
        ? newValue
        : !!record.xacNhanCBQLDaNopHopDongLaoDong,
  };
    console.log("→ Payload gửi lên API:", payload);
  axios
    .put(`${apiKetThuc}/cap-nhat-tinh-trang-ho-so-ket-thuc-byCBQL`, payload)
    .then(() => {
      setDsKetThuc(prev =>
        prev.map(k =>
          k.mssv === item.mssv && k.maDotThucTap === item.maDotThucTap
            ? { ...k, [field]: newValue }
            : k
        )
      );
    })
    .catch(err => {
      console.error("Lỗi khi cập nhật:", err.response?.data || err.message);
      alert("Cập nhật thất bại");
    });
};

  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="danh-sach-container">
      <h2>DANH SÁCH SINH VIÊN ĐÃ XÁC NHẬN</h2>
      <div className="search-bar">
        <div className="search-input">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm MSSV hoặc Họ tên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters">
          <select value={filterDotThucTap} onChange={e => setFilterDotThucTap(e.target.value)}>
            <option value="">Tất cả đợt</option>
            {getUnique("tenDotThucTap").map((v, i) => <option key={i} value={v}>{v}</option>)}
          </select>
          <select value={filterDonVi} onChange={e => setFilterDonVi(e.target.value)}>
            <option value="">Tất cả đơn vị</option>
            {getUnique("tenDonViThucTap").map((v, i) => <option key={i} value={v}>{v}</option>)}
          </select>
          <select value={filterDK} onChange={e => setFilterDK(e.target.value)}>
            <option value="">HS ĐK: Tất cả</option>
            <option value="yes">Đã nộp</option>
            <option value="no">Chưa nộp</option>
          </select>
          <select value={filterKT} onChange={e => setFilterKT(e.target.value)}>
            <option value="">HS KT: Tất cả</option>
            <option value="yes">Đã nộp</option>
            <option value="no">Chưa nộp</option>
          </select>
        </div>
        <span className="total-count">Tổng: {filtered.length}</span>
        <button onClick={downloadAllInitial} className="export-btn">Tải tất cả HS đăng ký</button>
        <button onClick={downloadAllKetThuc} className="export-btn">Tải tất cả HS kết thúc</button>
        <button onClick={exportToExcel} className="export-btn">📄 Xuất Excel</button>
        <button className="print-btn" onClick={() => window.print()}>In danh sách</button>
      </div>

      <table className="danh-sach-table">
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Đợt</th>
            <th>Đơn vị</th>
            <th>HS ĐK</th>
            <th>HS KT</th>
            <th>Sổ NK TT</th>
            <th>Giấy tiếp nhận SV</th>
            <th>Phiếu nhận xét ĐVTT</th>
            <th>Phiếu nhận xét NSHD</th>
            <th>Đơn cam kết</th>
            <th>Cuốn báo cáo</th>
            <th>Hợp đồng LĐ</th>
            <th>Xác nhận báo cáo</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(item => {
            const filesDK = dsFilesMap[item.mssv] || [];
            const filesKT = dsFilesKetThucMap[item.mssv] || [];
            return (
              <React.Fragment key={`${item.mssv}-${item.maDotThucTap}`}>
                <tr>
                  <td>{item.mssv}</td>
                  <td>{item.hoSinhVien} {item.tenSinhVien}</td>
                  <td>{item.tenDotThucTap}</td>
                  <td>{item.tenDonViThucTap}</td>
                  <td>
                    {filesDK.length ? <button onClick={() => downloadInitial(item.mssv)}><FiDownload /></button> : ""}
                    {filesDK.length ? <span onClick={() => handleExpand(item.mssv)}>Đã nộp ({filesDK.length})</span> : "Chưa nộp"}
                  </td>
                  <td>
                    {filesKT.length ? <button onClick={() => downloadKetThuc(item.mssv)}><FiDownload /></button> : ""}
                    {filesKT.length ? <span onClick={() => handleExpand(item.mssv + "_kt")}>Đã nộp ({filesKT.length})</span> : "Chưa nộp"}
                  </td>
                  
                  {[
                    "xacNhanCBQLDaNopSoNhatKyThucTap",
                    "xacNhanCBQLDaNopGiayTiepNhanSVThucTap",
                    "xacNhanCBQLDaNopPhieuNhanXetCuaDVTT",
                    "xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap",
                    "xacNhanCBQLDaNopDonCamKetTuTimDVTT",
                    "xacNhanCBQLDaNopCuonBaoCao",
                    "xacNhanCBQLDaNopHopDongLaoDong"
                  ].map(field => (
                    <td key={field}>
                      <input
                        type="checkbox"
                        checked={!!item[field]}
                        onChange={() => handleCheckboxChange(item, field)}
                      />
                    </td>
                    
                  ))}

<td>
  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
    <button
      onClick={() => {
        const chiTietGoc = dsChiTiet.find(ct => ct.mssv === item.mssv && ct.maDotThucTap === item.maDotThucTap);
        handleXacNhanBaoCao(chiTietGoc, true);
      }}
      className={`xac-nhan-btn ${
        item.xacNhanChoBaoCao === true || item.xacNhanChoBaoCao === "True" ? 'active-green' : ''
      }`}
    >
      ✅
    </button>
    <button
      onClick={() => {
        const chiTietGoc = dsChiTiet.find(ct => ct.mssv === item.mssv && ct.maDotThucTap === item.maDotThucTap);
        handleXacNhanBaoCao(chiTietGoc, false);
      }}
      className={`tu-choi-btn ${
        item.xacNhanChoBaoCao === false || item.xacNhanChoBaoCao === "False" ? 'active-red' : ''
      }`}
    >
      ❌
    </button>
  </div>
</td>



                  <td>
   <button
    className="delete-btn"
    onClick={() => deleteSinhVien(item.mssv, item.maDotThucTap)}
  >
    ❌
  </button>
</td>

                </tr>
                {expandedMssv === item.mssv && filesDK.length > 0 && (
                  <tr>
                    <td colSpan="13">
                      <ul className="file-list-inline">
                        {filesDK.map(f => <li key={f.id} onClick={() => handlePreviewInline(f.id)}>{f.name}</li>)}
                      </ul>
                    </td>
                  </tr>
                  
                )}
                {expandedMssv === item.mssv + "_kt" && filesKT.length > 0 && (
                  <tr>
                    <td colSpan="13">
                      <ul className="file-list-inline">
                        {filesKT.map(f => <li key={f.id} onClick={() => handlePreviewInline(f.id, true)}>{f.name}</li>)}
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
        <div className="modal-overlay" onClick={() => setPreviewLink("")}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPreviewLink("")}>×</button>
            <iframe src={previewLink} title="Preview" style={{ width: "100%", height: "90vh", border: "none" }} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DanhSachSVHienDangThucTap;
