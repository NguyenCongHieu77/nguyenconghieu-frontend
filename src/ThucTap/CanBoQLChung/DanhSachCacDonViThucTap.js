import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DanhSachCacDonViThucTap.css";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";

import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const DanhSachCacDonViThucTap = () => {
  const [donVis, setDonVis] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingCell, setEditingCell] = useState({ id: null, key: null });
  const [tempValue, setTempValue] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDonVi, setNewDonVi] = useState({
    tenDonViThucTap: "",
    dienThoai: "",
    diaChi: "",
    nguoiHuongDan: "",
    email: "",
    moTa: "",
    loaiDonViThucTap: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://118.69.126.49:5225/api/DonViThucTap");
        setDonVis(res.data);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
      }
    };
    fetchData();
  }, []);

  const exportToExcel = () => {
    const exportData = donVis.map(({ maDonViThucTap, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDonVi");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "DanhSachDonViThucTap.xlsx");
  };

  const handleSearch = e => setSearchTerm(e.target.value);

  const startEditing = (id, key, value) => {
    setEditingCell({ id, key });
    setTempValue(value);
  };

  const cancelEditing = () => {
    setEditingCell({ id: null, key: null });
    setTempValue("");
  };

  const saveEditing = async () => {
    const { id, key } = editingCell;
    if (id == null || key == null) return cancelEditing();

    const originalItem = donVis.find(item => item.maDonViThucTap === id);
    if (!originalItem) return cancelEditing();

    let parsedValue = key === "loaiDonViThucTap" ? parseInt(tempValue, 10) : tempValue;
    const updatedItem = { ...originalItem, [key]: parsedValue };

    try {
      await axios.put(`http://118.69.126.49:5225/api/DonViThucTap/update/${id}`, updatedItem);
      setDonVis(prev => prev.map(item => item.maDonViThucTap === id ? updatedItem : item));
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    } finally {
      cancelEditing();
    }
  };

  const renderCell = (item, key) => {
    const rawValue = item[key];
    const displayValue = rawValue !== null && typeof rawValue === "object" ? JSON.stringify(rawValue) : rawValue ?? "";

    if (editingCell.id === item.maDonViThucTap && editingCell.key === key) {
      return (
        <input
          type="text"
          value={tempValue}
          onChange={e => setTempValue(e.target.value)}
          onBlur={saveEditing}
          onKeyDown={e => {
            if (e.key === "Enter") saveEditing();
            if (e.key === "Escape") cancelEditing();
          }}
          autoFocus
        />
      );
    }
    return (
      <div
        onClick={() => startEditing(item.maDonViThucTap, key, displayValue.toString())}
        style={{ cursor: "pointer" }}
      >
        {displayValue}
      </div>
    );
  };

  const handleLoaiChange = async (id, newValue) => {
    const originalItem = donVis.find(item => item.maDonViThucTap === id);
    if (!originalItem) return;
    const updatedItem = { ...originalItem, loaiDonViThucTap: newValue };

    try {
      await axios.put(`http://118.69.126.49:5225/api/DonViThucTap/update/${id}`, updatedItem);
      setDonVis(prev => prev.map(item => item.maDonViThucTap === id ? updatedItem : item));
    } catch (error) {
      console.error("Lỗi khi cập nhật loại:", error);
    }
  };

  const handleDelete = async id => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn vị này?')) return;

    try {
      await axios.delete(`http://118.69.126.49:5225/api/DonViThucTap/delete/${id}`);
      setDonVis(prev => prev.filter(item => item.maDonViThucTap !== id));
    } catch (error) {
      console.error("Lỗi khi xóa đơn vị:", error);
    }
  };

  const filteredData = donVis.filter(item =>
    Object.values(item).some(val =>
      String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddDonVi = async () => {
    try {
      const res = await axios.post("http://118.69.126.49:5225/api/DonViThucTap/insert", newDonVi);
      setDonVis(prev => [...prev, res.data]);
      setShowAddForm(false);
      setNewDonVi({
        tenDonViThucTap: "",
        dienThoai: "",
        diaChi: "",
        nguoiHuongDan: "",
        email: "",
        moTa: "",
        loaiDonViThucTap: 0
      });
    } catch (error) {
      console.error("Lỗi khi thêm đơn vị:", error);
    }
  };

  return (
    <div className="donvi-container">
      <h2>DANH SÁCH CÁC ĐƠN VỊ THỰC TẬP</h2>
      <div className="search-bar">
        <FaSearch />
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="add-btn" onClick={() => setShowAddForm(prev => !prev)}>
          <FaPlus /> Thêm đơn vị
        </button>
        <button className="add-btn" onClick={exportToExcel}>
          📄 Xuất Excel
        </button>
        <span className="count">Tổng: {filteredData.length}</span>
      </div>

      {showAddForm && (
        <div className="add-formDV">
          <table>
            <tbody>
              {["tenDonViThucTap", "dienThoai", "diaChi", "nguoiHuongDan", "email", "moTa"].map(field => (
                <tr key={field}>
                  <td>{field}:</td>
                  <td>
                    <input
                      name={field}
                      value={newDonVi[field]}
                      onChange={e => setNewDonVi(prev => ({ ...prev, [field]: e.target.value }))}
                    />
                  </td>
                </tr>
              ))}
              <tr>
                <td>Loại:</td>
                <td>
                  <select
                    name="loaiDonViThucTap"
                    value={newDonVi.loaiDonViThucTap}
                    onChange={e => setNewDonVi(prev => ({ ...prev, loaiDonViThucTap: parseInt(e.target.value, 10) }))}
                  >
                    <option value={0}>Công ty</option>
                    <option value={1}>Trường học</option>
                    <option value={2}>Khác</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ textAlign: 'center' }}>
                  <button onClick={handleAddDonVi}>Lưu đơn vị</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <table className="donvi-table">
        <thead>
          <tr>
            <th>Mã</th>
            <th>Tên đơn vị</th>
            <th>Điện thoại</th>
            <th>Địa chỉ</th>
            <th>Người hướng dẫn</th>
            <th>Email</th>
            <th>Mô tả</th>
            <th>Loại</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.maDonViThucTap}>
              <td>{item.maDonViThucTap}</td>
              <td>{renderCell(item, "tenDonViThucTap")}</td>
              <td>{renderCell(item, "dienThoai")}</td>
              <td>{renderCell(item, "diaChi")}</td>
              <td>{renderCell(item, "nguoiHuongDan")}</td>
              <td>{renderCell(item, "email")}</td>
              <td>{renderCell(item, "moTa")}</td>
              <td>
                <select
                  value={item.loaiDonViThucTap}
                  onChange={e => handleLoaiChange(item.maDonViThucTap, parseInt(e.target.value, 10))}
                >
                  <option value={0}>Công ty</option>
                  <option value={1}>Trường học</option>
                  <option value={2}>Khác</option>
                </select>
              </td>
              <td>
                <button className="delete-btn" onClick={() => handleDelete(item.maDonViThucTap)}>
                  <FaTrash /> Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DanhSachCacDonViThucTap;
