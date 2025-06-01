// import React, { useEffect, useState, useCallback } from 'react';
// import axios from 'axios';
// import './LichDangKyTT.css';

// const API_URL = process.env.REACT_APP_API_URL;

// const safeText = (value, fallback = 'Không có thông tin') => {
//   if (typeof value === 'string') return value;
//   if (typeof value === 'number') return value.toString();
//   return fallback;
// };

// const LichDangKyTT = () => {
//   const [link, setLink] = useState('');
//   const [donVi, setDonVi] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [tenHienThi, setTenHienThi] = useState('');
//   const maDonViThucTap = localStorage.getItem('maDonViThucTap');

//   const [linkSaved, setLinkSaved] = useState(false); 
//   // New state to control visibility of the link input/button section
//   const [showEditControls, setShowEditControls] = useState(false); 

//   const fetchDonVi = useCallback(async () => {
//     if (!maDonViThucTap) {
//       setLinkSaved(false);
//       return; 
//     }
//     try {
//       setLoading(true);
//       const { data } = await axios.get(`${API_URL}/api/DonViThucTap`);
//       const found = data.find(d => d.maDonViThucTap === parseInt(maDonViThucTap));

//       if (found) {
//         setDonVi(found);
//         const rawLink = found.linkDangKyGioThucTap;
//         if (typeof rawLink === 'string' && rawLink.trim() !== '') {
//           setLink(rawLink);
//           setLinkSaved(true); 
//           setShowEditControls(false); // Hide controls initially if link is found
//         } else {
//           setLink('');
//           setLinkSaved(false); 
//           setShowEditControls(true); // Show controls if no link exists yet
//         }
//       } else {
//         setDonVi(null);
//         setLink('');
//         setLinkSaved(false); 
//         setShowEditControls(true); // Show controls if no unit found
//       }
//     } catch (error) {
//       console.error('Lỗi lấy thông tin đơn vị:', error);
//       setDonVi(null);
//       setLinkSaved(false); 
//       setShowEditControls(true); // Show controls on error
//     } finally {
//       setLoading(false);
//     }
//   }, [maDonViThucTap]);

//   useEffect(() => {
//     const storedTenHienThi = localStorage.getItem('tenHienThi');
//     if (storedTenHienThi) {
//       setTenHienThi(storedTenHienThi); 
//     }
//     fetchDonVi();
//   }, [fetchDonVi]);

//   const handleUpdateLink = async () => {
//     if (!link.trim()) {
//       alert('Vui lòng nhập link trước khi lưu!');
//       return;
//     }

//     setLoading(true);
//     try {
//       const payload = {
//         linkDangKyGioThucTap: link
//       };

//       await axios.put(`${API_URL}/api/DonViThucTap/update/${maDonViThucTap}`, payload);
//       alert('Cập nhật link thành công!');
      
//       await fetchDonVi(); 
//       setLinkSaved(true);
//       setShowEditControls(false); // Hide controls after successful save

//     } catch (error) {
//       console.error('Lỗi cập nhật link:', error);
//       const errorMessage = error.response?.data?.message || 'Cập nhật link thất bại!';
//       alert(errorMessage);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading && !donVi) {
//     return <p>Đang tải thông tin đơn vị...</p>;
//   }

//   if (!donVi && !loading) { 
//     return <p>Không tìm thấy thông tin đơn vị hoặc bạn chưa đăng nhập.</p>;
//   }

//   return (
//     <div style={{ padding: '20px' }}>
//       <h2>LỊCH ĐĂNG KÝ THỰC TẬP</h2>

//       {/* {tenHienThi && (
//         <p>
//           <strong>Người hướng dẫn:</strong> {tenHienThi}
//         </p>
//       )} */}

//       {/* "Sửa Link" button at the corner */}
//       {linkSaved && ( // Only show "Sửa Link" button if a link is saved
//         <div style={{ textAlign: 'right', marginBottom: '10px' }}>
//           <button 
//             onClick={() => setShowEditControls(true)}
//             style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//           >
//             Sửa Link
//           </button>
//         </div>
//       )}

//       {/* Link input and save button - conditionally rendered */}
//       {showEditControls && (
//         <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', background: '#f9f9f9' }}>
//           <h3>{linkSaved ? 'Chỉnh Sửa Link Excel Drive' : 'Thêm Link Drive Excel Mới'}</h3>
//           <input
//             type="text"
//             placeholder="Dán link Google Drive Excel..."
//             value={link}
//             onChange={(e) => setLink(e.target.value)}
//             style={{ width: '98%', padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
//           />

//           <button
//             onClick={handleUpdateLink}
//             disabled={loading} 
//             style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//           >
//             {loading ? 'Đang cập nhật...' : (linkSaved ? 'Lưu Thay Đổi' : 'Lưu Link')}
//           </button>
//           {linkSaved && (
//             <button 
//               onClick={() => setShowEditControls(false)}
//               style={{ marginLeft: '10px', padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
//             >
//               Hủy
//             </button>
//           )}
//         </div>
//       )}

//       {/* Embedded Google Sheet Editor - always visible if link is present */}
//       {linkSaved && link.trim() !== '' ? (
//         <div style={{ height: "70vh", marginTop: "20px", border: "1px solid #ccc", overflow: 'hidden' }}>
//           {/* Removed the extra text here as the sheet itself will be prominent */}
//           <iframe
//             src={link.replace('/edit?usp=sharing', '/edit?usp=drivesdk&rm=minimal') || link} 
//             width="100%"
//             height="100%"
//             style={{ border: "none" }}
//             allowFullScreen
//             title="Google Sheet Editor"
//           ></iframe>
//         </div>
//       ) : (
//         // Message if no link is saved yet and edit controls are not shown
//         !showEditControls && !loading && (
//           <p>Bạn chưa có link Google Sheet được lưu. Vui lòng nhấn "Sửa Link" để thêm.</p>
//         )
//       )}
      
//       {/* If no link is saved and edit controls are shown (first time user) */}
//       {!linkSaved && showEditControls && !loading && (
//         <p>Vui lòng nhập link Google Sheet của bạn vào ô trên để bắt đầu.</p>
//       )}
//     </div>
//   );
// };

// export default LichDangKyTT;
import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import './LichDangKyTT.css';

const API_URL = process.env.REACT_APP_API_URL;

const safeText = (value, fallback = 'Không có thông tin') => {
  if (typeof value === 'string') return value.copy;
  if (typeof value === 'number') return value.toString();
  return fallback;
};

const LichDangKyTT = () => {
  const [link, setLink] = useState('');
  const [donVi, setDonVi] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tenHienThi, setTenHienThi] = useState('');
  const maDonViThucTap = localStorage.getItem('maDonViThucTap');

  const [linkSaved, setLinkSaved] = useState(false);
  const [showEditControls, setShowEditControls] = useState(false);

  const fetchDonVi = useCallback(async () => {
    if (!maDonViThucTap) {
      setLinkSaved(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/DonViThucTap`);
      const found = data.find(d => d.maDonViThucTap === parseInt(maDonViThucTap));

      if (found) {
        setDonVi(found);
        const rawLink = found.linkDangKyGioThucTap;
        if (typeof rawLink === 'string' && rawLink.trim() !== '') {
          setLink(rawLink);
          setLinkSaved(true);
          setShowEditControls(false);
        } else {
          setLink('');
          setLinkSaved(false);
          setShowEditControls(true);
        }
      } else {
        setDonVi(null);
        setLink('');
        setLinkSaved(false);
        setShowEditControls(true);
      }
    } catch (error) {
      console.error('Lỗi lấy thông tin đơn vị:', error);
      setDonVi(null);
      setLinkSaved(false);
      setShowEditControls(true);
    } finally {
      setLoading(false);
    }
  }, [maDonViThucTap]);

  useEffect(() => {
    const storedTenHienThi = localStorage.getItem('tenHienThi');
    if (storedTenHienThi) {
      setTenHienThi(storedTenHienThi);
    }
    fetchDonVi();
  }, [fetchDonVi]);

  const handleUpdateLink = async () => {
    if (!link.trim()) {
      alert('Vui lòng nhập link trước khi lưu!');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        linkDangKyGioThucTap: link
      };

      await axios.put(`${API_URL}/api/DonViThucTap/update/${maDonViThucTap}`, payload);
      alert('Cập nhật link thành công!');

      await fetchDonVi();
      setLinkSaved(true);
      setShowEditControls(false);

    } catch (error) {
      console.error('Lỗi cập nhật link:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật link thất bại!';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !donVi) {
    return <p className="LichDangKyTT-message">Đang tải thông tin đơn vị...</p>;
  }

  if (!donVi && !loading) {
    return <p className="LichDangKyTT-message LichDangKyTT-error">Không tìm thấy thông tin đơn vị hoặc bạn chưa đăng nhập.</p>;
  }

  return (
    <div className="LichDangKyTT-container">
      <h2 className="LichDangKyTT-title">LỊCH ĐĂNG KÝ THỰC TẬP</h2>

      {linkSaved && (
        <div className="LichDangKyTT-edit-button-wrapper">
          <button
            onClick={() => setShowEditControls(true)}
            className="LichDangKyTT-button LichDangKyTT-button-primary"
          >
            Sửa Link
          </button>
        </div>
      )}

      {showEditControls && (
        <div className="LichDangKyTT-form-section">
          <h3 className="LichDangKyTT-form-title">
            {linkSaved ? 'Chỉnh Sửa Link Excel Drive' : 'Thêm Link Drive Excel Mới'}
          </h3>
          <input
            type="text"
            placeholder="Dán link Google Drive Excel..."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            className="LichDangKyTT-input"
          />

          {/* Bọc các nút vào một div mới với class LichDangKyTT-button-group */}
          <div className="LichDangKyTT-button-group">
            <button
              onClick={handleUpdateLink}
              disabled={loading}
              className="LichDangKyTT-button LichDangKyTT-button-success"
            >
              {loading ? 'Đang cập nhật...' : (linkSaved ? 'Lưu Thay Đổi' : 'Lưu Link')}
            </button>
            {linkSaved && (
              <button
                onClick={() => setShowEditControls(false)}
                className="LichDangKyTT-button LichDangKyTT-button-danger"
              >
                Hủy
              </button>
            )}
          </div>
        </div>
      )}

      {linkSaved && link.trim() !== '' ? (
        <div className="LichDangKyTT-iframe-container">
          <iframe
            src={link.replace('/edit?usp=sharing', '/edit?usp=drivesdk&rm=minimal') || link}
            className="LichDangKyTT-iframe"
            allowFullScreen
            title="Google Sheet Editor"
          ></iframe>
        </div>
      ) : (
        !showEditControls && !loading && (
          <p className="LichDangKyTT-message">Bạn chưa có link Google Sheet được lưu. Vui lòng nhấn "Sửa Link" để thêm.</p>
        )
      )}

      {!linkSaved && showEditControls && !loading && (
        <p className="LichDangKyTT-message">Vui lòng nhập link Google Sheet của bạn vào ô trên để bắt đầu.</p>
      )}
    </div>
  );
};

export default LichDangKyTT;