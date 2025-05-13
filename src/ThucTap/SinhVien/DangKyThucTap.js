// DangKyThucTap.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './DangKyThucTap.css';
import { useNavigate } from 'react-router-dom';

const DangKyThucTap = () => {
  // Lấy MSSV và Họ tên từ localStorage
  const savedUsername = localStorage.getItem('username') || '';
  const displayName = localStorage.getItem('tenHienThi') || '';

  const [dotThucTapList, setDotThucTapList] = useState([]);
  const [loaiThucTapList, setLoaiThucTapList] = useState([]);
  const [giangVienList, setGiangVienList] = useState([]);
  const [donViList, setDonViList] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);
  const [selectedDonVi, setSelectedDonVi] = useState(null);
  const [selectedLoai, setSelectedLoai] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [formData, setFormData] = useState({
    mssv: savedUsername,
    maDotThucTap: 0,
    ngayBatDau: '',
    ngayKetThuc: '',
    lanThucTap: 1,
    maDonViThucTap: 0,
    maGiaoVien: '',
    xacNhanChoBaoCao: false,
    ketQuaBaoCao: false,
    diemBaoCao: 0,
    maTinhTrangThucTap: 1,
    tinhTrangXacNhan: 'Đang Xác Nhận...',
    ghiChu: 'Đăng ký thành công, vui lòng nộp Hồ Sơ Thực Tập',
  });
  const [hasRegistered, setHasRegistered] = useState(false);

  const navigate = useNavigate();

  // helper cộng tháng, xử lý tràn ngày
  const addMonths = (dateStr, months) => {
    const d = new Date(dateStr);
    const day = d.getDate();
    d.setMonth(d.getMonth() + months);
    if (d.getDate() !== day) d.setDate(0);
    return d.toISOString().slice(0, 10);
  };

  const formatDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '';

  useEffect(() => {
    // Lấy danh sách đợt, loại, giảng viên, đơn vị
    axios.get('http://118.69.126.49:5225/api/DotThucTap')
      .then(res => setDotThucTapList(res.data))
      .catch(console.error);
    axios.get('http://118.69.126.49:5225/api/LoaiThucTap')
      .then(res => setLoaiThucTapList(res.data))
      .catch(console.error);
    axios.get('http://118.69.126.49:5225/api/GiangVien')
      .then(res => setGiangVienList(res.data))
      .catch(console.error);
    axios.get('http://118.69.126.49:5225/api/DonViThucTap')
      .then(res => setDonViList(res.data))
      .catch(console.error);

    // Kiểm tra nếu đã đăng ký rồi
    axios.get('http://118.69.126.49:5225/api/ChiTietThucTap/get-all')
      .then(res => {
        setHasRegistered(res.data.some(item => item.mssv === savedUsername));
      })
      .catch(console.error);
  }, [savedUsername]);

  const filtered = dotThucTapList.filter(dot => {
    const dt = new Date(dot.ngayBatDau);
    const m = dt.getMonth() + 1, y = dt.getFullYear();
    return (!selectedLoai || dot.maLoaiThucTap === +selectedLoai)
      && (!selectedMonth || m === +selectedMonth)
      && (!selectedYear || y === +selectedYear);
  });

  const handleCardClick = dot => {
    setSelectedDot(dot);
    // set ngày bắt đầu & tự tính kết thúc
    const bd = dot.ngayBatDau.slice(0,10);
    let months = 4;
    switch (dot.tenLoaiThucTap) {
      case 'Thực tập sớm': months = 12; break;
      case 'Liên thông': months = 3; break;
      case 'Thực tập lại': months = 4; break;
      default: months = 4;
    }
    setFormData(prev => ({
      ...prev,
      maDotThucTap: dot.maDotThucTap,
      ngayBatDau: bd,
      ngayKetThuc: addMonths(bd, months)
    }));
  };

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDonViChange = e => {
    handleChange(e);
    const id = +e.target.value;
    setSelectedDonVi(donViList.find(dv => dv.maDonViThucTap === id) || null);
  };

  const handleSubmit = e => {
    e.preventDefault();
    axios.post('http://118.69.126.49:5225/api/ChiTietThucTap/insert-update', formData)
      .then(res => {
        alert(res.data.message);
        setHasRegistered(true);
      })
      .catch(err => alert(err.response?.data?.message || 'Đăng ký thất bại!'));
  };

  return (
    <div className="dot-container">
      <h2>DANH SÁCH CÁC ĐỢT THỰC TẬP</h2>

      <div className="filter-group">
        <label><strong>Loại:</strong></label>
        <select value={selectedLoai} onChange={e=>setSelectedLoai(e.target.value)}>
          <option value="">-- Tất cả --</option>
          {loaiThucTapList.map(l=>(
            <option key={l.maLoaiThucTap} value={l.maLoaiThucTap}>{l.tenLoaiThucTap}</option>
          ))}
        </select>

        <label><strong>Tháng:</strong></label>
        <select value={selectedMonth} onChange={e=>setSelectedMonth(e.target.value)}>
          <option value="">-- Tất cả --</option>
          {[...Array(12)].map((_,i)=>(
            <option key={i+1} value={i+1}>Tháng {i+1}</option>
          ))}
        </select>

        <label><strong>Năm:</strong></label>
        <select value={selectedYear} onChange={e=>setSelectedYear(e.target.value)}>
          <option value="">-- Tất cả --</option>
          {[2023,2024,2025,2026].map(y=>(
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      <div className="dot-card-list">
        {filtered.map(dot=>(
          <div
            key={dot.maDotThucTap}
            className={`dot-card ${
              dot.tenLoaiThucTap==='Thực tập sớm'?'sinhvien-som':
              dot.tenLoaiThucTap==='Thực tập đúng đợt'?'sinhvien-dungdot':
              dot.tenLoaiThucTap==='Thực tập lại'?'sinhvien-lai':''}`}
            onClick={()=>handleCardClick(dot)}
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
        <div className="registration-section">
          {hasRegistered ? (
            <div className="already-registered">
              <h2>Bạn không thể đăng ký được nữa vì bạn đã đăng ký rồi.</h2>
            </div>
          ) : (
            <form className="registration-form" onSubmit={handleSubmit}>
              <h2 className="registration-title">{selectedDot.tenDotThucTap}</h2>

              <label><strong>Họ và tên:</strong>
                <input type="text" value={displayName} readOnly />
              </label>

              <label><strong>Mã số sinh viên:</strong>
                <input type="text" name="mssv" value={formData.mssv} readOnly />
              </label>

              <label><strong>Ngày bắt đầu:</strong>
                <input type="date" name="ngayBatDau" value={formData.ngayBatDau} onChange={handleChange} />
              </label>

              <label><strong>Ngày kết thúc:</strong>
                <input type="date" name="ngayKetThuc" value={formData.ngayKetThuc} readOnly />
              </label>

              <label><strong>Số lần thực tập:</strong>
                <input type="number" name="lanThucTap" value={formData.lanThucTap} onChange={handleChange} />
              </label>

              <label><strong>Đơn vị thực tập:</strong>
                <select
                  name="maDonViThucTap"
                  value={formData.maDonViThucTap}
                  onChange={handleDonViChange}
                  required
                >
                  <option value="">-- Chọn đơn vị --</option>
                  {donViList.map(dv=>(
                    <option key={dv.maDonViThucTap} value={dv.maDonViThucTap}>
                      {dv.tenDonViThucTap}
                    </option>
                  ))}
                </select>
              </label>

              {selectedDonVi && (
                <div className="donvi-info">
                  <h4>{selectedDonVi.tenDonViThucTap || ''}</h4>
                  <p><strong>Địa chỉ:</strong> {selectedDonVi.diaChi || ''}</p>
                  <p><strong>Điện thoại:</strong> {selectedDonVi.dienThoai || ''}</p>
                  <p><strong>Người hướng dẫn:</strong> {selectedDonVi.nguoiHuongDan || ''}</p>
                  <p><strong>Email:</strong> {selectedDonVi.email || ''}</p>
                  <p><strong>Mô tả:</strong> {selectedDonVi.moTa || ''}</p>
                </div>
              )}

              <label>
                <strong>Giảng viên hướng dẫn:</strong>
                <select
                  name="maGiaoVien"
                  value={formData.maGiaoVien}
                  onChange={handleChange}
                  required
                >
                  <option value="">_Chưa có giáo viên</option>
                  {giangVienList.map(gv => (
                    <option key={gv.maGiaoVien} value={gv.maGiaoVien}>
                      {gv.hoTenGiaoVien}
                    </option>
                  ))}
                </select>
              </label>

              <div className="form-buttons">
                <button type="submit">Gửi đăng ký</button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => { setSelectedDot(null); setSelectedDonVi(null); }}
                >
                  Hủy
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default DangKyThucTap;







// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import './DangKyThucTap.css';
// import { useNavigate } from 'react-router-dom';

// const DangKyThucTap = () => {
//   // Lấy MSSV và Họ tên từ localStorage
//   const savedUsername = localStorage.getItem('username') || '';
//   const displayName = localStorage.getItem('tenHienThi') || '';

//   // State
//   const [dotThucTapList, setDotThucTapList] = useState([]);
//   const [loaiThucTapList, setLoaiThucTapList] = useState([]);
//   const [giangVienList, setGiangVienList] = useState([]);
//   const [donViList, setDonViList] = useState([]);
//   const [selectedDot, setSelectedDot] = useState(null);
//   const [selectedDonVi, setSelectedDonVi] = useState(null);
//   const [selectedLoai, setSelectedLoai] = useState('');
//   const [selectedMonth, setSelectedMonth] = useState('');
//   const [selectedYear, setSelectedYear] = useState('');
//   const [formData, setFormData] = useState({
//     mssv: savedUsername,
//     maDotThucTap: 0,
//     ngayBatDau: '',
//     ngayKetThuc: '',
//     lanThucTap: 1,
//     maDonViThucTap: 0,
//     maGiaoVien: '',
//     xacNhanChoBaoCao: false,
//     ketQuaBaoCao: false,
//     diemBaoCao: 0,
//     maTinhTrangThucTap: 1,
//     tinhTrangXacNhan: 'Đang Xác Nhận...',
//     ghiChu: 'Đăng ký thành công, vui lòng nộp Hồ Sơ Thực Tập',
//   });
//   const [hasRegistered, setHasRegistered] = useState(false);

//   const navigate = useNavigate();

//   // Helper: cộng tháng, xử lý tràn ngày
//   const addMonths = (dateStr, months) => {
//     const d = new Date(dateStr);
//     const day = d.getDate();
//     d.setMonth(d.getMonth() + months);
//     if (d.getDate() !== day) d.setDate(0);
//     return d.toISOString().slice(0, 10);
//   };

//   // Helper: định dạng ngày & hiển thị an toàn
//   const formatDate = d => d ? new Date(d).toLocaleDateString('vi-VN') : '';
//   const safe = val => {
//     if (val === null || val === undefined) return '';
//     if (typeof val === 'object') return JSON.stringify(val);
//     return val;
//   };

//   useEffect(() => {
//     // Lấy danh sách đợt
//     axios.get('http://118.69.126.49:5225/api/DotThucTap')
//       .then(res => setDotThucTapList(res.data))
//       .catch(console.error);

//     // Lấy danh sách loại thực tập
//     axios.get('http://118.69.126.49:5225/api/LoaiThucTap')
//       .then(res => setLoaiThucTapList(res.data))
//       .catch(console.error);

//     // Lấy danh sách giảng viên
//     axios.get('http://118.69.126.49:5225/api/GiangVien')
//       .then(res => setGiangVienList(res.data))
//       .catch(console.error);

//     // Lấy và chuẩn hóa danh sách đơn vị thực tập
//     axios.get('http://118.69.126.49:5225/api/DonViThucTap')
//       .then(res => {
//         const data = res.data.map(dv => ({
//           ...dv,
//           tenDonViThucTap: dv.tenDonViThucTap || '',
//           diaChi: dv.diaChi || '',
//           dienThoai: dv.dienThoai || '',
//           nguoiHuongDan: dv.nguoiHuongDan || '',
//           email: dv.email || '',
//           moTa: dv.moTa || '',
//         }));
//         setDonViList(data);
//       })
//       .catch(console.error);

//     // Kiểm tra nếu đã đăng ký rồi
//     axios.get('http://118.69.126.49:5225/api/ChiTietThucTap/get-all')
//       .then(res => {
//         setHasRegistered(res.data.some(item => item.mssv === savedUsername));
//       })
//       .catch(console.error);
//   }, [savedUsername]);

//   // Lọc đợt
//   const filtered = dotThucTapList.filter(dot => {
//     const dt = new Date(dot.ngayBatDau);
//     const m = dt.getMonth() + 1, y = dt.getFullYear();
//     return (!selectedLoai || dot.maLoaiThucTap === +selectedLoai)
//       && (!selectedMonth || m === +selectedMonth)
//       && (!selectedYear || y === +selectedYear);
//   });

//   // Chọn đợt
//   const handleCardClick = dot => {
//     setSelectedDot(dot);
//     const bd = dot.ngayBatDau.slice(0,10);
//     let months = 4;
//     switch (dot.tenLoaiThucTap) {
//       case 'Thực tập sớm': months = 12; break;
//       case 'Liên thông': months = 3; break;
//       case 'Thực tập lại': months = 4; break;
//       default: months = 4;
//     }
//     setFormData(prev => ({
//       ...prev,
//       maDotThucTap: dot.maDotThucTap,
//       ngayBatDau: bd,
//       ngayKetThuc: addMonths(bd, months)
//     }));
//   };

//   // Xử lý thay đổi form
//   const handleChange = e => {
//     const { name, value, type, checked } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: type === 'checkbox' ? checked : value
//     }));
//   };
//   const handleDonViChange = e => {
//     handleChange(e);
//     const id = +e.target.value;
//     const dv = donViList.find(dv => dv.maDonViThucTap === id) || null;
//     setSelectedDonVi(dv);
//   };

//   // Gửi form
//   const handleSubmit = e => {
//     e.preventDefault();
//     axios.post('http://118.69.126.49:5225/api/ChiTietThucTap/insert-update', formData)
//       .then(res => {
//         alert(res.data.message);
//         setHasRegistered(true);
//       })
//       .catch(err => alert(err.response?.data?.message || 'Đăng ký thất bại!'));
//   };

//   return (
//     <div className="dot-container">
//       <h2>DANH SÁCH CÁC ĐỢT THỰC TẬP</h2>

//       <div className="filter-group">
//         <label><strong>Loại:</strong></label>
//         <select value={selectedLoai} onChange={e => setSelectedLoai(e.target.value)}>
//           <option value="">-- Tất cả --</option>
//           {loaiThucTapList.map(l => (
//             <option key={l.maLoaiThucTap} value={l.maLoaiThucTap}>
//               {l.tenLoaiThucTap}
//             </option>
//           ))}
//         </select>

//         <label><strong>Tháng:</strong></label>
//         <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}>
//           <option value="">-- Tất cả --</option>
//           {[...Array(12)].map((_, i) => (
//             <option key={i+1} value={i+1}>Tháng {i+1}</option>
//           ))}
//         </select>

//         <label><strong>Năm:</strong></label>
//         <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)}>
//           <option value="">-- Tất cả --</option>
//           {[2023,2024,2025,2026].map(y => (
//             <option key={y} value={y}>{y}</option>
//           ))}
//         </select>
//       </div>

//       <div className="dot-card-list">
//         {filtered.map(dot => (
//           <div
//             key={dot.maDotThucTap}
//             className={`dot-card ${
//               dot.tenLoaiThucTap === 'Thực tập sớm' ? 'sinhvien-som' :
//               dot.tenLoaiThucTap === 'Thực tập đúng đợt' ? 'sinhvien-dungdot' :
//               dot.tenLoaiThucTap === 'Thực tập lại' ? 'sinhvien-lai' : ''
//             }`}
//             onClick={() => handleCardClick(dot)}
//           >
//             <h3>{dot.tenDotThucTap}</h3>
//             <p><strong>Ngày bắt đầu:</strong> {formatDate(dot.ngayBatDau)}</p>
//             <p><strong>Đối tượng:</strong> {dot.doiTuongDangKy}</p>
//             <p><strong>Loại:</strong> {dot.tenLoaiThucTap}</p>
//             <p><strong>Mô tả:</strong> {dot.moTa}</p>
//           </div>
//         ))}
//       </div>

//       {selectedDot && (
//         <div className="registration-section">
//           {hasRegistered ? (
//             <div className="already-registered">
//               <h2>Bạn đã đăng ký rồi nên không thể đăng ký lại.</h2>
//             </div>
//           ) : (
//             <form className="registration-form" onSubmit={handleSubmit}>
//               <h2 className="registration-title">{selectedDot.tenDotThucTap}</h2>

//               <label><strong>Họ và tên:</strong>
//                 <input type="text" value={displayName} readOnly />
//               </label>

//               <label><strong>Mã số sinh viên:</strong>
//                 <input type="text" name="mssv" value={formData.mssv} readOnly />
//               </label>

//               <label><strong>Ngày bắt đầu:</strong>
//                 <input
//                   type="date"
//                   name="ngayBatDau"
//                   value={formData.ngayBatDau}
//                   onChange={handleChange}
//                 />
//               </label>

//               <label><strong>Ngày kết thúc:</strong>
//                 <input
//                   type="date"
//                   name="ngayKetThuc"
//                   value={formData.ngayKetThuc}
//                   readOnly
//                 />
//               </label>

//               <label><strong>Số lần thực tập:</strong>
//                 <input
//                   type="number"
//                   name="lanThucTap"
//                   value={formData.lanThucTap}
//                   onChange={handleChange}
//                 />
//               </label>

//               <label><strong>Đơn vị thực tập:</strong>
//                 <select
//                   name="maDonViThucTap"
//                   value={formData.maDonViThucTap}
//                   onChange={handleDonViChange}
//                   required
//                 >
//                   <option value="">-- Chọn đơn vị --</option>
//                   {donViList.map(dv => (
//                     <option key={dv.maDonViThucTap} value={dv.maDonViThucTap}>
//                       {dv.tenDonViThucTap}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               {selectedDonVi && (
//                 <div className="donvi-info">
//                   <h4>{safe(selectedDonVi.tenDonViThucTap)}</h4>
//                   <p><strong>Địa chỉ:</strong> {safe(selectedDonVi.diaChi)}</p>
//                   <p><strong>Điện thoại:</strong> {safe(selectedDonVi.dienThoai)}</p>
//                   <p><strong>Người hướng dẫn:</strong> {safe(selectedDonVi.nguoiHuongDan)}</p>
//                   <p><strong>Email:</strong> {safe(selectedDonVi.email)}</p>
//                   <p><strong>Mô tả:</strong> {safe(selectedDonVi.moTa)}</p>
//                 </div>
//               )}

//               <label>
//                 <strong>Giảng viên hướng dẫn:</strong>
//                 <select
//                   name="maGiaoVien"
//                   value={formData.maGiaoVien}
//                   onChange={handleChange}
//                   required
//                 >
//                   <option value="">_Chưa có giáo viên</option>
//                   {giangVienList.map(gv => (
//                     <option key={gv.maGiaoVien} value={gv.maGiaoVien}>
//                       {gv.hoTenGiaoVien}
//                     </option>
//                   ))}
//                 </select>
//               </label>

//               <div className="form-buttons">
//                 <button type="submit">Gửi đăng ký</button>
//                 <button
//                   type="button"
//                   className="cancel-button"
//                   onClick={() => {
//                     setSelectedDot(null);
//                     setSelectedDonVi(null);
//                   }}
//                 >
//                   Hủy
//                 </button>
//               </div>
//             </form>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default DangKyThucTap;
