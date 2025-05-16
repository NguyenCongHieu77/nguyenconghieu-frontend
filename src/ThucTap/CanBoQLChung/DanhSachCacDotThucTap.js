import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DanhSachCacDotThucTap.css';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDots = async () => {
      try {
        const res = await axios.get('http://118.69.126.49:5225/api/DotThucTap');
        const dataWithType = res.data.map(dot => ({
          ...dot,
          tenLoaiThucTap: internshipTypes.find(t => t.id === dot.maLoaiThucTap)?.label || ''
        }));
        setDotThucTapList(dataWithType);
      } catch (err) {
        console.error('Lỗi khi tải đợt thực tập:', err);
      }
    };
    fetchDots();
  }, []);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString('vi-VN');

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
      const res = await axios.post('http://118.69.126.49:5225/api/DotThucTap', payload);
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
    } catch (err) {
      console.error('Lỗi khi thêm đợt thực tập:', err);
    }
  };

  const handleCardClick = async dot => {
    setSelectedDot({ ...dot, ngayBatDau: dot.ngayBatDau.slice(0, 10) });
    try {
      const [resDVTrongDot, resAllDV] = await Promise.all([
        axios.get(`http://118.69.126.49:5225/api/DonViThucTapTheoDot/${dot.maDotThucTap}`),
        axios.get('http://118.69.126.49:5225/api/DonViThucTap')
      ]);
      setDonViTrongDot(resDVTrongDot.data);
      setAvailableDonVi(resAllDV.data);
    } catch (err) {
      console.error('Lỗi khi lấy đơn vị:', err);
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
      await axios.put('http://118.69.126.49:5225/api/DotThucTap/dotthuctap-update', payload);
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
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
    }
  };

  const handleDeleteDot = async id => {
    if (!window.confirm('Bạn có chắc chắn muốn xoá đợt thực tập này không?')) return;
    try {
      await axios.delete(`http://118.69.126.49:5225/api/DotThucTap/delete/${id}`);
      setDotThucTapList(prev => prev.filter(dot => dot.maDotThucTap !== id));
      setSelectedDot(null);
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
    }
  };

  const handleToggleDonVi = async (dvId) => {
    const isAdded = donViTrongDot.some(d => d.maDonViThucTap === dvId);
    try {
      if (isAdded) {
        await axios.delete(`http://118.69.126.49:5225/api/DonViThucTapTheoDot/delete-1Madotdonvi${selectedDot.maDotThucTap}`, {
          params: { maDonViThucTap: dvId }
        });
      } else {
        await axios.post('http://118.69.126.49:5225/api/DonViThucTapTheoDot', {
          maDotThucTap: selectedDot.maDotThucTap,
          maDonViThucTaps: [dvId]
        });
      }
      const res = await axios.get(`http://118.69.126.49:5225/api/DonViThucTapTheoDot/${selectedDot.maDotThucTap}`);
      setDonViTrongDot(res.data);
    } catch (err) {
      console.error('Lỗi toggle đơn vị:', err);
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

        <div className="dot-card-list">
          {dotThucTapList.map(dot => (
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
    </>
  );
};

export default DanhSachCacDotThucTap;
