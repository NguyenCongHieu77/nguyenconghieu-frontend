import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DanhSachCacDonViThucTap.css";
import { FaSearch, FaPlus } from "react-icons/fa";

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
    isDelete: false
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

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const getSafeValue = (value) => {
    if (typeof value === "string") return value;
    if (typeof value === "number") return value.toString();
    return "";
  };

  const updateField = async (id, key, value) => {
    const original = donVis.find((item) => item.maDonViThucTap === id);
    if (!original) return;

    const updatedData = {
      ...original,
      [key]: key === "isDelete" ? value : value.toString(),
      dienThoai: original.dienThoai || "",
      diaChi: original.diaChi || "",
      nguoiHuongDan: original.nguoiHuongDan || "",
      email: original.email || "",
      moTa: original.moTa || "",
      isDelete: key === "isDelete" ? value : original.isDelete ?? false,
      loaiDonViThucTap: key === "loaiDonViThucTap" ? parseInt(value) : original.loaiDonViThucTap ?? 0
    };

    try {
      await axios.put(
        `http://118.69.126.49:5225/api/DonViThucTap/update/${id}`,
        updatedData
      );
      setDonVis((prev) =>
        prev.map((item) =>
          item.maDonViThucTap === id ? { ...item, ...updatedData } : item
        )
      );
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    }
  };

  const handleCellClick = (id, key, currentValue) => {
    setEditingCell({ id, key });
    setTempValue(currentValue);
  };

  const handleBlur = () => {
    if (editingCell.id && editingCell.key !== null) {
      updateField(editingCell.id, editingCell.key, tempValue);
    }
    setEditingCell({ id: null, key: null });
  };

  const renderEditableCell = (item, key) => {
    const value = getSafeValue(item[key]);
    if (editingCell.id === item.maDonViThucTap && editingCell.key === key) {
      return (
        <input
          type="text"
          value={tempValue}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleBlur();
          }}
          autoFocus
        />
      );
    }
    return (
      <div onClick={() => handleCellClick(item.maDonViThucTap, key, value)}>
        {value}
      </div>
    );
  };

  const renderLoaiSelect = (item) => (
    <select
      value={item.loaiDonViThucTap}
      onChange={(e) =>
        updateField(item.maDonViThucTap, "loaiDonViThucTap", e.target.value)
      }
    >
      <option value={0}>Công ty</option>
      <option value={1}>Trường học</option>
      <option value={2}>Khác</option>
    </select>
  );

  const renderIsDeleteCheckbox = (item) => (
    <input
      type="checkbox"
      checked={item.isDelete}
      onChange={(e) =>
        updateField(item.maDonViThucTap, "isDelete", e.target.checked)
      }
    />
  );

  const filteredData = donVis.filter((item) =>
    Object.values(item).some((value) =>
      getSafeValue(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewDonVi((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleAddSubmit = async () => {
    try {
      const res = await axios.post(
        "http://118.69.126.49:5225/api/DonViThucTap/create",
        newDonVi
      );
      setDonVis((prev) => [...prev, res.data]);
      setShowAddForm(false);
      setNewDonVi({
        tenDonViThucTap: "",
        dienThoai: "",
        diaChi: "",
        nguoiHuongDan: "",
        email: "",
        moTa: "",
        loaiDonViThucTap: 0,
        isDelete: false
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
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          <FaPlus /> Thêm đơn vị
        </button>
        <span className="count">Tổng: {filteredData.length}</span>
      </div>

      {showAddForm && (
        <div className="add-form">
          <table>
            <tbody>
              <tr>
                <td>Tên:</td>
                <td><input name="tenDonViThucTap" value={newDonVi.tenDonViThucTap} onChange={handleAddChange} /></td>
              </tr>
              <tr>
                <td>Điện thoại:</td>
                <td><input name="dienThoai" value={newDonVi.dienThoai} onChange={handleAddChange} /></td>
              </tr>
              <tr>
                <td>Địa chỉ:</td>
                <td><input name="diaChi" value={newDonVi.diaChi} onChange={handleAddChange} /></td>
              </tr>
              <tr>
                <td>Người hướng dẫn:</td>
                <td><input name="nguoiHuongDan" value={newDonVi.nguoiHuongDan} onChange={handleAddChange} /></td>
              </tr>
              <tr>
                <td>Email:</td>
                <td><input name="email" value={newDonVi.email} onChange={handleAddChange} /></td>
              </tr>
              <tr>
                <td>Mô tả:</td>
                <td><input name="moTa" value={newDonVi.moTa} onChange={handleAddChange} /></td>
              </tr>
              <tr>
                <td>Loại:</td>
                <td>
                  <select name="loaiDonViThucTap" value={newDonVi.loaiDonViThucTap} onChange={handleAddChange}>
                    <option value={0}>Công ty</option>
                    <option value={1}>Trường học</option>
                    <option value={2}>Khác</option>
                  </select>
                </td>
              </tr>
              <tr>
                <td>Đã xóa:</td>
                <td><input type="checkbox" name="isDelete" checked={newDonVi.isDelete} onChange={handleAddChange} /></td>
              </tr>
              <tr>
                <td colSpan={2}>
                  <button onClick={handleAddSubmit}>Lưu đơn vị</button>
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
            <th>Đã xóa</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item) => (
            <tr key={item.maDonViThucTap}>
              <td>{item.maDonViThucTap}</td>
              <td>{renderEditableCell(item, "tenDonViThucTap")}</td>
              <td>{renderEditableCell(item, "dienThoai")}</td>
              <td>{renderEditableCell(item, "diaChi")}</td>
              <td>{renderEditableCell(item, "nguoiHuongDan")}</td>
              <td>{renderEditableCell(item, "email")}</td>
              <td>{renderEditableCell(item, "moTa")}</td>
              <td>{renderLoaiSelect(item)}</td>
              <td>{renderIsDeleteCheckbox(item)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DanhSachCacDonViThucTap;
