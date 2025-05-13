import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import './DanhSachSVHienDangThucTap.css';

function DanhSachSVHienDangThucTap() {
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDotThucTap, setFilterDotThucTap] = useState("");
  const [filterDonVi, setFilterDonVi] = useState("");
  const [filterGiaoVien, setFilterGiaoVien] = useState("");
  const [filterTinhTrang, setFilterTinhTrang] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:5225/api/ChiTietThucTap/get-all");
        setDsChiTiet(res.data);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
      }
    };
    fetchData();
  }, []);

  const filteredData = dsChiTiet
    .filter(item =>
      item.tenTinhTrang === "Đang thực tập" || item.tenTinhTrang === "Hoàn thành thực tập"
    )
    .filter(item => {
      const fullName = `${item.hoSinhVien} ${item.tenSinhVien}`.toLowerCase();
      return (
        fullName.includes(searchTerm.toLowerCase()) ||
        item.mssv.includes(searchTerm)
      );
    })
    .filter(item => {
      return (
        (filterDotThucTap === "" || item.tenDotThucTap === filterDotThucTap) &&
        (filterDonVi === "" || item.tenDonViThucTap === filterDonVi) &&
        (filterGiaoVien === "" || item.hoTenGiaoVien === filterGiaoVien) &&
        (filterTinhTrang === "" || item.tenTinhTrang === filterTinhTrang)
      );
    });

  const getUniqueValues = (field) => {
    const values = dsChiTiet.map(item => item[field]);
    return [...new Set(values.filter(Boolean))];
  };

  const exportToExcel = () => {
    const exportData = filteredData.map((item) => ({
      MSSV: item.mssv,
      "Họ tên": `${item.hoSinhVien} ${item.tenSinhVien}`,
      "Đợt thực tập": item.tenDotThucTap,
      "Đơn vị": item.tenDonViThucTap,
      "Giáo viên hướng dẫn": item.hoTenGiaoVien,
      "Tình trạng": item.tenTinhTrang,
      "Ghi chú": item.ghiChu || "Không có"
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachSinhVien");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array"
    });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "DanhSachSinhVienThucTap.xlsx");
  };

  const downloadHoSo = async (mssv) => {
    try {
      const response = await axios.get(`http://localhost:5225/api/ChiTietThucTap/download-ho-so/${mssv}`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      saveAs(blob, `HoSo_${mssv}.zip`);
    } catch (error) {
      console.error("Lỗi khi tải hồ sơ:", error);
      alert("Không thể tải hồ sơ. Vui lòng thử lại sau.");
    }
  };

  const downloadAllHoSo = async () => {
    try {
      const response = await axios.get(`http://localhost:5225/api/ChiTietThucTap/download-ho-so/all`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: response.headers["content-type"] });
      saveAs(blob, "TatCa_HoSoSinhVien.zip");
    } catch (error) {
      console.error("Lỗi khi tải tất cả hồ sơ:", error);
      alert("Không thể tải tất cả hồ sơ. Vui lòng thử lại sau.");
    }
  };

  return (
    <div className="danh-sach-container">
      <h2>DANH SÁCH THÔNG TIN SINH VIÊN ĐANG THỰC TẬP</h2>

      <div className="search-bar">
        <div className="search-input">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm theo MSSV hoặc Họ tên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <div className="filters">
            <select value={filterDotThucTap} onChange={(e) => setFilterDotThucTap(e.target.value)}>
              <option value="">Tất cả đợt thực tập</option>
              {getUniqueValues("tenDotThucTap").map((value, idx) => (
                <option key={idx} value={value}>{value}</option>
              ))}
            </select>

            <select value={filterDonVi} onChange={(e) => setFilterDonVi(e.target.value)}>
              <option value="">Tất cả đơn vị</option>
              {getUniqueValues("tenDonViThucTap").map((value, idx) => (
                <option key={idx} value={value}>{value}</option>
              ))}
            </select>

            <select value={filterGiaoVien} onChange={(e) => setFilterGiaoVien(e.target.value)}>
              <option value="">Tất cả giáo viên</option>
              {getUniqueValues("hoTenGiaoVien").map((value, idx) => (
                <option key={idx} value={value}>{value}</option>
              ))}
            </select>

            <select value={filterTinhTrang} onChange={(e) => setFilterTinhTrang(e.target.value)}>
              <option value="">Tất cả tình trạng</option>
              <option value="Đang thực tập">Đang thực tập</option>
              <option value="Hoàn thành thực tập">Hoàn thành thực tập</option>
            </select>

            <div className="action-bar">
              <span className="total-count">Tổng: {filteredData.length}</span>
              <button onClick={exportToExcel} className="export-btn">Xuất Excel</button>
              <button onClick={downloadAllHoSo} className="export-btn">Tải tất cả hồ sơ</button>
            </div>
          </div>
        </div>
      </div>

      <table border="1" cellPadding="8" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Đợt thực tập</th>
            <th>Đơn vị</th>
            <th>Giáo viên hướng dẫn</th>
            <th>Tình trạng</th>
            <th>Ghi chú</th>
            <th>Tải hồ sơ</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length > 0 ? (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.mssv}</td>
                <td>{item.hoSinhVien} {item.tenSinhVien}</td>
                <td>{item.tenDotThucTap}</td>
                <td>{item.tenDonViThucTap}</td>
                <td>{item.hoTenGiaoVien}</td>
                <td>{item.tenTinhTrang}</td>
                <td>{item.ghiChu || "Không có"}</td>
                <td>
                  <button onClick={() => downloadHoSo(item.mssv)} title="Tải hồ sơ">
                    <FiDownload />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: "center" }}>Không tìm thấy kết quả.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default DanhSachSVHienDangThucTap;
