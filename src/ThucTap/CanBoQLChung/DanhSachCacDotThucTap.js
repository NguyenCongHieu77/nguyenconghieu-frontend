import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DanhSachCacDotThucTap.css';
import { useNavigate } from 'react-router-dom';

// Assuming you have a NotificationCard component
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Create this file

const internshipTypes = [
  { id: 1, label: 'Thực tập sớm' },
  { id: 2, label: 'Thực tập đúng đợt' },
  { id: 3, label: 'Thực tập lại' },
  { id: 4, label: 'Thực tập liên thông' }
];

const DanhSachCacDotThucTap = () => {
  const [dotThucTapList, setDotThucTapList] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    tenDotThucTap: '',
    ngayBatDau: '',
    soThang: '',
    doiTuongDangKy: '',
    moTa: '',
    maLoaiThucTap: internshipTypes[0].id
  });
  const [selectedDot, setSelectedDot] = useState(null);
  const [availableDonVi, setAvailableDonVi] = useState([]);
  const [donViTrongDot, setDonViTrongDot] = useState([]);
  const [showDonViModal, setShowDonViModal] = useState(false);

  // State for delete confirmation modal
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [dotToDelete, setDotToDelete] = useState(null);
  const [deleteAllExpiredConfirm, setDeleteAllExpiredConfirm] = useState(false); // To distinguish between single and bulk delete

  // State for Notification Card
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(''); // 'success' or 'error'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDots = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/DotThucTap`);
        const dataWithType = res.data.map(dot => ({
          ...dot,
          tenLoaiThucTap: internshipTypes.find(t => t.id === dot.maLoaiThucTap)?.label || ''
        }));
        setDotThucTapList(dataWithType);
      } catch (err) {
        console.error('Lỗi khi tải đợt thực tập:', err);
        showNotificationCard('error', 'Lỗi tải dữ liệu', 'Không thể tải danh sách đợt thực tập.');
      }
    };
    fetchDots();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('vi-VN');

  const showNotificationCard = (type, message, subText = '') => {
    setNotificationType(type);
    setNotificationMessage(message);
    setNotificationSubText(subText);
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 3000); // Hide after 3 seconds
  };

  const handleInputChange = e => {
    const { name, value } = e.target;
    const newValue = name === 'maLoaiThucTap' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSelectedChange = e => {
    const { name, value } = e.target;
    const newValue = name === 'maLoaiThucTap' ? parseInt(value, 10) : value;
    setSelectedDot(prev => ({ ...prev, [name]: newValue }));
  };

  const handleAddDotThucTap = async () => {
    try {
      const payload = { ...formData, soThang: parseInt(formData.soThang, 10), isDelete: false };
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/DotThucTap`, payload);
      const newDot = {
        ...payload,
        maDotThucTap: res.data.MaDotThucTap,
        tenLoaiThucTap: internshipTypes.find(t => t.id === payload.maLoaiThucTap)?.label || ''
      };
      setDotThucTapList(prev => [newDot, ...prev]);
      setFormData({
        tenDotThucTap: '',
        ngayBatDau: '',
        soThang: '',
        doiTuongDangKy: '',
        moTa: '',
        maLoaiThucTap: internshipTypes[0].id
      });
      setShowAddForm(false);
      showNotificationCard('success', 'Thêm thành công', 'Đợt thực tập đã được thêm mới.');
    } catch (err) {
      console.error('Lỗi khi thêm đợt thực tập:', err);
      showNotificationCard('error', 'Thêm thất bại', 'Có lỗi xảy ra khi thêm đợt thực tập.');
    }
  };

  const handleCardClick = async dot => {
    setSelectedDot({ ...dot, ngayBatDau: dot.ngayBatDau.slice(0, 10) });
    try {
      const [resDVTrongDot, resAllDV] = await Promise.all([
        axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTapTheoDot/${dot.maDotThucTap}`),
        axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTap`)
      ]);
      setDonViTrongDot(resDVTrongDot.data);
      setAvailableDonVi(resAllDV.data);
    } catch (err) {
      console.error('Lỗi khi lấy đơn vị:', err);
      showNotificationCard('error', 'Lỗi tải đơn vị', 'Không thể tải thông tin đơn vị thực tập.');
    }
  };

  const handleSaveUpdate = async () => {
    try {
      const payload = {
        MaDotThucTap: selectedDot.maDotThucTap,
        TenDotThucTap: selectedDot.tenDotThucTap,
        NgayBatDau: selectedDot.ngayBatDau,
        SoThang: parseInt(selectedDot.soThang, 10),
        DoiTuongDangKy: selectedDot.doiTuongDangKy,
        MoTa: selectedDot.moTa,
        MaLoaiThucTap: selectedDot.maLoaiThucTap,
        IsDelete: false
      };
      await axios.put(`${process.env.REACT_APP_API_URL}/api/DotThucTap/dotthuctap-update`, payload);
      setDotThucTapList(prev =>
        prev.map(dot =>
          dot.maDotThucTap === selectedDot.maDotThucTap
            ? {
              ...dot,
              tenDotThucTap: payload.TenDotThucTap,
              ngayBatDau: payload.NgayBatDau,
              soThang: payload.SoThang,
              doiTuongDangKy: payload.DoiTuongDangKy,
              moTa: payload.MoTa,
              maLoaiThucTap: payload.MaLoaiThucTap,
              tenLoaiThucTap: internshipTypes.find(t => t.id === payload.MaLoaiThucTap)?.label
            }
            : dot
        )
      );
      setSelectedDot(null);
      showNotificationCard('success', 'Cập nhật thành công', 'Thông tin đợt thực tập đã được cập nhật.');
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
      showNotificationCard('error', 'Cập nhật thất bại', 'Có lỗi xảy ra khi cập nhật đợt thực tập.');
    }
  };

  const handleDeleteDot = async (id) => {
    setDotToDelete(dotThucTapList.find(dot => dot.maDotThucTap === id));
    setDeleteAllExpiredConfirm(false); // Ensure this is false for single delete
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteDot = async () => {
    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/api/DotThucTap/delete/${dotToDelete.maDotThucTap}`);
      setDotThucTapList(prev => prev.filter(dot => dot.maDotThucTap !== dotToDelete.maDotThucTap));
      setSelectedDot(null);
      setShowDeleteConfirmModal(false);
      showNotificationCard('success', 'Xóa thành công', `Đợt thực tập "${dotToDelete.tenDotThucTap}" đã được xóa.`);
      setDotToDelete(null);
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
      showNotificationCard('error', 'Xóa thất bại', 'Không thể xóa đợt thực tập.');
      setShowDeleteConfirmModal(false);
      setDotToDelete(null);
    }
  };

  const handleToggleDonVi = async (dvId) => {
    const isAdded = donViTrongDot.some(d => d.maDonViThucTap === dvId);
    try {
      if (isAdded) {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/DonViThucTapTheoDot/delete-1Madotdonvi${selectedDot.maDotThucTap}`, {
          params: { maDonViThucTap: dvId }
        });
        showNotificationCard('success', 'Gỡ đơn vị thành công', 'Đơn vị đã được gỡ khỏi đợt thực tập.');
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/api/DonViThucTapTheoDot`, {
          maDotThucTap: selectedDot.maDotThucTap,
          maDonViThucTaps: [dvId]
        });
        showNotificationCard('success', 'Thêm đơn vị thành công', 'Đơn vị đã được thêm vào đợt thực tập.');
      }
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTapTheoDot/${selectedDot.maDotThucTap}`);
      setDonViTrongDot(res.data);
    } catch (err) {
      console.error('Lỗi toggle đơn vị:', err);
      showNotificationCard('error', 'Thao tác thất bại', 'Không thể cập nhật đơn vị thực tập.');
    }
  };

  // Tách đợt thực tập thành còn hạn và hết hạn
  const dotConHan = dotThucTapList.filter(dot => {
    const ngayBatDau = new Date(dot.ngayBatDau);
    const now = new Date();
    const diffDays = Math.floor((now - ngayBatDau) / (1000 * 60 * 60 * 24));
    return diffDays <= 15;
  });

  const dotHetHan = dotThucTapList.filter(dot => {
    const ngayBatDau = new Date(dot.ngayBatDau);
    const now = new Date();
    const diffDays = Math.floor((now - ngayBatDau) / (1000 * 60 * 60 * 24));
    return diffDays > 15;
  });


  const handleDeleteAllExpiredDots = async () => {
    setDeleteAllExpiredConfirm(true);
    setShowDeleteConfirmModal(true);
  };

  const confirmDeleteAllExpiredDots = async () => {
    try {
      await Promise.all(
        dotHetHan.map(dot =>
          axios.delete(`${process.env.REACT_APP_API_URL}/api/DotThucTap/delete/${dot.maDotThucTap}`)
        )
      );
      setDotThucTapList(prev => prev.filter(dot => {
        const ngayBatDau = new Date(dot.ngayBatDau);
        const now = new Date();
        const diffDays = Math.floor((now - ngayBatDau) / (1000 * 60 * 60 * 24));
        return diffDays <= 15;
      }));
      setShowDeleteConfirmModal(false);
      setDeleteAllExpiredConfirm(false);
      showNotificationCard('success', 'Xóa thành công', 'Tất cả các đợt thực tập hết hạn đã được xóa.');
    } catch (err) {
      console.error('Lỗi khi xoá hàng loạt đợt hết hạn:', err);
      showNotificationCard('error', 'Xóa thất bại', 'Không thể xóa tất cả các đợt hết hạn.');
      setShowDeleteConfirmModal(false);
      setDeleteAllExpiredConfirm(false);
    }
  };


  return (
    <>
      {/* Modal chỉnh sửa */}
      {selectedDot && (
        <div className="modalDTT">
          <div className="modal-content">
            <div className="edit-form-and-units">
              <div className="left-form">
                <h3>SỬA ĐỢT THỰC TẬP</h3>
                <input name="tenDotThucTap" value={selectedDot.tenDotThucTap} onChange={handleSelectedChange} />
                <input type="date" name="ngayBatDau" value={selectedDot.ngayBatDau} onChange={handleSelectedChange} />
                <input type="number" name="soThang" value={selectedDot.soThang} onChange={handleSelectedChange} />
                <input name="doiTuongDangKy" value={selectedDot.doiTuongDangKy} onChange={handleSelectedChange} />
                <input name="moTa" value={selectedDot.moTa} onChange={handleSelectedChange} />
                <select name="maLoaiThucTap" value={selectedDot.maLoaiThucTap} onChange={handleSelectedChange}>
                  {internshipTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
                <div className="modal-buttons">
                  <button onClick={handleSaveUpdate}>Lưu</button>
                  <button onClick={() => setSelectedDot(null)}>Hủy</button>
                  <button className="delete-btn" onClick={() => handleDeleteDot(selectedDot.maDotThucTap)}>Xóa</button>
                  <button onClick={() => setShowDonViModal(true)}>Thêm đơn vị thực tập</button>
                </div>
              </div>
              <div className="right-units">
                <h4>Đơn vị trong đợt</h4>
                <ul>
                  {donViTrongDot.map(dv => <li key={dv.maDonViThucTap}>{dv.tenDonViThucTap}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal đơn vị */}
      {showDonViModal && (
        <div className="modal-overlay">
          <div className="donvi-modal">
            <h3>Chọn hoặc bỏ chọn đơn vị thực tập</h3>
            <ul className="donvi-dropdown">
              {availableDonVi.map(dv => {
                const isChecked = donViTrongDot.some(d => d.maDonViThucTap === dv.maDonViThucTap);
                return (
                  <li key={dv.maDonViThucTap}>
                    <label>
                      <input type="checkbox" checked={isChecked} onChange={() => handleToggleDonVi(dv.maDonViThucTap)} />
                      {dv.tenDonViThucTap}
                    </label>
                  </li>
                );
              })}
            </ul>
            <button onClick={() => setShowDonViModal(false)}>Đóng</button>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa */}
      {showDeleteConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Xác nhận xóa</h3>
            {deleteAllExpiredConfirm ? (
              <p>Bạn có chắc chắn muốn xóa **TẤT CẢ** các đợt thực tập đã hết hạn không?</p>
            ) : (
              <p>Bạn có chắc chắn muốn xóa đợt thực tập **{dotToDelete?.tenDotThucTap}** không?</p>
            )}

            <div className="modal-actions">
              <button
                onClick={deleteAllExpiredConfirm ? confirmDeleteAllExpiredDots : confirmDeleteDot}
                className="btn-confirm-delete"
              >
                Xác nhận xóa
              </button>
              <button onClick={() => setShowDeleteConfirmModal(false)} className="btn-cancel">Hủy</button>
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

      {/* Giao diện chính */}
      <div className="dot-container">
        <h2>DANH SÁCH CÁC ĐỢT THỰC TẬP</h2>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Đóng' : 'Thêm đợt thực tập'}
        </button>

        {showAddForm && (
          <div className="modal-overlay">
            <div className="add-form-modal">
              <h3>THÊM ĐỢT THỰC TẬP</h3>
              <input name="tenDotThucTap" placeholder="Tên đợt thực tập" value={formData.tenDotThucTap} onChange={handleInputChange} />
              <input type="date" name="ngayBatDau" value={formData.ngayBatDau} onChange={handleInputChange} />
              <input name="soThang" type="number" placeholder="Số tháng" value={formData.soThang} onChange={handleInputChange} />
              <input name="doiTuongDangKy" placeholder="Đối tượng đăng ký" value={formData.doiTuongDangKy} onChange={handleInputChange} />
              <input name="moTa" placeholder="Mô tả" value={formData.moTa} onChange={handleInputChange} />
              <select name="maLoaiThucTap" value={formData.maLoaiThucTap} onChange={handleInputChange}>
                {internshipTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.label}</option>
                ))}
              </select>
              <div className="button-row">
                <button className="add-btn" onClick={handleAddDotThucTap}>Lưu đợt thực tập</button>
                <button className="cancel-btn" onClick={() => setShowAddForm(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        <div className="dot-card-section">
          <h3>🟢 ĐỢT THỰC TẬP CÒN HẠN:</h3>
          <div className="dot-card-list">
            {dotConHan.map(dot => (
              <div
                key={dot.maDotThucTap}
                className={`dot-card ${
                  dot.tenLoaiThucTap === 'Thực tập sớm' ? 'sinhvien-som' :
                  dot.tenLoaiThucTap === 'Thực tập đúng đợt' ? 'sinhvien-dungdot' :
                  dot.tenLoaiThucTap === 'Thực tập lại' ? 'sinhvien-lai' :
                  dot.tenLoaiThucTap === 'Thực tập liên thông' ? 'sinhvien-lienthong' : ''
                }`}
                onClick={() => handleCardClick(dot)}
              >
                <h3>{dot.tenDotThucTap}</h3>
                <p><strong>Ngày bắt đầu:</strong> {formatDate(dot.ngayBatDau)}</p>
                <p><strong>Đối tượng:</strong> {dot.doiTuongDangKy}</p>
                <p><strong>Loại:</strong> {dot.tenLoaiThucTap}</p>
                <p><strong>Mô tả:</strong> {dot.moTa}</p>
              </div>
            ))}
          </div>

          <div className="expired-header">
            <h3>🔴 ĐỢT THỰC TẬP HẾT HẠN:</h3>
            <button className="delete-all-btn" onClick={handleDeleteAllExpiredDots}>🗑 Xóa tất cả các đợt hết hạn</button>
          </div>

          <div className="dot-card-list">
            {dotHetHan.map(dot => (
              <div
                key={dot.maDotThucTap}
                className={`dot-card ${
                  dot.tenLoaiThucTap === 'Thực tập sớm' ? 'sinhvien-som' :
                  dot.tenLoaiThucTap === 'Thực tập đúng đợt' ? 'sinhvien-dungdot' :
                  dot.tenLoaiThucTap === 'Thực tập lại' ? 'sinhvien-lai' :
                  dot.tenLoaiThucTap === 'Thực tập liên thông' ? 'sinhvien-lienthong' : ''
                }`}
                onClick={() => handleCardClick(dot)}
              >
                <h3>{dot.tenDotThucTap}</h3>
                <p><strong>Ngày bắt đầu:</strong> {formatDate(dot.ngayBatDau)}</p>
                <p><strong>Đối tượng:</strong> {dot.doiTuongDangKy}</p>
                <p><strong>Loại:</strong> {dot.tenLoaiThucTap}</p>
                <p><strong>Mô tả:</strong> {dot.moTa}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DanhSachCacDotThucTap;