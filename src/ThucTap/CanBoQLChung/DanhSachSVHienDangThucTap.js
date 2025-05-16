import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { saveAs } from "file-saver";
import './DanhSachSVHienDangThucTap.css';

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
  const [filterDK, setFilterDK] = useState("");    // new: HS ĐK filter
  const [filterKT, setFilterKT] = useState("");    // new: HS KT filter
  const [expandedMssv, setExpandedMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState("");

  const apiChiTiet = "http://118.69.126.49:5225/api/ChiTietThucTap";
  const apiHoSo = "http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau";
  const apiKetThuc = "http://118.69.126.49:5225/api/ChiTietHoSoThucTapKetThuc";

  useEffect(() => {
<<<<<<< HEAD
    const fetchData = async () => {
      try {
        const res = await axios.get("http://118.69.126.49:5225/api/ChiTietThucTap/get-all");
        setDsChiTiet(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      }
    };
    fetchData();
=======
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
>>>>>>> ea1f53b (code moi nhat)
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

  const filtered = merged
    .filter(item => !!item.tinhTrangXacNhan)
    .filter(item => {
      const fullName = `${item.hoSinhVien || ""} ${item.tenSinhVien || ""}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        item.mssv.includes(searchTerm)
      );
    })
    .filter(item => !filterDotThucTap || item.tenDotThucTap === filterDotThucTap)
    .filter(item => !filterDonVi || item.tenDonViThucTap === filterDonVi)
    .filter(item => {
      if (filterDK === "yes") return (dsFilesMap[item.mssv] || []).length > 0;
      if (filterDK === "no")  return (dsFilesMap[item.mssv] || []).length === 0;
      return true;
    })
    .filter(item => {
      if (filterKT === "yes") return (dsFilesKetThucMap[item.mssv] || []).length > 0;
      if (filterKT === "no")  return (dsFilesKetThucMap[item.mssv] || []).length === 0;
      return true;
    });

  const getUnique = field => [...new Set(merged.map(x => x[field]).filter(Boolean))];

  const downloadInitial = async mssv => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`http://118.69.126.49:5225/api/ChiTietThucTap/download-ho-so/${mssv}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      saveAs(blob, `HoSo_${mssv}.zip`);
    } catch (error) {
      console.error("Lỗi khi tải hồ sơ:", error);
      alert("Không thể tải hồ sơ. Vui lòng thử lại sau.");
=======
      const res = await axios.get(`${apiHoSo}/download-ho-so/${mssv}`, { responseType: "blob" });
      saveAs(new Blob([res.data]), `${mssv}_HoSoBanDau.zip`);
    } catch {
      alert(`Tải HS của ${mssv} thất bại`);
>>>>>>> ea1f53b (code moi nhat)
    }
  };

  const downloadKetThuc = async mssv => {
    try {
<<<<<<< HEAD
      const response = await axios.get(`http://118.69.126.49:5225/api/ChiTietThucTap/download-ho-so/all`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      saveAs(blob, "TatCa_HoSoSinhVien.zip");
    } catch (error) {
      console.error("Lỗi khi tải tất cả hồ sơ:", error);
      alert("Không thể tải tất cả hồ sơ. Vui lòng thử lại sau.");
=======
      const res = await axios.get(`${apiKetThuc}/download-ho-so/${mssv}`, { responseType: "blob" });
      saveAs(new Blob([res.data]), `${mssv}_HoSoKetThuc.zip`);
    } catch {
      alert(`Tải HS kết thúc của ${mssv} thất bại`);
>>>>>>> ea1f53b (code moi nhat)
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

  const handleExpand = mssv => setExpandedMssv(prev => (prev === mssv ? null : mssv));

  const handlePreviewInline = async (id, isKetThuc = false) => {
    try {
      const res = await axios.get(`${isKetThuc ? apiKetThuc : apiHoSo}/preview/${id}`);
      setPreviewLink(res.data.previewLink);
    } catch {
      alert("Lấy preview thất bại");
    }
  };

  const handleCheckboxChange = (item, field) => {
    const newValue = !item[field];
    const payload = {
      mssv: item.mssv,
      maDotThucTap: item.maDotThucTap,
      ...["xacNhanCBQLDaNopSoNhatKyThucTap", "xacNhanCBQLDaNopGiayTiepNhanSVThucTap",
        "xacNhanCBQLDaNopPhieuNhanXetCuaDVTT", "xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap",
        "xacNhanCBQLDaNopDonCamKetTuTimDVTT", "xacNhanCBQLDaNopCuonBaoCao",
        "xacNhanCBQLDaNopHopDongLaoDong"].reduce((acc, key) => {
        acc[key] = key === field ? newValue : item[key];
        return acc;
      }, {})
    };
    axios.put(`${apiKetThuc}/cap-nhat-tinh-trang-ho-so-ket-thuc-byCBQL`, payload)
      .then(() => setDsKetThuc(prev => prev.map(k => (k.mssv === item.mssv && k.maDotThucTap === item.maDotThucTap ? { ...k, [field]: newValue } : k))))
      .catch(() => alert("Cập nhật thất bại"));
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
                  {["xacNhanCBQLDaNopSoNhatKyThucTap","xacNhanCBQLDaNopGiayTiepNhanSVThucTap",
                    "xacNhanCBQLDaNopPhieuNhanXetCuaDVTT","xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap",
                    "xacNhanCBQLDaNopDonCamKetTuTimDVTT","xacNhanCBQLDaNopCuonBaoCao",
                    "xacNhanCBQLDaNopHopDongLaoDong"].map(field => (
                    <td key={field}>
                      <input
                        type="checkbox"
                        checked={!!item[field]}
                        onChange={() => handleCheckboxChange(item, field)}
                      />
                    </td>
                  ))}
                </tr>
                {expandedMssv === item.mssv && filesDK.length > 0 && (
                  <tr><td colSpan="13"><ul className="file-list-inline">{filesDK.map(f => <li key={f.id} onClick={() => handlePreviewInline(f.id)}>{f.name}</li>)}</ul></td></tr>
                )}
                {expandedMssv === item.mssv + "_kt" && filesKT.length > 0 && (
                  <tr><td colSpan="13"><ul className="file-list-inline">{filesKT.map(f => <li key={f.id} onClick={() => handlePreviewInline(f.id, true)}>{f.name}</li>)}</ul></td></tr>
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
