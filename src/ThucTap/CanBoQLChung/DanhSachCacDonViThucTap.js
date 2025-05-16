import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DanhSachCacDonViThucTap.css";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";

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

  // Lấy danh sách đơn vị khi component mount
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

  // Tìm kiếm
  const handleSearch = e => setSearchTerm(e.target.value);

  // Chỉnh sửa ô
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

    let parsedValue = tempValue;
    if (key === "loaiDonViThucTap") parsedValue = parseInt(tempValue, 10);
    const updatedItem = { ...originalItem, [key]: parsedValue };

    try {
      await axios.put(
        `http://118.69.126.49:5225/api/DonViThucTap/update/${id}`,
<<<<<<< HEAD
        updatedData
      );
      setDonVis((prev) =>
        prev.map((item) =>
          item.maDonViThucTap === id ? { ...item, ...updatedData } : item
        )
=======
        updatedItem
>>>>>>> ea1f53b (code moi nhat)
      );
      setDonVis(prev => prev.map(item => item.maDonViThucTap === id ? updatedItem : item));
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
    } finally {
      cancelEditing();
    }
  };

  const renderCell = (item, key) => {
    const rawValue = item[key];
    const displayValue = rawValue !== null && typeof rawValue === "object"
      ? JSON.stringify(rawValue)
      : rawValue ?? "";

    if (
      editingCell.id === item.maDonViThucTap &&
      editingCell.key === key
    ) {
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

  // Cập nhật loại đơn vị
  const handleLoaiChange = async (id, newValue) => {
    const originalItem = donVis.find(item => item.maDonViThucTap === id);
    if (!originalItem) return;
    const updatedItem = { ...originalItem, loaiDonViThucTap: newValue };
    try {
<<<<<<< HEAD
      const res = await axios.post(
        "http://118.69.126.49:5225/api/DonViThucTap/create",
        newDonVi
=======
      await axios.put(
        `http://118.69.126.49:5225/api/DonViThucTap/update/${id}`,
        updatedItem
>>>>>>> ea1f53b (code moi nhat)
      );
      setDonVis(prev => prev.map(item => item.maDonViThucTap === id ? updatedItem : item));
    } catch (error) {
      console.error("Lỗi khi cập nhật loại:", error);
    }
  };

  // Xóa đơn vị
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đơn vị này?')) return;
    try {
      await axios.delete(`http://118.69.126.49:5225/api/DonViThucTap/delete/${id}`);
      setDonVis(prev => prev.filter(item => item.maDonViThucTap !== id));
    } catch (error) {
      console.error("Lỗi khi xóa đơn vị:", error);
    }
  };

  // Lọc dữ liệu
  const filteredData = donVis.filter(item =>
    Object.values(item).some(val =>
      String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

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
        <span className="count">Tổng: {filteredData.length}</span>
      </div>

      {showAddForm && (
        <div className="add-formDV">
          <table>
            <tbody>
              <tr><td>Tên:</td><td><input name="tenDonViThucTap" value={newDonVi.tenDonViThucTap} onChange={e => setNewDonVi(prev => ({ ...prev, tenDonViThucTap: e.target.value }))} /></td></tr>
              <tr><td>Điện thoại:</td><td><input name="dienThoai" value={newDonVi.dienThoai} onChange={e => setNewDonVi(prev => ({ ...prev, dienThoai: e.target.value }))} /></td></tr>
              <tr><td>Địa chỉ:</td><td><input name="diaChi" value={newDonVi.diaChi} onChange={e => setNewDonVi(prev => ({ ...prev, diaChi: e.target.value }))} /></td></tr>
              <tr><td>Người hướng dẫn:</td><td><input name="nguoiHuongDan" value={newDonVi.nguoiHuongDan} onChange={e => setNewDonVi(prev => ({ ...prev, nguoiHuongDan: e.target.value }))} /></td></tr>
              <tr><td>Email:</td><td><input name="email" value={newDonVi.email} onChange={e => setNewDonVi(prev => ({ ...prev, email: e.target.value }))} /></td></tr>
              <tr><td>Mô tả:</td><td><input name="moTa" value={newDonVi.moTa} onChange={e => setNewDonVi(prev => ({ ...prev, moTa: e.target.value }))} /></td></tr>
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
                  <button onClick={async () => {
                    try {
                      const res = await axios.post("http://118.69.126.49:5225/api/DonViThucTap/insert", newDonVi);
                      setDonVis(prev => [...prev, res.data]);
                      setShowAddForm(false);
                      setNewDonVi({ tenDonViThucTap: "", dienThoai: "", diaChi: "", nguoiHuongDan: "", email: "", moTa: "", loaiDonViThucTap: 0 });
                    } catch (error) {
                      console.error("Lỗi khi thêm đơn vị:", error);
                    }
                  }}>Lưu đơn vị</button>
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
