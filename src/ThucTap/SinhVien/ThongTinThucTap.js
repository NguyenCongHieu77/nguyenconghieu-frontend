import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ThongTinThucTap.css";
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Import NotificationCard

function ThongTinThucTap() {
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [dsHoSo, setDsHoSo] = useState([]);
  const [dsHoSoKetThuc, setDsHoSoKetThuc] = useState([]);
  const [gioThucTap, setGioThucTap] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);

  const [banDauLink, setBanDauLink] = useState("");
  const [ketThucLink, setKetThucLink] = useState("");

  const [showSelection, setShowSelection] = useState(false);
  const [chosenType, setChosenType] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false); // For "Are you sure?"
  const [pendingChoice, setPendingChoice] = useState(null);

  const [dangKyGioLink, setDangKyGioLink] = useState("");
  const [showDangKyGioSheet, setShowDangKyGioSheet] = useState(false);

  // States for general purpose modal (replaces some alerts)
  const [showGeneralModal, setShowGeneralModal] = useState(false);
  const [generalModalMessage, setGeneralModalMessage] = useState("");
  const [generalModalType, setGeneralModalType] = useState(''); // 'info', 'error'

  // States for NotificationCard (replaces most alerts)
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState(''); // 'success', 'error', 'info'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');

  const mssv = localStorage.getItem("username");
  const apiChiTiet = `${process.env.REACT_APP_API_URL}/api/ChiTietThucTap/get-all`;
  const apiGio = `${process.env.REACT_APP_API_URL}/api/GioThucTapSinhVien/get-all`;
  const apiHoSoBanDau = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapBanDau/get-all-ho-so-ban-dau`;
  const apiHoSoKetThuc = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapKetThuc/get-all-ho-so-ket-thuc`;
  const apiUpsertType = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapBanDau/chon-thuc-tap-trong-hoac-ngoai`;
  const apiCapNhatHoSoBanDau = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapBanDau`;
  const apiCapNhatHoSoKetThuc = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapKetThuc/cap-nhat-ho-so`;
  const apiDonViThucTap = `${process.env.REACT_APP_API_URL}/api/DonViThucTap`;

  // Helper functions to close modal/notification
  const closeGeneralModal = () => setShowGeneralModal(false);
  const closeNotification = () => setShowNotification(false);


  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resChiTiet, resGio, resHoSo, resHoSoKT] = await Promise.all([
          axios.get(apiChiTiet),
          axios.get(apiGio),
          axios.get(apiHoSoBanDau),
          axios.get(apiHoSoKetThuc),
        ]);

        setDsHoSo(resHoSo.data);
        setDsHoSoKetThuc(resHoSoKT.data);

        const chiTietFiltered = resChiTiet.data
          .filter(item => item.mssv === mssv)
          .map(item => {
            const tongGio = resGio.data
              .filter(
                g =>
                  g.mssv === mssv &&
                  g.maDotThucTap === item.maDotThucTap &&
                  typeof g.soGioThucTap === "number"
              )
              .reduce((sum, g) => sum + g.soGioThucTap, 0);
            return { ...item, tongSoGio: tongGio };
          });
        setDsChiTiet(chiTietFiltered);
      } catch (err) {
        console.error("Lỗi khi lấy dữ liệu:", err);
        setShowNotification(true);
        setNotificationType('error');
        setNotificationMessage('Lỗi khi tải dữ liệu.');
        setNotificationSubText('Vui lòng thử lại sau.');
      }
    };
    if (mssv) fetchAll();
  }, [mssv, apiChiTiet, apiGio, apiHoSoBanDau, apiHoSoKetThuc]);

  const getStatusColor = (status) => {
    if (status === "Đang Xác Nhận...") return "orange";
    if (status === "Đã xác nhận") return "green";
    if (status === "Bị từ chối") return "red";
    return "black";
  };

  const getReportConfirmColor = (confirmed) => {
    const isTrue = confirmed === true || confirmed === "True";
    return isTrue ? "green" : "red";
  };

  const getReportResultColor = (result) =>
    result === true || result === "True" ? "green" : "red";

  const handleCardClick = dot => {
    if (showDangKyGioSheet) return;
    setSelectedDot(dot);
    const hs = dsHoSo.find(h => h.mssv === dot.mssv && h.maDotThucTap === dot.maDotThucTap);
    if (hs && typeof hs.thucTapNgoai === "boolean") {
      setChosenType(hs.thucTapNgoai ? 1 : 0);
      setShowSelection(false);
    } else {
      setChosenType(null);
      setShowSelection(true);
    }
    setBanDauLink(hs?.hoSoThucTapBanDau || "");
    const hsKt = dsHoSoKetThuc.find(h => h.mssv === dot.mssv && h.maDotThucTap === dot.maDotThucTap);
    setKetThucLink(hsKt?.hoSoThucTapKetThuc || "");
    axios.get(apiGio)
      .then(res => {
        setGioThucTap(res.data.filter(g => g.mssv === dot.mssv && g.maDotThucTap === dot.maDotThucTap));
      })
      .catch(err => {
        console.error("Lỗi khi lấy giờ thực tập:", err);
        setShowNotification(true);
        setNotificationType('error');
        setNotificationMessage('Không tải được giờ thực tập.');
        setNotificationSubText('Vui lòng thử lại.');
      });
  };

  const handleChoiceClick = value => {
    setPendingChoice(value);
    setShowConfirmModal(true);
  };

  const handleModalConfirm = async () => {
    if (!selectedDot) return; // Should not happen if button is only active when selectedDot is set
    setShowConfirmModal(false); // Close the confirmation modal

    try {
      await axios.put(apiUpsertType, {
        MSSV: selectedDot.mssv,
        MaDotThucTap: selectedDot.maDotThucTap,
        ThucTapNgoai: pendingChoice,
      });
      setChosenType(pendingChoice ? 1 : 0);
      setShowSelection(false);
      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Cập nhật loại hình thực tập thành công.');
      setNotificationSubText(`Bạn đã chọn thực tập ${pendingChoice ? 'Ngoài trường' : 'Trong trường'}.`);

      const updatedDsHoSo = dsHoSo.map(h =>
        (h.mssv === selectedDot.mssv && h.maDotThucTap === selectedDot.maDotThucTap)
        ? { ...h, thucTapNgoai: pendingChoice }
        : h
      );
      if (!dsHoSo.find(h => h.mssv === selectedDot.mssv && h.maDotThucTap === selectedDot.maDotThucTap)) {
        updatedDsHoSo.push({ mssv: selectedDot.mssv, maDotThucTap: selectedDot.maDotThucTap, thucTapNgoai: pendingChoice });
      }
      setDsHoSo(updatedDsHoSo);
    } catch (err) {
      console.error("Lỗi khi cập nhật loại hình thực tập:", err);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Cập nhật loại hình thất bại.');
      setNotificationSubText(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setPendingChoice(null);
    }
  };

  const handleModalCancel = () => {
    setShowConfirmModal(false);
    setPendingChoice(null);
  };

  const submitBanDau = async () => {
    setShowNotification(false); // Clear previous notifications
    if (!banDauLink.trim()) {
      setShowGeneralModal(true);
      setGeneralModalType('info');
      setGeneralModalMessage("Vui lòng nhập link hồ sơ ban đầu.");
      return;
    }
    if (!selectedDot) {
      setShowGeneralModal(true);
      setGeneralModalType('info');
      setGeneralModalMessage("Vui lòng chọn đợt thực tập để nộp hồ sơ.");
      return;
    }
    try {
      await axios.post(`${apiCapNhatHoSoBanDau}/cap-nhat-ho-so`, null, {
        params: { MSSV: mssv, MaDotThucTap: selectedDot.maDotThucTap, HoSoThucTapBanDau: banDauLink },
      });
      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Hồ sơ ban đầu đã được gửi/cập nhật thành công.');
      setNotificationSubText('Thông tin hồ sơ đăng ký thực tập của bạn đã được lưu.');

      setDsHoSo(prev => prev.map(hs => hs.mssv === selectedDot.mssv && hs.maDotThucTap === selectedDot.maDotThucTap ? { ...hs, hoSoThucTapBanDau: banDauLink } : hs));
      // If the HoSo entry didn't exist before, add it
      if (!dsHoSo.some(hs => hs.mssv === selectedDot.mssv && hs.maDotThucTap === selectedDot.maDotThucTap)) {
        setDsHoSo(prev => [...prev, { mssv: selectedDot.mssv, maDotThucTap: selectedDot.maDotThucTap, hoSoThucTapBanDau: banDauLink }]);
      }
    } catch (err) {
      console.error("Lỗi nộp hồ sơ ban đầu:", err);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Nộp hồ sơ ban đầu thất bại.');
      setNotificationSubText(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const submitKetThuc = async () => {
    setShowNotification(false); // Clear previous notifications
    if (!ketThucLink.trim()) {
      setShowGeneralModal(true);
      setGeneralModalType('info');
      setGeneralModalMessage("Vui lòng nhập link hồ sơ kết thúc.");
      return;
    }
    if (!selectedDot) {
      setShowGeneralModal(true);
      setGeneralModalType('info');
      setGeneralModalMessage("Vui lòng chọn đợt thực tập để nộp hồ sơ.");
      return;
    }
    try {
      await axios.post(apiCapNhatHoSoKetThuc, null, {
        params: { MSSV: mssv, MaDotThucTap: selectedDot.maDotThucTap, HoSoThucTapKetThuc: ketThucLink },
      });
      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage('Hồ sơ kết thúc đã được gửi/cập nhật thành công.');
      setNotificationSubText('Thông tin hồ sơ kết thúc thực tập của bạn đã được lưu.');

      setDsHoSoKetThuc(prev => prev.map(hskt => hskt.mssv === selectedDot.mssv && hskt.maDotThucTap === selectedDot.maDotThucTap ? { ...hskt, hoSoThucTapKetThuc: ketThucLink } : hskt));
      // If the HoSoKetThuc entry didn't exist before, add it
      if (!dsHoSoKetThuc.some(hskt => hskt.mssv === selectedDot.mssv && hskt.maDotThucTap === selectedDot.maDotThucTap)) {
        setDsHoSoKetThuc(prev => [...prev, { mssv: selectedDot.mssv, maDotThucTap: selectedDot.maDotThucTap, hoSoThucTapKetThuc: ketThucLink }]);
      }
    } catch (err) {
      console.error("Lỗi nộp hồ sơ kết thúc:", err);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Nộp hồ sơ kết thúc thất bại.');
      setNotificationSubText(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const handleDangKyGioClick = async (selectedItem) => {
    setSelectedDot(null); // Clear selected dot when opening the sheet
    setShowNotification(false); // Clear any existing notifications

    try {
      const response = await axios.get(apiDonViThucTap);
      const donVi = response.data.find(dv => dv.tenDonViThucTap === selectedItem.tenDonViThucTap);

      if (donVi && donVi.linkDangKyGioThucTap) {
        let rawLink = donVi.linkDangKyGioThucTap;
        let embedLink = rawLink;

        if (typeof rawLink === 'string' && rawLink.trim() !== '') {
          embedLink = rawLink.replace('/edit?usp=sharing', '/edit?usp=drivesdk&rm=minimal');
        }

        setDangKyGioLink(embedLink);
        setShowDangKyGioSheet(true);
      } else {
        setShowGeneralModal(true);
        setGeneralModalType('info');
        setGeneralModalMessage("Không tìm thấy link đăng ký giờ thực tập cho đơn vị này hoặc link không hợp lệ.");
        setDangKyGioLink("");
        setShowDangKyGioSheet(false);
      }
    } catch (err) {
      console.error("Lỗi khi lấy link đăng ký giờ:", err);
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage('Lỗi khi lấy link đăng ký giờ thực tập.');
      setNotificationSubText('Vui lòng thử lại.');
      setDangKyGioLink("");
      setShowDangKyGioSheet(false);
    }
  };

  const currentHoSo = dsHoSo.find(h => selectedDot && h.mssv === selectedDot.mssv && h.maDotThucTap === selectedDot.maDotThucTap);
  const currentHoSoKetThuc = dsHoSoKetThuc.find(h => selectedDot && h.mssv === selectedDot.mssv && h.maDotThucTap === selectedDot.maDotThucTap);

  return (
    <div className="thongtin-container">
      <h2>THÔNG TIN THỰC TẬP CỦA BẠN</h2>

      {!showDangKyGioSheet && (
        <>
          <div className="card-container">
            {dsChiTiet.length > 0 ? dsChiTiet.map((item, idx) => (
              <div className="card" key={idx}>
                <div className="card-content" onClick={() => handleCardClick(item)} style={{ cursor: 'pointer', paddingBottom: '10px' }}>
                  <h3>{item.hoSinhVien} {item.tenSinhVien}</h3>
                  <p><strong>MSSV:</strong> {item.mssv}</p>
                  <p><strong>Đợt:</strong> {item.tenDotThucTap}</p>
                  <p><strong>Đơn vị:</strong> {item.tenDonViThucTap}</p>
                  <p><strong>GV hướng dẫn:</strong> {item.hoTenGiaoVien}</p>
                  <p><strong>Trạng thái duyệt:</strong> <span style={{ color: getStatusColor(item.tinhTrangXacNhan) }}>{item.tinhTrangXacNhan}</span></p>
                  <p><strong>Xác nhận cho báo cáo:</strong> <span style={{ color: getReportConfirmColor(item.xacNhanChoBaoCao) }}>{(item.xacNhanChoBaoCao === true || item.xacNhanChoBaoCao === "True") ? "Được Báo Cáo" : "Không Được Báo Cáo"}</span></p>
                  <p><strong>Tổng giờ:</strong> {item.tongSoGio} giờ</p>
                  <p><strong>Điểm báo cáo:</strong> {item.diemBaoCao || 'Chưa có'}</p>
                  <p><strong>Kết quả báo cáo:</strong> <span style={{ color: getReportResultColor(item.ketQuaBaoCao) }}>{(item.ketQuaBaoCao === true || item.ketQuaBaoCao === "True") ? "Đạt" : "Không Đạt"}</span></p>
                </div>
                {item.tinhTrangXacNhan === "Đã xác nhận" && (
                  <button className="btn-dang-ky-gio" onClick={() => handleDangKyGioClick(item)} style={{ marginTop: "10px", padding: "8px 12px", cursor: "pointer", width: '100%' }}>
                    Đăng ký giờ thực tập
                  </button>
                )}
              </div>
            )) : (
              <div className="card status-text">Không tìm thấy thông tin thực tập của bạn.</div>
            )}
          </div>

          {selectedDot && (
            <div className="detail-section">
              <h3>Đợt {selectedDot.tenDotThucTap}</h3>
              {showSelection ? (
                <div className="loai-section">
                  <p>Bạn thực tập ngoài trường?</p>
                  <button className="btn-yes" onClick={() => handleChoiceClick(true)}>Có</button>
                  <button className="btn-no" onClick={() => handleChoiceClick(false)}>Không</button>
                </div>
              ) : (
                <div className="loai-section">
                  <p><strong>Loại hình đã chọn:</strong> {chosenType === null ? "Chưa chọn" : (chosenType === 1 ? "Ngoài trường" : "Trong trường")}</p>
                  {((chosenType === null || (currentHoSo && (currentHoSo.thucTapNgoai === null || typeof currentHoSo.thucTapNgoai === "undefined"))) && selectedDot.tinhTrangXacNhan !== "Đã xác nhận") &&
                    <button className="btn-edit" onClick={() => setShowSelection(true)}>Chọn</button>
                  }
                  {(chosenType !== null && (currentHoSo && (currentHoSo.thucTapNgoai !== null && typeof currentHoSo.thucTapNgoai !== "undefined")) && selectedDot.tinhTrangXacNhan !== "Đã xác nhận") &&
                    <button className="btn-edit" onClick={() => setShowSelection(true)}>Sửa</button>
                  }
                   {selectedDot.tinhTrangXacNhan === "Đã xác nhận" && (
                    <p style={{color: 'gray', fontSize: '0.9em'}}>Không thể sửa loại hình thực tập khi đã được xác nhận.</p>
                   )}
                </div>
              )}
              <table className="gio-table">
                <thead><tr><th>Tháng</th><th>Số giờ</th><th>GV xác nhận</th></tr></thead>
                <tbody>
                  {gioThucTap.length > 0 ? gioThucTap.map((g, i) => (<tr key={i}><td>{typeof g.thang === "number" ? g.thang : "-"}</td><td>{typeof g.soGioThucTap === "number" ? g.soGioThucTap : "-"}</td><td>{g.xacNhanGiaovien ? "✅" : "❌"}</td></tr>))
                    : (<tr><td colSpan="3" style={{ textAlign: "center" }}>Chưa có dữ liệu giờ thực tập</td></tr>)}
                </tbody>
              </table>
              <div className="hoso"><h3>HỒ SƠ ĐĂNG KÝ THỰC TẬP ĐÃ NỘP</h3></div>
              {currentHoSo && (<table className="confirm-table"><thead><tr><th>ĐƠN ĐĂNG KÝ ĐƠN VỊ THỰC TẬP</th><th>ĐƠN TIẾP NHẬN SINH VIÊN THỰC TẬP</th><th>ĐƠN CAM KẾT TỰ TÌM ĐƠN VỊ THỰC TẬP</th></tr></thead><tbody><tr><td>{currentHoSo.xacNhanCBQLDaNopDonDangKyDonViThucTap ? "✅" : "❌"}</td><td>{currentHoSo.xacNhanCBQLDaNopGiayTiepNhanSVThucTap ? "✅" : "❌"}</td><td>{currentHoSo.xacNhanCBQLDaNopDonCamKetTuTimDVTT ? "✅" : "❌"}</td></tr></tbody></table>)}
              <div className="hoso"><h3>HỒ SƠ KẾT THÚC THỰC TẬP ĐÃ NỘP</h3></div>
              {currentHoSoKetThuc && (<table className="confirm-table"><thead><tr><th>Sổ nhật ký</th><th>Giấy TN SVTT</th><th>Phiếu ĐG DVTT</th><th>Phiếu ĐG NVHDTT</th><th>Cam kết DVTT</th><th>Cuốn báo cáo</th><th>Hợp đồng lao động</th></tr></thead><tbody><tr><td>{currentHoSoKetThuc.xacNhanCBQLDaNopSoNhatKyThucTap ? "✅" : "❌"}</td><td>{currentHoSoKetThuc.xacNhanCBQLDaNopGiayTiepNhanSVThucTap ? "✅" : "❌"}</td><td>{currentHoSoKetThuc.xacNhanCBQLDaNopPhieuNhanXetCuaDVTT ? "✅" : "❌"}</td><td>{currentHoSoKetThuc.xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap ? "✅" : "❌"}</td><td>{currentHoSoKetThuc.xacNhanCBQLDaNopDonCamKetTuTimDVTT ? "✅" : "❌"}</td><td>{currentHoSoKetThuc.xacNhanCBQLDaNopCuonBaoCao ? "✅" : "❌"}</td><td>{currentHoSoKetThuc.xacNhanCBQLDaNopHopDongLaoDong ? "✅" : "❌"}</td></tr></tbody></table>)}
              <div className="hoso-forms">
                <div className="hoso-ban-dau">
                  {currentHoSo?.hoSoThucTapBanDau ? (<><h4>Hồ sơ đăng ký thực tập đã nộp</h4><p>Link hồ sơ đăng ký thực tập: <a href={currentHoSo.hoSoThucTapBanDau} target="_blank" rel="noopener noreferrer">{currentHoSo.hoSoThucTapBanDau}</a></p><h4>Sửa hồ sơ đăng ký thực tập</h4><input value={banDauLink} onChange={e => setBanDauLink(e.target.value)} placeholder="Link hồ sơ ban đầu" /><button onClick={submitBanDau}>Cập nhật hồ sơ đăng ký thực tập</button></>)
                    : (<><h4>Nộp hồ sơ đăng ký thực tập</h4><input value={banDauLink} onChange={e => setBanDauLink(e.target.value)} placeholder="Link Drive hồ sơ ban đầu" /><button onClick={submitBanDau}>Nộp hồ sơ đăng ký thực tập</button></>)}
                  <div className="hoso-note"><p><strong>Bản cứng & Bản mềm Hồ sơ gồm các giấy tờ sau</strong> (Nộp bản photo. Bản chính giữ lại và nộp khi nộp hồ sơ báo cáo thực tập) (Tạo File Drive có tên "Lớp-MSSV-HoVaTen" add 3 bản PDF bên dưới vào file và sao chép link file và nộp ở trên):</p><ul><li><a href="https://docs.google.com/document/d/1wspGE0kSlCY8d8Vi3YdvKtiS9qTIjnwe/edit?tab=t.0" target="_blank" rel="noopener noreferrer">Đơn đăng ký đơn vị thực tập</a></li><li><a href="https://docs.google.com/document/d/1oiaO4rsAKrceheGp2gA7fWw8NprKOWXD/edit?tab=t.0" target="_blank" rel="noopener noreferrer">Giấy tiếp nhận sinh viên thực tập</a></li><li><a href="https://docs.google.com/document/d/1TOLc5IrJsiZOhwuEzFp4mWC3SJAk4Y9P/edit?tab=t.0" target="_blank" rel="noopener noreferrer">Đơn cam kết tự tìm đơn vị thực tập</a></li></ul></div>
                </div>
                <div className="hoso-ket-thuc">
                  {currentHoSoKetThuc?.hoSoThucTapKetThuc ? (<><h4>Hồ sơ kết thúc thực tập đã nộp</h4><p>Link hồ sơ kết thúc thực tập: <a href={currentHoSoKetThuc.hoSoThucTapKetThuc} target="_blank" rel="noopener noreferrer">{currentHoSoKetThuc.hoSoThucTapKetThuc}</a></p><h4>Sửa hồ sơ kết thúc thực tập</h4><input value={ketThucLink} onChange={e => setKetThucLink(e.target.value)} placeholder="Link hồ sơ kết thúc" /><button onClick={submitKetThuc} disabled={selectedDot.tongSoGio < 700 || !currentHoSo?.hoSoThucTapBanDau}>Cập nhật hồ sơ kết thúc thực tập</button></>)
                    : (<><h4>Nộp hồ sơ kết thúc thực tập</h4><input value={ketThucLink} onChange={e => setKetThucLink(e.target.value)} placeholder="Link Drive hồ sơ kết thúc" /><button onClick={submitKetThuc} disabled={selectedDot.tongSoGio < 700 || !currentHoSo?.hoSoThucTapBanDau}>Nộp hồ sơ kết thúc thực tập</button></>)}
                  {(selectedDot.tongSoGio < 700 || !currentHoSo?.hoSoThucTapBanDau) && (<p className="warning">Phải nộp đầy đủ hồ sơ đăng ký và đủ 700 giờ đối với TT Sớm, TT Chính Khóa, TT Lại, 520 giờ đối với Liên Thông mới được nộp hồ sơ kết thúc.</p>)}
                  <div className="hoso-note"><h3>NỘP BÁO CÁO THỰC TẬP</h3><p>Sinh viên nộp bản in (cuốn báo cáo) và bản mềm (file báo cáo "Lớp-MSSV-HoVaTen") theo lịch trình của đợt tham gia làm đồ án.</p><ul><li><strong>Bản in:</strong> SV nộp trong một bìa sơ-mi có dán nhãn ghi rõ: <em>Lớp - MSSV - Họ tên - Đợt báo cáo (tháng/năm)</em></li><li><strong>Sổ nhật ký thực tập:</strong> Có nhận xét của người hướng dẫn và đóng dấu của đơn vị thực tập.</li><li><strong>Các giấy tờ (bản chính):</strong><ul><li>Giấy tiếp nhận sinh viên thực tập</li><li>Phiếu nhận xét của đơn vị thực tập: (<a href="https://docs.google.com/document/d/1wf3dSjgjk5gxSOvycBAoul4PpGbLIeBG/edit?tab=t.0" target="_blank" rel="noopener noreferrer">mẫu</a>)</li><li>Phiếu nhận xét của nhân sự hướng dẫn thực tập: (<a href="https://docs.google.com/document/d/1K6w64t46D4hkOa47sLk6jIHxHIfJJNKw/edit?tab=t.0" target="_blank" rel="noopener noreferrer">mẫu</a>)</li><li>Đơn cam kết tự tìm đơn vị thực tập (nếu có): (<a href="https://docs.google.com/document/d/1TOLc5IrJsiZOhwuEzFp4mWC3SJAk4Y9P/edit?tab=t.0" target="_blank" rel="noopener noreferrer">mẫu</a>)</li></ul></li><li>Ba (03) cuốn báo cáo có chữ ký của nhân sự hướng dẫn.</li><li><strong>Hợp đồng lao động (nếu có):</strong> Nếu sinh viên có HĐLĐ từ 01 năm trở lên, nộp:<ul><li>Hai (02) bản công chứng HĐLĐ</li><li>Hai (02) phiếu xác nhận nhân sự đang làm việc tại đơn vị</li></ul></li></ul></div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Excel Overlay: Renders on top when showDangKyGioSheet is true */}
      {showDangKyGioSheet && dangKyGioLink && (
        <div className="excel-overlay">
          <div className="excel-overlay-content">
            <button
              onClick={() => {
                setShowDangKyGioSheet(false);
                setDangKyGioLink(""); // Clear link on close
              }}
              className="excel-overlay-close-button"
            >
              Đóng
            </button>
            <iframe
              src={dangKyGioLink}
              className="excel-overlay-iframe"
              allowFullScreen
              title="Đăng ký giờ thực tập Google Sheet"
            ></iframe>
          </div>
        </div>
      )}

      {/* Confirmation Modal: For "Are you sure?" choices */}
      {showConfirmModal && (
        <div className="confirm-overlay dktn-modal-overlay"> {/* Reusing modal overlay style */}
          <div className="confirm-modal dktn-modal-content"> {/* Reusing modal content style */}
            <p>Bạn có chắc chắn xác nhận lựa chọn này?</p>
            <div className="modal-actions">
              <button className="dktn-modal-close" onClick={handleModalConfirm}>Xác nhận</button>
              <button className="dktn-modal-close" onClick={handleModalCancel} style={{backgroundColor: '#6c757d'}}>Hủy</button> {/* Adjust color for cancel */}
            </div>
          </div>
        </div>
      )}

      {/* General Purpose Modal: For specific alerts that need user acknowledgment */}
      {showGeneralModal && (
        <div className="dktn-modal-overlay" onClick={closeGeneralModal}>
          <div className="dktn-modal-content" onClick={e => e.stopPropagation()}>
            <h3>Thông báo</h3>
            <p className={generalModalType === 'error' ? 'error-text' : ''}>{generalModalMessage}</p>
            <div className="modal-actions">
              <button className="dktn-modal-close" onClick={closeGeneralModal}>Đóng</button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Card: For success/failure/info messages */}
      {showNotification && (
        <NotificationCard
          type={notificationType}
          message={notificationMessage}
          subText={notificationSubText}
          onClose={closeNotification}
        />
      )}
    </div>
  );
}

export default ThongTinThucTap;