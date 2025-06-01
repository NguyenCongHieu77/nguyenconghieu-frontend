
// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './CacDotTotNghiep.css';

// const CacDotTotNghiep = () => {
//   const [dots, setDots] = useState([]);
//   const [editingDot, setEditingDot] = useState(null);
//   const [addingNew, setAddingNew] = useState(false);
//   const [formData, setFormData] = useState({
//     maDotDKTN: '',
//     tenDotDKTN: '',
//     tuNgay: '',
//     denNgay: '',
//     soThang: '',
//     ghiChu: '',
//     isDelete: false
//   });

//   useEffect(() => {
//     fetchDots();
//   }, []);

//   const fetchDots = async () => {
//   try {
//     const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/get-all`);
//     const validDots = response.data.filter(dot => !dot.isDelete);
//     const now = new Date();
//     const dotsWithExpire = validDots.map(dot => {
//       const start = new Date(dot.tuNgay);
//       const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);
//       return { ...dot, isExpired: now > expire };
//     });
//     setDots(dotsWithExpire);
//   } catch (error) {
//     console.error('Lỗi khi lấy dữ liệu đợt tốt nghiệp:', error);
//   }
// };


//   const handleCardClick = (dot) => {
//     setAddingNew(false);
//     setEditingDot(dot);
//     setFormData({
//       ...dot,
//       tuNgay: dot.tuNgay.slice(0, 10),
//       denNgay: dot.denNgay.slice(0, 10)
//     });
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleCancel = () => {
//     setEditingDot(null);
//     setAddingNew(false);
//   };


//   const handleSave = async () => {
//   try {
//     await axios.put(
//       `${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/${formData.maDotDKTN}`,
//       {
//         ...formData,
//         soThang: parseInt(formData.soThang, 10),
//         isDelete: false
//       }
//     );
//     setEditingDot(null);
//     fetchDots();
//   } catch (error) {
//     console.error('Lỗi khi cập nhật:', error);
//   }
// };

// const handleDelete = async () => {
//   if (!window.confirm('Bạn có chắc muốn xóa đợt này?')) return;
//   try {
//     await axios.delete(
//       `${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/${formData.maDotDKTN}`
//     );
//     setEditingDot(null);
//     fetchDots();
//   } catch (error) {
//     console.error('Lỗi khi xóa:', error);
//   }
// };

// const handleDeleteAllExpired = async () => {
//   if (!window.confirm('Bạn có chắc muốn xóa TẤT CẢ các đợt đã hết hạn?')) return;
//   try {
//     const deleteRequests = expiredDots.map(dot =>
//       axios.delete(`${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/${dot.maDotDKTN}`)
//     );
//     await Promise.all(deleteRequests);
//     setEditingDot(null);
//     fetchDots();
//   } catch (error) {
//     console.error('Lỗi khi xóa tất cả đợt hết hạn:', error);
//   }
// };


//   const handleAddNew = () => {
//     setEditingDot(null);
//     setAddingNew(true);
//     setFormData({
//       maDotDKTN: 0,
//       tenDotDKTN: '',
//       tuNgay: '',
//       denNgay: '',
//       soThang: '',
//       ghiChu: '',
//       isDelete: false
//     });
//   };


//   const handleCreate = async () => {
//   try {
//     await axios.post(
//       `${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/insert-dotdktn`,
//       {
//         ...formData,
//         soThang: parseInt(formData.soThang, 10),
//         isDelete: false
//       }
//     );
//     setAddingNew(false);
//     fetchDots();
//   } catch (error) {
//     console.error('Lỗi khi thêm đợt mới:', error);
//   }
// };


//   const nonExpiredDots = dots.filter(dot => !dot.isExpired);
//   const expiredDots = dots.filter(dot => dot.isExpired);
  
//   return (
//     <div className="dktn-wrapper">
//       <h2>CÁC ĐỢT ĐĂNG KÝ TỐT NGHIỆP</h2>

//       {(editingDot || addingNew) && (
//         <div className="dktn-edit-form">
//           <h3>{addingNew ? 'THÊM ĐỢT MỚI' : 'SỬA THÔNG TIN ĐỢT'}</h3>
//           <div className="dktn-field">
//             <label>Tên đợt</label>
//             <input type="text" name="tenDotDKTN" value={formData.tenDotDKTN} onChange={handleChange} />
//           </div>
//           <div className="dktn-field">
//             <label>Từ ngày</label>
//             <input type="date" name="tuNgay" value={formData.tuNgay} onChange={handleChange} />
//           </div>
//           <div className="dktn-field">
//             <label>Đến ngày</label>
//             <input type="date" name="denNgay" value={formData.denNgay} onChange={handleChange} />
//           </div>
//           <div className="dktn-field">
//             <label>Số tháng</label>
//             <input type="number" name="soThang" value={formData.soThang} onChange={handleChange} />
//           </div>
//           <div className="dktn-field">
//             <label>Ghi chú</label>
//             <input type="text" name="ghiChu" value={formData.ghiChu} onChange={handleChange} />
//           </div>
//           <div className="dktn-buttons">
//             {addingNew ? (
//               <button onClick={handleCreate}>Thêm</button>
//             ) : (
//               <>
//                 <button onClick={handleSave}>Lưu</button>
//                 <button onClick={handleDelete} className="danger">Xóa</button>
//               </>
//             )}
//             <button onClick={handleCancel}>Hủy</button>
//           </div>
//         </div>
//       )}

//       <div className="dktn-section">
//         <div className="dktn-section-header">
//           <h3>ĐỢT CÒN HẠN</h3>
//           <button className="add-btn" onClick={handleAddNew}>+ Thêm đợt tốt nghiệp</button>
//         </div>
//         <div className="dktn-dot-list">
//           {nonExpiredDots.map(dot => (
//             <div key={dot.maDotDKTN} className="dktn-dot-card available" onClick={() => handleCardClick(dot)}>
//               <h3>{dot.tenDotDKTN}</h3>
//               <p>{new Date(dot.tuNgay).toLocaleDateString()} – {new Date(dot.denNgay).toLocaleDateString()}</p>
//               {dot.ghiChu && <span className="dktn-note">{dot.ghiChu}</span>}
//               <div className="dktn-badge">Click để sửa</div>
//             </div>
//           ))}
//         </div>
//       </div>

//       <div className="dktn-section">
//         <div className="dktn-section-header">
//           <h3>ĐỢT ĐÃ HẾT HẠN</h3>
//           {expiredDots.length > 0 && (
//             <button className="delete-all-btn" onClick={handleDeleteAllExpired}>Xóa tất cả các đợt hết hạn</button>
//           )}
//         </div>
//         <div className="dktn-dot-list expired">
//           {expiredDots.map(dot => (
//             <div key={dot.maDotDKTN} className="dktn-dot-card expired" onClick={() => handleCardClick(dot)}>
//               <h3>{dot.tenDotDKTN}</h3>
//               <p>{new Date(dot.tuNgay).toLocaleDateString()} – {new Date(dot.denNgay).toLocaleDateString()}</p>
//               {dot.ghiChu && <span className="dktn-note">{dot.ghiChu}</span>}
//               <div className="dktn-badge expired">Hết hạn – Click để sửa</div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CacDotTotNghiep;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CacDotTotNghiep.css';
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Đảm bảo đường dẫn đúng

const CacDotTotNghiep = () => {
  const [dots, setDots] = useState([]);
  const [editingDot, setEditingDot] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [formData, setFormData] = useState({
    maDotDKTN: '',
    tenDotDKTN: '',
    tuNgay: '',
    denNgay: '',
    soThang: '',
    ghiChu: '',
    isDelete: false
  });

  // State mới cho modal xác nhận xóa tất cả
  const [showDeleteAllConfirmModal, setShowDeleteAllConfirmModal] = useState(false);
  // State mới cho modal xác nhận xóa một đợt cụ thể
  const [showDeleteOneConfirmModal, setShowDeleteOneConfirmModal] = useState(false);
  const [dotToDelete, setDotToDelete] = useState(null); // Lưu thông tin đợt cần xóa

  // States cho Notification Card
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success'); // 'success' hoặc 'error'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');


  useEffect(() => {
    fetchDots();
  }, []);

  const fetchDots = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/get-all`);
      const validDots = response.data.filter(dot => !dot.isDelete);
      const now = new Date();
      const dotsWithExpire = validDots.map(dot => {
        const start = new Date(dot.tuNgay);
        // Hết hạn sau 15 ngày kể từ ngày bắt đầu
        const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);
        return { ...dot, isExpired: now > expire };
      });
      setDots(dotsWithExpire);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đợt tốt nghiệp:', error);
      // Hiển thị thông báo lỗi nếu cần
      setNotificationType('error');
      setNotificationMessage('Tải dữ liệu thất bại!');
      setNotificationSubText('Không thể tải danh sách đợt tốt nghiệp.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };


  const handleCardClick = (dot) => {
    setAddingNew(false);
    setEditingDot(dot);
    setFormData({
      ...dot,
      tuNgay: dot.tuNgay.slice(0, 10),
      denNgay: dot.denNgay.slice(0, 10)
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setEditingDot(null);
    setAddingNew(false);
  };


  const handleSave = async () => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/${formData.maDotDKTN}`,
        {
          ...formData,
          soThang: parseInt(formData.soThang, 10),
          isDelete: false
        }
      );
      setEditingDot(null);
      fetchDots();
      setNotificationType('success');
      setNotificationMessage('Cập nhật thành công!');
      setNotificationSubText(`Đợt ${formData.tenDotDKTN} đã được cập nhật.`);
      setShowNotification(true);
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
      setNotificationType('error');
      setNotificationMessage('Cập nhật thất bại!');
      setNotificationSubText(`Không thể cập nhật đợt ${formData.tenDotDKTN}.`);
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  // Hàm hiển thị modal xác nhận xóa một đợt
  const handleDelete = () => {
    setDotToDelete(formData); // Lưu thông tin đợt hiện tại vào state
    setShowDeleteOneConfirmModal(true);
  };

  // Hàm thực hiện xóa một đợt khi xác nhận
  const confirmDeleteOne = async () => {
    setShowDeleteOneConfirmModal(false); // Đóng modal xác nhận
    if (!dotToDelete) return; // Đảm bảo có đợt để xóa

    try {
      await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/${dotToDelete.maDotDKTN}`
      );
      setEditingDot(null); // Đóng form chỉnh sửa
      setDotToDelete(null); // Xóa thông tin đợt cần xóa
      fetchDots(); // Tải lại danh sách
      setNotificationType('success');
      setNotificationMessage('Xóa thành công!');
      setNotificationSubText(`Đợt ${dotToDelete.tenDotDKTN} đã được xóa.`);
      setShowNotification(true);
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
      setNotificationType('error');
      setNotificationMessage('Xóa thất bại!');
      setNotificationSubText(`Không thể xóa đợt ${dotToDelete.tenDotDKTN}.`);
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  // Hàm hiển thị modal xác nhận xóa tất cả
  const handleShowDeleteAllConfirm = () => {
    setShowDeleteAllConfirmModal(true);
  };

  // Hàm thực hiện xóa tất cả đợt hết hạn khi xác nhận
  const confirmDeleteAllExpired = async () => {
    setShowDeleteAllConfirmModal(false); // Đóng modal xác nhận
    try {
      // Lấy danh sách các đợt hết hạn hiện tại để đảm bảo tính chính xác
      const expiredDotsToErase = dots.filter(dot => dot.isExpired);
      
      if (expiredDotsToErase.length === 0) {
        setNotificationType('success');
        setNotificationMessage('Không có đợt nào để xóa!');
        setNotificationSubText('Tất cả các đợt đã hết hạn đã được xóa hoặc không tồn tại.');
        setShowNotification(true);
        setTimeout(() => setShowNotification(false), 5000);
        return;
      }

      const deleteRequests = expiredDotsToErase.map(dot =>
        axios.delete(`${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/${dot.maDotDKTN}`)
      );
      await Promise.all(deleteRequests);
      setEditingDot(null);
      fetchDots(); // Tải lại danh sách sau khi xóa
      setNotificationType('success');
      setNotificationMessage('Xóa tất cả thành công!');
      setNotificationSubText('Tất cả các đợt hết hạn đã được xóa khỏi hệ thống.');
      setShowNotification(true);
    } catch (error) {
      console.error('Lỗi khi xóa tất cả đợt hết hạn:', error);
      setNotificationType('error');
      setNotificationMessage('Xóa tất cả thất bại!');
      setNotificationSubText('Có lỗi xảy ra khi xóa các đợt hết hạn. Vui lòng thử lại.');
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000); // Ẩn thông báo sau 5 giây
    }
  };


  const handleAddNew = () => {
    setEditingDot(null);
    setAddingNew(true);
    setFormData({
      maDotDKTN: 0,
      tenDotDKTN: '',
      tuNgay: '',
      denNgay: '',
      soThang: '',
      ghiChu: '',
      isDelete: false
    });
  };


  const handleCreate = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/DotDangKyTotNghiep/insert-dotdktn`,
        {
          ...formData,
          soThang: parseInt(formData.soThang, 10),
          isDelete: false
        }
      );
      setAddingNew(false);
      fetchDots();
      setNotificationType('success');
      setNotificationMessage('Thêm đợt mới thành công!');
      setNotificationSubText(`Đợt ${formData.tenDotDKTN} đã được thêm.`);
      setShowNotification(true);
    } catch (error) {
      console.error('Lỗi khi thêm đợt mới:', error);
      setNotificationType('error');
      setNotificationMessage('Thêm đợt mới thất bại!');
      setNotificationSubText(`Không thể thêm đợt ${formData.tenDotDKTN}.`);
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };


  const nonExpiredDots = dots.filter(dot => !dot.isExpired);
  const expiredDots = dots.filter(dot => dot.isExpired);

  return (
    <div className="dktn-wrapper">
      <h2>CÁC ĐỢT ĐĂNG KÝ TỐT NGHIỆP</h2>

      {(editingDot || addingNew) && (
        <div className="dktn-edit-form">
          <h3>{addingNew ? 'THÊM ĐỢT MỚI' : 'SỬA THÔNG TIN ĐỢT'}</h3>
          <div className="dktn-field">
            <label>Tên đợt</label>
            <input type="text" name="tenDotDKTN" value={formData.tenDotDKTN} onChange={handleChange} />
          </div>
          <div className="dktn-field">
            <label>Từ ngày</label>
            <input type="date" name="tuNgay" value={formData.tuNgay} onChange={handleChange} />
          </div>
          <div className="dktn-field">
            <label>Đến ngày</label>
            <input type="date" name="denNgay" value={formData.denNgay} onChange={handleChange} />
          </div>
          <div className="dktn-field">
            <label>Số tháng</label>
            <input type="number" name="soThang" value={formData.soThang} onChange={handleChange} />
          </div>
          <div className="dktn-field">
            <label>Ghi chú</label>
            <input type="text" name="ghiChu" value={formData.ghiChu} onChange={handleChange} />
          </div>
          <div className="dktn-buttons">
            {addingNew ? (
              <button onClick={handleCreate}>Thêm</button>
            ) : (
              <>
                <button onClick={handleSave}>Lưu</button>
                <button onClick={handleDelete} className="danger">Xóa</button> {/* Gọi handleDelete */}
              </>
            )}
            <button onClick={handleCancel}>Hủy</button>
          </div>
        </div>
      )}

      <div className="dktn-section">
        <div className="dktn-section-header">
          <h3>ĐỢT CÒN HẠN</h3>
          <button className="add-btn" onClick={handleAddNew}>+ Thêm đợt tốt nghiệp</button>
        </div>
        <div className="dktn-dot-list">
          {nonExpiredDots.map(dot => (
            <div key={dot.maDotDKTN} className="dktn-dot-card available" onClick={() => handleCardClick(dot)}>
              <h3>{dot.tenDotDKTN}</h3>
              <p>{new Date(dot.tuNgay).toLocaleDateString()} – {new Date(dot.denNgay).toLocaleDateString()}</p>
              {dot.ghiChu && <span className="dktn-note">{dot.ghiChu}</span>}
              <div className="dktn-badge">Click để sửa</div>
            </div>
          ))}
        </div>
      </div>

      <div className="dktn-section">
        <div className="dktn-section-header">
          <h3>ĐỢT ĐÃ HẾT HẠN</h3>
          {expiredDots.length > 0 && (
            <button className="delete-all-btn" onClick={handleShowDeleteAllConfirm}>Xóa tất cả các đợt hết hạn</button>
          )}
        </div>
        <div className="dktn-dot-list expired">
          {expiredDots.map(dot => (
            <div key={dot.maDotDKTN} className="dktn-dot-card expired" onClick={() => handleCardClick(dot)}>
              <h3>{dot.tenDotDKTN}</h3>
              <p>{new Date(dot.tuNgay).toLocaleDateString()} – {new Date(dot.denNgay).toLocaleDateString()}</p>
              {dot.ghiChu && <span className="dktn-note">{dot.ghiChu}</span>}
              <div className="dktn-badge expired">Hết hạn – Click để sửa</div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal xác nhận xóa một đợt cụ thể */}
      {showDeleteOneConfirmModal && dotToDelete && (
        <div className="modal-overlay" onClick={() => setShowDeleteOneConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Xác nhận xóa đợt</h3>
            <p>Bạn có chắc chắn muốn xóa đợt **{dotToDelete.tenDotDKTN}**?</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteOneConfirmModal(false)}>Hủy</button>
              <button className="btn-confirm-delete" onClick={confirmDeleteOne}>Xóa</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa tất cả các đợt hết hạn */}
      {showDeleteAllConfirmModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteAllConfirmModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Xác nhận xóa tất cả đợt hết hạn</h3>
            <p>Bạn có chắc chắn muốn xóa **tất cả** các đợt đăng ký tốt nghiệp đã hết hạn? Hành động này không thể hoàn tác.</p>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowDeleteAllConfirmModal(false)}>Hủy</button>
              <button className="btn-confirm-delete" onClick={confirmDeleteAllExpired}>Xóa tất cả</button>
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

export default CacDotTotNghiep;