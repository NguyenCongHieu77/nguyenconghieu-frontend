import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch } from "react-icons/fa";
import { FiDownload } from "react-icons/fi";
import { saveAs } from "file-saver";
import './DanhSachSVDuocBaoCao.css';
import * as XLSX from "xlsx";
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Đảm bảo đường dẫn đúng đến component NotificationCard của bạn

function DanhSachSVDuocBaoCao() {
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [dsHoSo, setDsHoSo] = useState([]);
  const [dsKetThuc, setDsKetThuc] = useState([]);
  const [dsFilesMap, setDsFilesMap] = useState({});
  const [dsFilesKetThucMap, setDsFilesKetThucMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDotThucTap, setFilterDotThucTap] = useState("");
  const [filterDonVi, setFilterDonVi] = useState("");
  const [filterDK, setFilterDK] = useState("");
  const [filterKT, setFilterKT] = useState("");
  const [expandedMssv, setExpandedMssv] = useState(null);
  const [previewLink, setPreviewLink] = useState("");
  const [filterKQBC, setFilterKQBC] = useState("");

  const apiChiTiet = `${process.env.REACT_APP_API_URL}/api/ChiTietThucTap`;
  const apiHoSo = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapBanDau`;
  const apiKetThuc = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapKetThuc`;
  const apiUpsertGV = `${process.env.REACT_APP_API_URL}/api/ChiTietThucTap/gv-upsert`;

  // States mới cho Notification Card
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('success'); // 'success' hoặc 'error'
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');

  // States cho modal xác nhận xóa sinh viên
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedToDelete, setSelectedToDelete] = useState({ mssv: "", maDotThucTap: "" });


  useEffect(() => {
    Promise.all([
      axios.get(`${apiChiTiet}/get-all`),
      axios.get(`${apiHoSo}/get-all-ho-so-ban-dau`),
      axios.get(`${apiKetThuc}/get-all-ho-so-ket-thuc`)
    ])
      .then(([resCT, resHS, resKT]) => {
        setDsChiTiet(resCT.data);
        setDsHoSo(resHS.data);
        setDsKetThuc(resKT.data);
      })
      .catch(err => {
        console.error("Lỗi khi tải dữ liệu:", err);
        setNotificationType('error');
        setNotificationMessage('Tải dữ liệu thất bại!');
        setNotificationSubText('Không thể tải danh sách sinh viên báo cáo.');
        setShowNotification(true);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!loading) {
      dsHoSo.forEach(hs => {
        axios.get(`${apiHoSo}/list-files/${hs.mssv}`)
          .then(res => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: res.data })))
          .catch(() => setDsFilesMap(prev => ({ ...prev, [hs.mssv]: [] })));
      });
      dsKetThuc.forEach(kt => {
        axios.get(`${apiKetThuc}/list-files/${kt.mssv}`)
          .then(res => setDsFilesKetThucMap(prev => ({ ...prev, [kt.mssv]: res.data })))
          .catch(() => setDsFilesKetThucMap(prev => ({ ...prev, [kt.mssv]: [] })));
      });
    }
  }, [loading, dsHoSo, dsKetThuc]);

  const merged = dsChiTiet.map(ct => {
    const hs = dsHoSo.find(h => h.mssv === ct.mssv && h.maDotThucTap === ct.maDotThucTap) || {};
    const kt = dsKetThuc.find(k => k.mssv === ct.mssv && k.maDotThucTap === ct.maDotThucTap) || {};
    return { ...ct, ...hs, ...kt };
  });

  const exportToExcel = () => {
    const data = filtered.map(item => ({
      MSSV: item.mssv,
      'Họ tên': `${item.hoSinhVien} ${item.tenSinhVien}`,
      'Đợt': item.tenDotThucTap,
      'Đơn vị': item.tenDonViThucTap,
      'HS ĐK': (dsFilesMap[item.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
      'HS KT': (dsFilesKetThucMap[item.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
      'Điểm báo cáo': item.diemBaoCao,
      'Kết quả báo cáo': (item.ketQuaBaoCao === true || item.ketQuaBaoCao === "True") ? 'Đạt' : 'Không Đạt',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SinhVienTT');

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "DanhSachSinhVienDangThucTap.xlsx");

    setNotificationType('success');
    setNotificationMessage('Xuất Excel thành công!');
    setNotificationSubText('Dữ liệu đã được xuất ra file Excel.');
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const filtered = merged
    .filter(item => String(item.xacNhanChoBaoCao).toLowerCase() === "true")
    .filter(item => {
      const fullName = `${item.hoSinhVien || ""} ${item.tenSinhVien || ""}`.toLowerCase();
      return fullName.includes(searchTerm.toLowerCase()) || item.mssv.includes(searchTerm);
    })
    .filter(item => !filterDotThucTap || item.tenDotThucTap === filterDotThucTap)
    .filter(item => !filterDonVi || item.tenDonViThucTap === filterDonVi)
    .filter(item => {
      if (filterDK === "yes") return (dsFilesMap[item.mssv] || []).length > 0;
      if (filterDK === "no") return (dsFilesMap[item.mssv] || []).length === 0;
      return true;
    })
    .filter(item => {
      if (filterKT === "yes") return (dsFilesKetThucMap[item.mssv] || []).length > 0;
      if (filterKT === "no") return (dsFilesKetThucMap[item.mssv] || []).length === 0;
      return true;
    })
    .filter(item => {
      if (filterKQBC === "pass") return item.ketQuaBaoCao === true || item.ketQuaBaoCao === "True";
      if (filterKQBC === "fail") return item.ketQuaBaoCao === false || item.ketQuaBaoCao === "False";
      return true;
    });

  const getUnique = field => [...new Set(merged.map(x => x[field]).filter(Boolean))];

  const downloadInitial = async mssv => {
    try {
      const response = await axios.get(`${apiHoSo}/download-ho-so/${mssv}`, { responseType: "blob" });
      saveAs(new Blob([response.data]), `${mssv}_HoSoBanDau.zip`);
      setNotificationType('success');
      setNotificationMessage('Tải hồ sơ đăng ký thành công!');
      setNotificationSubText(`Hồ sơ đăng ký của sinh viên ${mssv} đã được tải về.`);
      setShowNotification(true);
    } catch (error) {
      console.error(`Lỗi khi tải HS đăng ký của ${mssv}:`, error);
      setNotificationType('error');
      setNotificationMessage('Tải hồ sơ đăng ký thất bại!');
      setNotificationSubText(`Không thể tải hồ sơ đăng ký của ${mssv}.`);
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  const downloadKetThuc = async mssv => {
    try {
      const response = await axios.get(`${apiKetThuc}/download-ho-so/${mssv}`, { responseType: "blob" });
      saveAs(new Blob([response.data]), `${mssv}_HoSoKetThuc.zip`);
      setNotificationType('success');
      setNotificationMessage('Tải hồ sơ kết thúc thành công!');
      setNotificationSubText(`Hồ sơ kết thúc của sinh viên ${mssv} đã được tải về.`);
      setShowNotification(true);
    } catch (error) {
      console.error(`Lỗi khi tải HS kết thúc của ${mssv}:`, error);
      setNotificationType('error');
      setNotificationMessage('Tải hồ sơ kết thúc thất bại!');
      setNotificationSubText(`Không thể tải hồ sơ kết thúc của ${mssv}.`);
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  const handlePreviewInline = async (id, isKetThuc = false) => {
    try {
      const res = await axios.get(`${isKetThuc ? apiKetThuc : apiHoSo}/preview/${id}`);
      setPreviewLink(res.data.previewLink);
    } catch {
      setNotificationType('error');
      setNotificationMessage('Lấy link preview thất bại!');
      setNotificationSubText('Không thể xem trước tệp tin. Vui lòng thử lại.');
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  const deleteSinhVien = async () => {
    setShowDeleteModal(false); // Đóng modal
    const { mssv, maDotThucTap } = selectedToDelete;
    try {
      await axios.delete(`${apiChiTiet}/delete/${mssv}/${maDotThucTap}`);
      setDsChiTiet(prev => prev.filter(item => !(item.mssv === mssv && item.maDotThucTap === maDotThucTap)));
      setNotificationType('success');
      setNotificationMessage('Xóa sinh viên thành công!');
      setNotificationSubText(`Sinh viên ${mssv} đã được xóa khỏi đợt ${maDotThucTap}.`);
      setShowNotification(true);
    } catch (error) {
      console.error("Lỗi xóa sinh viên:", error.response?.data || error.message);
      setNotificationType('error');
      setNotificationMessage('Xóa sinh viên thất bại!');
      setNotificationSubText(`Không thể xóa sinh viên ${mssv}. Vui lòng thử lại.`);
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
      setSelectedToDelete({ mssv: "", maDotThucTap: "" }); // Clear selected to delete
    }
  };

  const confirmDelete = (mssv, maDotThucTap) => {
    setSelectedToDelete({ mssv, maDotThucTap });
    setShowDeleteModal(true);
  };

  const handleRemoveConfirmation = async (mssv, maDotThucTap) => {
    try {
      await axios.put(apiUpsertGV, {
        mssv,
        maDotThucTap,
        xacNhanChoBaoCao: false // Gửi rõ ràng key này
      });
      setDsChiTiet(prev =>
        prev.map(ct =>
          ct.mssv === mssv && ct.maDotThucTap === maDotThucTap
            ? { ...ct, xacNhanChoBaoCao: false }
            : ct
        )
      );
      setNotificationType('success');
      setNotificationMessage('Đã xóa xác nhận báo cáo thành công!');
      setNotificationSubText(`Xác nhận báo cáo của sinh viên ${mssv} đã được xóa.`);
      setShowNotification(true);
    } catch (error) {
      console.error("Lỗi khi xóa xác nhận báo cáo:", error.response?.data || error.message);
      setNotificationType('error');
      setNotificationMessage('Xóa xác nhận báo cáo thất bại!');
      setNotificationSubText('Có lỗi xảy ra khi xóa xác nhận báo cáo.');
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };

  const handleScoreChange = async (item, newScore) => {
    const ketQua = newScore >= 5;
    try {
      await axios.put(`${apiChiTiet}/gv-upsert`, {
        mssv: item.mssv,
        maDotThucTap: item.maDotThucTap,
        diemBaoCao: newScore,
        ketQuaBaoCao: ketQua
      });
      setDsChiTiet(prev => prev.map(ct =>
        ct.mssv === item.mssv && ct.maDotThucTap === item.maDotThucTap
          ? { ...ct, diemBaoCao: newScore, ketQuaBaoCao: ketQua }
          : ct
      ));
      setNotificationType('success');
      setNotificationMessage('Cập nhật điểm báo cáo thành công!');
      setNotificationSubText(`Điểm của sinh viên ${item.mssv} đã được cập nhật.`);
      setShowNotification(true);
    } catch (error) {
      console.error("Lỗi cập nhật điểm báo cáo:", error.response?.data || error.message);
      setNotificationType('error');
      setNotificationMessage('Cập nhật điểm báo cáo thất bại!');
      setNotificationSubText('Có lỗi xảy ra khi cập nhật điểm báo cáo.');
      setShowNotification(true);
    } finally {
      setTimeout(() => setShowNotification(false), 5000);
    }
  };


  if (loading) return <p>Đang tải dữ liệu...</p>;

  return (
    <div className="danh-sach-container">
      <h2>DANH SÁCH SINH VIÊN ĐƯỢC BÁO CÁO</h2>
      <div className="search-bar">
        <div className="search-input">
          <FaSearch className="search-icon" />
          <input type="text" placeholder="Tìm MSSV hoặc Họ tên..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="filters">
          <select value={filterDotThucTap} onChange={e => setFilterDotThucTap(e.target.value)}>
            <option value="">Tất cả đợt</option>
            {getUnique("tenDotThucTap").map((v, i) => <option key={i} value={v}>{v}</option>)}
          </select>
          <select value={filterDonVi} onChange={e => setFilterDonVi(e.target.value)}>
            <option value="">Tất cả đơn vị</option>
            {getUnique("tenDonViThucTap").map((v, i) => <option key={i} value={v}>{v}</option>)}
          </select>

          <select value={filterKQBC} onChange={e => setFilterKQBC(e.target.value)}>
            <option value="">KQ BC: Tất cả</option>
            <option value="pass">Đạt</option>
            <option value="fail">Không Đạt</option>
          </select>
        </div>
        <span className="total-count">Tổng: {filtered.length}</span>
        <button onClick={exportToExcel} className="export-btn">📄 Xuất Excel</button>
      </div>

      <table className="danh-sach-table">
        <thead>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Đợt</th>
            <th>Đơn vị</th>
            <th>HS ĐK</th>
            <th>HS KT</th>
            <th>Điểm BC</th>
            <th>KQ BC</th>
            <th>Xác nhận báo cáo</th>
            <th>Xóa</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map(item => {
            const filesDK = dsFilesMap[item.mssv] || [];
            const filesKT = dsFilesKetThucMap[item.mssv] || [];
            return (
              <React.Fragment key={`${item.mssv}-${item.maDotThucTap}`}>
                <tr>
                  <td>{item.mssv}</td>
                  <td>{item.hoSinhVien} {item.tenSinhVien}</td>
                  <td>{item.tenDotThucTap}</td>
                  <td>{item.tenDonViThucTap}</td>
                  <td>
                    {filesDK.length ? <button onClick={() => downloadInitial(item.mssv)}><FiDownload /></button> : ""}
                    {filesDK.length ? <span onClick={() => setExpandedMssv(item.mssv)}>Đã nộp ({filesDK.length})</span> : "Chưa nộp"}
                  </td>
                  <td>
                    {filesKT.length ? <button onClick={() => downloadKetThuc(item.mssv)}><FiDownload /></button> : ""}
                    {filesKT.length ? <span onClick={() => setExpandedMssv(item.mssv + "_kt")}>Đã nộp ({filesKT.length})</span> : "Chưa nộp"}
                  </td>
                  <td>
                    <input
                      type="number"
                      value={item.diemBaoCao || 0}
                      min="0"
                      max="10"
                      style={{ width: "60px" }}
                      onChange={async (e) => {
                        const newScore = parseFloat(e.target.value);
                        handleScoreChange(item, newScore);
                      }}
                    />
                  </td>
                  <td>{(item.ketQuaBaoCao === true || item.ketQuaBaoCao === "True") ? "Đạt" : "Không Đạt"}</td>
                  <td>
                    {item.xacNhanChoBaoCao === true || item.xacNhanChoBaoCao === "True" ? (
                      <button
                        className="remove-confirm-btn"
                        onClick={() => handleRemoveConfirmation(item.mssv, item.maDotThucTap)}
                      >
                        Xóa xác nhận
                      </button>
                    ) : (
                      "Chưa xác nhận"
                    )}
                  </td>
                  <td>
                    <button className="delete-btn" onClick={() => confirmDelete(item.mssv, item.maDotThucTap)}>
                      ❌
                    </button>
                  </td>
                </tr>
                {expandedMssv === item.mssv && filesDK.length > 0 && (
                  <tr>
                    <td colSpan="9">
                      <ul className="file-list-inline">
                        {filesDK.map(f => <li key={f.id} onClick={() => handlePreviewInline(f.id)}>{f.name}</li>)}
                      </ul>
                    </td>
                  </tr>
                )}
                {expandedMssv === item.mssv + "_kt" && filesKT.length > 0 && (
                  <tr>
                    <td colSpan="9">
                      <ul className="file-list-inline">
                        {filesKT.map(f => <li key={f.id} onClick={() => handlePreviewInline(f.id, true)}>{f.name}</li>)}
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {/* Modal hiển thị preview file */}
      {previewLink && (
        <div className="modal-overlay" onClick={() => setPreviewLink("")}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPreviewLink("")}>×</button>
            <iframe src={previewLink} title="Preview" style={{ width: "100%", height: "90vh", border: "none" }} />
          </div>
        </div>
      )}

      {/* Modal xác nhận xóa sinh viên */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Xác nhận xóa sinh viên</h3>
            <p>Bạn có chắc chắn muốn xóa sinh viên **{selectedToDelete.mssv}** khỏi đợt **{selectedToDelete.maDotThucTap}**?</p>
            <div className="modal-actions">
              <button onClick={deleteSinhVien} className="btn-confirm-delete">Xác nhận xóa</button>
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
}

export default DanhSachSVDuocBaoCao;