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
  const [filterLoai, setFilterLoai] = useState('Tất cả');
  const [filterMonth, setFilterMonth] = useState('Tất cả');
  const [filterYear, setFilterYear] = useState('Tất cả');

  const [availableDonVi, setAvailableDonVi] = useState([]);
  const [donViTrongDot, setDonViTrongDot] = useState([]);
  const [showDonViModal, setShowDonViModal] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
<<<<<<< HEAD
    axios.get('http://118.69.126.49:5225/api/DotThucTap')
      .then(response => {
        setDotThucTapList(response.data);
      })
      .catch(error => console.error('Lỗi khi tải đợt thực tập:', error));

    axios.get('http://118.69.126.49:5225/api/LoaiThucTap')
      .then(res => setLoaiThucTapList(res.data))
      .catch(err => console.error('Lỗi khi tải loại thực tập:', err));
=======
    const fetchData = async () => {
      try {
        const res = await axios.get('http://118.69.126.49:5225/api/DotThucTap');
        setDotThucTapList(
          res.data.map(dot => ({
            ...dot,
            tenLoaiThucTap:
              internshipTypes.find(t => t.id === dot.maLoaiThucTap)?.label || ''
          }))
        );
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
>>>>>>> ea1f53b (code moi nhat)
  }, []);

  const formatDate = dateString => new Date(dateString).toLocaleDateString('vi-VN');

  const handleInputChange = e => {
    const { name, value } = e.target;
    let newValue = name === 'maLoaiThucTap' ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSelectedChange = e => {
    const { name, value } = e.target;
    let newValue = name === 'maLoaiThucTap' ? parseInt(value, 10) : value;
    setSelectedDot(prev => ({ ...prev, [name]: newValue }));
  };

<<<<<<< HEAD
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
=======
  const handleAddDotThucTap = async () => {
    try {
      const payload = {
        ...formData,
        soThang: parseInt(formData.soThang, 10),
        isDelete: false
      };
      const res = await axios.post('http://118.69.126.49:5225/api/DotThucTap', payload);
      const newDot = {
        maDotThucTap: res.data.MaDotThucTap,
        ...payload,
        tenLoaiThucTap:
          internshipTypes.find(t => t.id === payload.maLoaiThucTap).label
      };
      setDotThucTapList(prev => [newDot, ...prev]);
>>>>>>> ea1f53b (code moi nhat)
      setFormData({
        tenDotThucTap: '',
        ngayBatDau: '',
        soThang: '',
        doiTuongDangKy: '',
        moTa: '',
        maLoaiThucTap: internshipTypes[0].id
      });
<<<<<<< HEAD
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
=======
      setShowAddForm(false);
    } catch (err) {
      console.error('Lỗi khi thêm đợt thực tập:', err);
>>>>>>> ea1f53b (code moi nhat)
    }
  };

  const handleCardClick = async dot => {
    setSelectedDot({ ...dot, ngayBatDau: dot.ngayBatDau.slice(0, 10) });
    try {
      const resDVTrongDot = await axios.get(`http://118.69.126.49:5225/api/DonViThucTapTheoDot/${dot.maDotThucTap}`);
      setDonViTrongDot(resDVTrongDot.data);

      const resAllDV = await axios.get('http://118.69.126.49:5225/api/DonViThucTap');
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
        prev.map(d =>
          d.maDotThucTap === selectedDot.maDotThucTap
            ? {
                ...d,
                tenDotThucTap: payload.TenDotThucTap,
                ngayBatDau: payload.NgayBatDau,
                soThang: payload.SoThang,
                doiTuongDangKy: payload.DoiTuongDangKy,
                moTa: payload.MoTa,
                maLoaiThucTap: payload.MaLoaiThucTap,
                tenLoaiThucTap: internshipTypes.find(t => t.id === payload.MaLoaiThucTap).label
              }
            : d
        )
      );
      setSelectedDot(null);
    } catch (err) {
      console.error('Lỗi khi cập nhật:', err);
    }
  };

  const handleToggleDonVi = async (dvId) => {
  const isAdded = donViTrongDot.some(d => d.maDonViThucTap === dvId);
  try {
    if (isAdded) {
      await axios.delete(
        `http://118.69.126.49:5225/api/DonViThucTapTheoDot/delete-1Madotdonvi${selectedDot.maDotThucTap}`,
        {
          params: {
            maDonViThucTap: dvId
          }
        }
      );
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



  const filteredList = dotThucTapList.filter(dot => {
    const date = new Date(dot.ngayBatDau);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return (
      (filterLoai === 'Tất cả' || dot.tenLoaiThucTap === filterLoai) &&
      (filterMonth === 'Tất cả' || month === Number(filterMonth)) &&
      (filterYear === 'Tất cả' || year === Number(filterYear))
    );
  });



  const handleDeleteDot = async id => {
  if (window.confirm('Bạn có chắc chắn muốn xoá đợt thực tập này không?')) {
    try {
      await axios.delete(`http://118.69.126.49:5225/api/DotThucTap/delete/${id}`);
      setDotThucTapList(prev => prev.filter(d => d.maDotThucTap !== id));
      setSelectedDot(null);
    } catch (err) {
      console.error('Lỗi khi xoá:', err);
    }
  }
};



  return (
    <>
      {selectedDot && (
        <div className="modalDTT">
          <div className="modal-content">
            <div className="edit-form-and-units">
              <div className="left-form">
                <h3>SỬA ĐỢT THỰC TẬP</h3>
                <input type="text" name="tenDotThucTap" value={selectedDot.tenDotThucTap} onChange={handleSelectedChange} />
                <input type="date" name="ngayBatDau" value={selectedDot.ngayBatDau} onChange={handleSelectedChange} />
                <input type="number" name="soThang" value={selectedDot.soThang} onChange={handleSelectedChange} />
                <input type="text" name="doiTuongDangKy" value={selectedDot.doiTuongDangKy} onChange={handleSelectedChange} />
                <input type="text" name="moTa" value={selectedDot.moTa} onChange={handleSelectedChange} />
                <select name="maLoaiThucTap" value={selectedDot.maLoaiThucTap} onChange={handleSelectedChange}>
                  {internshipTypes.map(type => (
                    <option key={type.id} value={type.id}> {type.label} </option>
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
                  {donViTrongDot.map(dv => (
                    <li key={dv.maDonViThucTap}>{dv.tenDonViThucTap}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

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
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleToggleDonVi(dv.maDonViThucTap)}
                      />
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

      <div className="dot-container">
        <h2>DANH SÁCH CÁC ĐỢT THỰC TẬP</h2>
        <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
          {showAddForm ? 'Đóng' : 'Thêm đợt thực tập'}
        </button>

        {showAddForm && (
  <div className="modal-overlay">
    <div className="add-form-modal">
      <h3>THÊM ĐỢT THỰC TẬP</h3>
      <input
        type="text"
        name="tenDotThucTap"
        placeholder="Tên đợt thực tập"
        value={formData.tenDotThucTap}
        onChange={handleInputChange}
      />
      <input
        type="date"
        name="ngayBatDau"
        value={formData.ngayBatDau}
        onChange={handleInputChange}
      />
      <input
        type="number"
        name="soThang"
        placeholder="Số tháng"
        value={formData.soThang}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="doiTuongDangKy"
        placeholder="Đối tượng đăng ký"
        value={formData.doiTuongDangKy}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="moTa"
        placeholder="Mô tả"
        value={formData.moTa}
        onChange={handleInputChange}
      />
      <select
        name="maLoaiThucTap"
        value={formData.maLoaiThucTap}
        onChange={handleInputChange}
      >
        {internshipTypes.map(type => (
          <option key={type.id} value={type.id}>{type.label}</option>
        ))}
      </select>

      <div className="button-row">
  <button className="add-btn" onClick={handleAddDotThucTap}>
    Lưu đợt thực tập
  </button>
  <button className="cancel-btn" onClick={() => setShowAddForm(false)}>
    Đóng
  </button>
</div>

    </div>
  </div>
)}


        <div className="filter-bar">
          {/* Lọc */}
        </div>

        <div className="dot-card-list">
          {filteredList.map(dot => (
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
