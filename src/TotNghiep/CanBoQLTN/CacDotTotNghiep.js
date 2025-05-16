import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './CacDotTotNghiep.css';

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

  useEffect(() => {
    fetchDots();
  }, []);

  const fetchDots = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await axios.get('http://118.69.126.49:5225/api/DotDangKyTotNghiep/get-all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const validDots = response.data.filter(dot => !dot.isDelete);
      const now = new Date();
      const dotsWithExpire = validDots.map(dot => {
        const start = new Date(dot.tuNgay);
        const expire = new Date(start.getTime() + 15 * 24 * 60 * 60 * 1000);
        return { ...dot, isExpired: now > expire };
      });
      setDots(dotsWithExpire);
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu đợt tốt nghiệp:', error);
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
      const token = localStorage.getItem('accessToken');
      await axios.put(`http://118.69.126.49:5225/api/DotDangKyTotNghiep/${formData.maDotDKTN}`, {
        ...formData,
        soThang: parseInt(formData.soThang, 10),
        isDelete: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingDot(null);
      fetchDots();
    } catch (error) {
      console.error('Lỗi khi cập nhật:', error);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa đợt này?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      await axios.delete(`http://118.69.126.49:5225/api/DotDangKyTotNghiep/${formData.maDotDKTN}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEditingDot(null);
      fetchDots();
    } catch (error) {
      console.error('Lỗi khi xóa:', error);
    }
  };

  const handleDeleteAllExpired = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa TẤT CẢ các đợt đã hết hạn?')) return;
    try {
      const token = localStorage.getItem('accessToken');
      const deleteRequests = expiredDots.map(dot =>
        axios.delete(`http://118.69.126.49:5225/api/DotDangKyTotNghiep/${dot.maDotDKTN}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      );
      await Promise.all(deleteRequests);
      setEditingDot(null);
      fetchDots();
    } catch (error) {
      console.error('Lỗi khi xóa tất cả đợt hết hạn:', error);
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
      const token = localStorage.getItem('accessToken');
      await axios.post('http://118.69.126.49:5225/api/DotDangKyTotNghiep/insert-dotdktn', {
        ...formData,
        soThang: parseInt(formData.soThang, 10),
        isDelete: false
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddingNew(false);
      fetchDots();
    } catch (error) {
      console.error('Lỗi khi thêm đợt mới:', error);
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
                <button onClick={handleDelete} className="danger">Xóa</button>
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
            <div key={dot.maDotDKTN} className="dktn-dot-card" onClick={() => handleCardClick(dot)}>
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
            <button className="delete-all-btn" onClick={handleDeleteAllExpired}>Xóa tất cả các đợt hết hạn</button>
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
    </div>
  );
};

export default CacDotTotNghiep;
