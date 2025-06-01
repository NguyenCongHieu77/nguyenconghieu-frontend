import React, { useEffect, useState } from "react";
import axios from "axios";
import "./DanhSachCacDonViThucTap.css";
import { FaSearch, FaPlus, FaTrash } from "react-icons/fa";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Đảm bảo đường dẫn đúng đến component NotificationCard của bạn

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

  // States mới cho Notification Card
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success'); // 'success' hoặc 'error'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');

  // State cho modal xác nhận xóa
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDonViToDelete, setSelectedDonViToDelete] = useState(null); // Lưu ID đơn vị cần xóa

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTap`);
        setDonVis(res.data);
      } catch (err) {
        console.error("Lỗi khi gọi API:", err);
        setNotificationType('error');
        setNotificationMessage('Tải dữ liệu thất bại!');
        setNotificationSubText('Không thể tải danh sách đơn vị thực tập.');
        setShowNotification(true);
      }
    };
    fetchData();
  }, []); // useEffect chỉ chạy một lần khi component mount

  const exportToExcel = () => {
    const exportData = donVis.map(({ maDonViThucTap, ...rest }) => rest);
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "DanhSachDonVi");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "DanhSachDonViThucTap.xlsx");

    setNotificationType('success');
    setNotificationMessage('Xuất Excel thành công!');
    setNotificationSubText('Dữ liệu đã được xuất ra file Excel.');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
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

  const sanitizeField = (value) => {
    if (value === undefined || value === null || (typeof value === "object" && !Array.isArray(value))) {
      return null;
    }
    if (typeof value === "string" && value.trim() === "") {
      return null;
    }
    return value;
  };

  const saveEditing = async () => {
    const { id, key } = editingCell;
    if (id == null || key == null) {
      cancelEditing();
      return;
    }

    const originalItem = donVis.find(item => item.maDonViThucTap === id);
    if (!originalItem) {
      cancelEditing();
      return;
    }

    let parsedValue = tempValue;

    if (key === "loaiDonViThucTap") {
      parsedValue = isNaN(parseInt(tempValue)) ? null : parseInt(tempValue, 10);
    } else if (key === "isDelete") {
      parsedValue = tempValue === "true" || tempValue === true;
    }

    const updatedItem = {
      ...originalItem,
      [key]: parsedValue
    };

    const sanitizedItem = {
      maDonViThucTap: updatedItem.maDonViThucTap,
      tenDonViThucTap: sanitizeField(updatedItem.tenDonViThucTap),
      dienThoai: sanitizeField(updatedItem.dienThoai),
      diaChi: sanitizeField(updatedItem.diaChi),
      nguoiHuongDan: sanitizeField(updatedItem.nguoiHuongDan),
      email: sanitizeField(updatedItem.email),
      moTa: sanitizeField(updatedItem.moTa),
      isDelete: sanitizeField(updatedItem.isDelete),
      loaiDonViThucTap: sanitizeField(updatedItem.loaiDonViThucTap)
    };

    try {
      await axios.put(`${process.env.REACT_APP_API_URL}/api/DonViThucTap/update/${id}`, sanitizedItem);
      setDonVis(prev => prev.map(item => item.maDonViThucTap === id ? sanitizedItem : item));
      setNotificationType('success');
      setNotificationMessage('Cập nhật thành công!');
      setNotificationSubText(`Đơn vị ${sanitizedItem.tenDonViThucTap} đã được cập nhật.`);
      setShowNotification(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      setNotificationType('error');
      setNotificationMessage('Cập nhật thất bại!');
      setNotificationSubText('Có lỗi xảy ra khi cập nhật đơn vị.');
      setShowNotification(true);
    } finally {
      cancelEditing();
      setTimeout(() => setShowNotification(false), 5000);
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
      await axios.put(`${process.env.REACT_APP_API_URL}/api/DonViThucTap/update/${id}`, updatedItem);
      setDonVis(prev => prev.map(item => item.maDonViThucTap === id ? updatedItem : item));
      setNotificationType('success');
      setNotificationMessage('Cập nhật loại đơn vị thành công!');
      setNotificationSubText(`Loại của đơn vị ${originalItem.tenDonViThucTap} đã được cập nhật.`);
      setShowNotification(true);
    } catch (error) {
      console.error("Lỗi khi cập nhật loại:", error);
      setNotificationType('error');
      setNotificationMessage('Cập nhật loại đơn vị thất bại!');
      setNotificationSubText('Có lỗi xảy ra khi cập nhật loại đơn vị.');
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  // Hàm mở modal xác nhận xóa
  const openDeleteConfirmModal = (id) => {
    setSelectedDonViToDelete(id);
    setShowDeleteModal(true);
  };

  // Hàm xử lý xóa khi xác nhận trong modal
  const confirmDelete = async () => {
    setShowDeleteModal(false); // Đóng modal
    if (selectedDonViToDelete === null) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/DonViThucTap/delete/${selectedDonViToDelete}`);
      setDonVis(prev => prev.filter(item => item.maDonViThucTap !== selectedDonViToDelete));
      setNotificationType('success');
      setNotificationMessage('Xóa đơn vị thành công!');
      setNotificationSubText('Đơn vị đã được xóa khỏi danh sách.');
      setShowNotification(true);
    } catch (error) {
      console.error("Lỗi khi xóa đơn vị:", error);
      setNotificationType('error');
      setNotificationMessage('Xóa đơn vị thất bại!');
      setNotificationSubText('Không thể xóa đơn vị. Có thể đơn vị đang được sử dụng.');
      setShowNotification(true);
    } finally {
      setSelectedDonViToDelete(null); // Reset
      setTimeout(() => setShowNotification(false), 5000);
    }
  };


  const filteredData = donVis.filter(item =>
    Object.values(item).some(val =>
      String(val ?? "").toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleAddDonVi = async () => {
    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/DonViThucTap/insert`, newDonVi);
      setDonVis(prev => [...prev, res.data]); // Thêm trực tiếp dữ liệu trả về từ API
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
      setNotificationType('success');
      setNotificationMessage('Thêm đơn vị thành công!');
      setNotificationSubText(`Đơn vị ${res.data.tenDonViThucTap} đã được thêm mới.`);
      setShowNotification(true);
    } catch (error) {
      console.error("Lỗi khi thêm đơn vị:", error);
      setNotificationType('error');
      setNotificationMessage('Thêm đơn vị thất bại!');
      setNotificationSubText('Không thể thêm đơn vị mới. Vui lòng kiểm tra lại thông tin.');
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
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
        <button className="print-btn" onClick={() => window.print()}>In danh sách</button>

        <span className="count">Tổng: {filteredData.length}</span>
      </div>

      {showAddForm && (
        <div className="add-formDV">
          <table>
            <tbody>
              {["tenDonViThucTap", "dienThoai", "diaChi", "nguoiHuongDan", "email", "moTa"].map(field => (
                <tr key={field}>
                  <td>{field.replace(/([A-Z])/g, ' $1').toLowerCase().replace(/^./, str => str.toUpperCase())}:</td> {/* Hiển thị tên trường đẹp hơn */}
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
                <button className="delete-btn" onClick={() => openDeleteConfirmModal(item.maDonViThucTap)}>
                  <FaTrash /> Xóa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal xác nhận xóa */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Xác nhận xóa đơn vị</h3>
            <p>Bạn có chắc chắn muốn xóa đơn vị **{selectedDonViToDelete}** này không?</p>
            <div className="modal-actions">
              <button onClick={confirmDelete} className="btn-confirm-delete">Xác nhận xóa</button>
              <button onClick={() => setShowDeleteModal(false)} className="btn-cancel">Hủy</button>
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
};

export default DanhSachCacDonViThucTap;