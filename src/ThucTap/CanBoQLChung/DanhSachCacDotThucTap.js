import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DanhSachCacDotThucTap.css';
import { useNavigate } from 'react-router-dom';

const DanhSachCacDotThucTap = () => {
  const [dotThucTapList, setDotThucTapList] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    tenDotThucTap: '',
    ngayBatDau: '',
    soThang: '',
    doiTuongDangKy: '',
    moTa: '',
    maLoaiThucTap: '',
    isDelete: false
  });
  const [loaiThucTapList, setLoaiThucTapList] = useState([]);
  const [filterLoai, setFilterLoai] = useState('Tất cả');
  const [filterMonth, setFilterMonth] = useState('Tất cả');
  const [filterYear, setFilterYear] = useState('Tất cả');
  const [selectedDot, setSelectedDot] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://118.69.126.49:5225/api/DotThucTap')
      .then(response => {
        setDotThucTapList(response.data);
      })
      .catch(error => console.error('Lỗi khi tải đợt thực tập:', error));

    axios.get('http://118.69.126.49:5225/api/LoaiThucTap')
      .then(res => setLoaiThucTapList(res.data))
      .catch(err => console.error('Lỗi khi tải loại thực tập:', err));
  }, []);

  const handleCardClick = (dot) => {
    setSelectedDot({ ...dot });
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddDotThucTap = () => {
    axios.post('http://118.69.126.49:5225/api/DotThucTap', {
      ...formData,
      maDotThucTap: 0,
      soThang: parseInt(formData.soThang),
      maLoaiThucTap: parseInt(formData.maLoaiThucTap)
    }).then(res => {
      setDotThucTapList(prev => [...prev, res.data]);
      setFormData({
        tenDotThucTap: '',
        ngayBatDau: '',
        soThang: '',
        doiTuongDangKy: '',
        moTa: '',
        maLoaiThucTap: '',
        isDelete: false
      });
      setShowForm(false);
    }).catch(err => console.error("Lỗi khi thêm đợt thực tập:", err));
  };

  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setSelectedDot(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveUpdate = () => {
    axios.put(`http://118.69.126.49:5225/api/DotThucTap/${selectedDot.maDotThucTap}`, {
      ...selectedDot,
      soThang: parseInt(selectedDot.soThang),
      maLoaiThucTap: parseInt(selectedDot.maLoaiThucTap)
    })
      .then(res => {
        setDotThucTapList(prev => prev.map(dot =>
          dot.maDotThucTap === selectedDot.maDotThucTap ? res.data : dot
        ));
        setSelectedDot(null);
      })
      .catch(err => console.error('Lỗi khi cập nhật:', err));
  };

  const handleDeleteDot = (maDotThucTap) => {
    if (window.confirm('Bạn có chắc chắn muốn xoá đợt thực tập này không?')) {
      axios.delete(`http://118.69.126.49:5225/api/DotThucTap/delete/${maDotThucTap}`)
        .then(() => {
          setDotThucTapList(prev => prev.filter(dot => dot.maDotThucTap !== maDotThucTap));
          setSelectedDot(null);
        })
        .catch(err => console.error('Lỗi khi xoá:', err));
    }
  };
  

  return (
    <div className="dot-container">
      <h2>DANH SÁCH CÁC ĐỢT THỰC TẬP</h2>

      <button className="add-btn" onClick={() => setShowForm(!showForm)}>
        {showForm ? 'Đóng' : 'Thêm đợt thực tập'}
      </button>

      {showForm && (
        <div className="add-form">
          <input type="text" name="tenDotThucTap" placeholder="Tên đợt thực tập" value={formData.tenDotThucTap} onChange={handleInputChange} />
          <input type="date" name="ngayBatDau" placeholder="Ngày bắt đầu" value={formData.ngayBatDau} onChange={handleInputChange} />
          <input type="number" name="soThang" placeholder="Số tháng" value={formData.soThang} onChange={handleInputChange} />
          <input type="text" name="doiTuongDangKy" placeholder="Đối tượng đăng ký" value={formData.doiTuongDangKy} onChange={handleInputChange} />
          <input type="text" name="moTa" placeholder="Mô tả" value={formData.moTa} onChange={handleInputChange} />
          <select name="maLoaiThucTap" value={formData.maLoaiThucTap} onChange={handleInputChange}>
            <option value="">-- Chọn loại thực tập --</option>
            {loaiThucTapList.map(loai => (
              <option key={loai.maLoaiThucTap} value={loai.maLoaiThucTap}>
                {loai.tenLoaiThucTap}
              </option>
            ))}
          </select>
          <button className="add-btn" onClick={handleAddDotThucTap}>Lưu đợt thực tập</button>
        </div>
      )}

      <div className="filter-bar">
        <label>Lọc theo loại:</label>
        <select value={filterLoai} onChange={(e) => setFilterLoai(e.target.value)}>
          <option value="Tất cả">Tất cả</option>
          {loaiThucTapList.map(loai => (
            <option key={loai.maLoaiThucTap} value={loai.tenLoaiThucTap}>
              {loai.tenLoaiThucTap}
            </option>
          ))}
        </select>

        <label>Lọc theo tháng:</label>
        <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)}>
          <option value="Tất cả">Tất cả</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>{`Tháng ${i + 1}`}</option>
          ))}
        </select>

        <label>Lọc theo năm:</label>
        <select value={filterYear} onChange={(e) => setFilterYear(e.target.value)}>
          <option value="Tất cả">Tất cả</option>
          {[...new Set(dotThucTapList.map(dot => new Date(dot.ngayBatDau).getFullYear()))]
            .sort((a, b) => b - a)
            .map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
        </select>
      </div>

      <div className="dot-card-list">
        {dotThucTapList
          .filter(dot => {
            const date = new Date(dot.ngayBatDau);
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            return (
              (filterLoai === 'Tất cả' || dot.tenLoaiThucTap === filterLoai) &&
              (filterMonth === 'Tất cả' || month === parseInt(filterMonth)) &&
              (filterYear === 'Tất cả' || year === parseInt(filterYear))
            );
          })
          .map((dot) => (
            <div
              key={dot.maDotThucTap}
              className={`dot-card ${
                dot.tenLoaiThucTap === 'Thực tập sớm' ? 'sinhvien-som' :
                dot.tenLoaiThucTap === 'Thực tập đúng đợt' ? 'sinhvien-dungdot' :
                dot.tenLoaiThucTap === 'Thực tập lại' ? 'sinhvien-lai' : ''
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

      {selectedDot && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Chỉnh sửa đợt thực tập</h3>
            <input type="text" name="tenDotThucTap" value={selectedDot.tenDotThucTap} onChange={handleModalChange} />
            <input type="date" name="ngayBatDau" value={selectedDot.ngayBatDau?.slice(0, 10)} onChange={handleModalChange} />
            <input type="number" name="soThang" value={selectedDot.soThang} onChange={handleModalChange} />
            <input type="text" name="doiTuongDangKy" value={selectedDot.doiTuongDangKy} onChange={handleModalChange} />
            <input type="text" name="moTa" value={selectedDot.moTa} onChange={handleModalChange} />
            <select name="maLoaiThucTap" value={selectedDot.maLoaiThucTap} onChange={handleModalChange}>
              <option value="">-- Chọn loại thực tập --</option>
              {loaiThucTapList.map(loai => (
                <option key={loai.maLoaiThucTap} value={loai.maLoaiThucTap}>
                  {loai.tenLoaiThucTap}
                </option>
              ))}
            </select>
            <div className="modal-buttons">
              <button onClick={handleSaveUpdate}>Lưu</button>
              <button onClick={() => setSelectedDot(null)}>Đóng</button>
              <button className="delete-btn" onClick={() => handleDeleteDot(selectedDot.maDotThucTap)}>Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DanhSachCacDotThucTap;