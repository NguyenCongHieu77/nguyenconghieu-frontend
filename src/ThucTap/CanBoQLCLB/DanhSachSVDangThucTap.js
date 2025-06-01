import React, { useEffect, useState } from 'react';
import './DanhSachSVDangThucTap.css';
import { FiDownload } from 'react-icons/fi';
import axios from 'axios';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import NotificationCard from '../../DangNhap/ThongBaoHeThong'; // Import the NotificationCard component


const DanhSachSVDangThucTap = () => {
  const [students, setStudents] = useState([]);
  const [hours, setHours] = useState([]);
  const [expandedMSSV, setExpandedMSSV] = useState(null);
  const [newHour, setNewHour] = useState({ soGioThucTap: '' });
  const [editing, setEditing] = useState(null);
  const [internshipPeriods, setInternshipPeriods] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dsFilesMap, setDsFilesMap] = useState({});
  const [dsFilesKetThucMap, setDsFilesKetThucMap] = useState({});
  const [previewLink, setPreviewLink] = useState('');

  // States for confirmation modal and notification
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showConfirmDeleteHourModal, setShowConfirmDeleteHourModal] = useState(false); // New state for hour deletion modal
  const [hourToDelete, setHourToDelete] = useState(null); // New state to hold hour data for deletion

  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState('info');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [notificationSubText, setNotificationSubText] = useState('');


  const apiChiTiet = `${process.env.REACT_APP_API_URL}/api/ChiTietThucTap/get-all`;
  const apiGio = `${process.env.REACT_APP_API_URL}/api/GioThucTapSinhVien/get-all`;
  const apiPeriods = `${process.env.REACT_APP_API_URL}/api/LoaiThucTap`;
  const apiHoSo = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapBanDau`;
  const apiKetThuc = `${process.env.REACT_APP_API_URL}/api/ChiTietHoSoThucTapKetThuc`;
  const apiInsertHour = `${process.env.REACT_APP_API_URL}/api/GioThucTapSinhVien`;

  const [kyFilter, setKyFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);


  const maDonViThucTapUser = Number(localStorage.getItem("maDonViThucTap")); // ép kiểu về number


  const fetchData = async () => {
    try {
      const [svRes, hourRes, periodRes, hsRes, ktRes] = await Promise.all([
        axios.get(apiChiTiet),
        axios.get(apiGio),
        axios.get(apiPeriods),
        axios.get(`${apiHoSo}/get-all-ho-so-ban-dau`),
        axios.get(`${apiKetThuc}/get-all-ho-so-ket-thuc`)
      ]);

      setStudents(svRes.data);
      setHours(hourRes.data);
      setInternshipPeriods(periodRes.data);

      const fileMap = {}, fileKTMap = {};
      await Promise.all(hsRes.data.map(async hs => {
        try {
          const list = (await axios.get(`${apiHoSo}/list-files/${hs.mssv}`)).data;
          fileMap[hs.mssv] = list;
        } catch {
          fileMap[hs.mssv] = [];
        }
      }));
      await Promise.all(ktRes.data.map(async kt => {
        try {
          const list = (await axios.get(`${apiKetThuc}/list-files/${kt.mssv}`)).data;
          fileKTMap[kt.mssv] = list;
        } catch {
          fileKTMap[kt.mssv] = [];
        }
      }));
      setDsFilesMap(fileMap);
      setDsFilesKetThucMap(fileKTMap);

    } catch (err) {
      console.error('Lỗi fetch dữ liệu:', err);
      showNotificationCard('error', 'Lỗi tải dữ liệu', 'Không thể tải danh sách sinh viên.');
    }
  };

  const exportToExcel = () => {
    const data = filteredStudents.map(sv => ({
      MSSV: sv.mssv,
      'Họ tên': `${sv.hoSinhVien} ${sv.tenSinhVien}`,
      'Đơn vị': sv.tenDonViThucTap,
      'Kỳ': sv.tenDotThucTap,
      'Ngày BĐ': new Date(sv.ngayBatDau).toLocaleDateString(),
      'Ngày KT': new Date(sv.ngayKetThuc).toLocaleDateString(),
      'HS ĐK': (dsFilesMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
      'HS KT': (dsFilesKetThucMap[sv.mssv] || []).length > 0 ? 'Đã nộp' : 'Chưa nộp',
      'Tổng giờ': getTotalHours(sv.mssv)
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SinhVienDangTT');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    saveAs(blob, 'DanhSachSinhVienDangThucTap.xlsx');
    showNotificationCard('success', 'Xuất Excel thành công', 'Dữ liệu đã được xuất ra file Excel.');
  };


  const toggleDetail = mssv => {
    setExpandedMSSV(prev => prev === mssv ? null : mssv);
    setNewHour({ soGioThucTap: '' });
    setEditing(null);
  };

  const handleInsert = async (mssv, maDotThucTap) => {
    try {
      const existing = getHoursByMSSV(mssv).length;
      const period = internshipPeriods.find(p => p.maDotThucTap === maDotThucTap);
      const nextMonth = existing + 1;

      if (period && nextMonth > period.soThangThucTap) {
        showNotificationCard('warning', 'Thêm giờ thất bại', `Tháng không thể lớn hơn ${period.soThangThucTap}.`);
        return;
      }

      await axios.post(`${apiInsertHour}/insert`, {
        mssv,
        maDotThucTap,
        ngayBatDau: new Date().toISOString(),
        ngayKetThuc: new Date().toISOString(),
        soGioThucTap: Number(newHour.soGioThucTap),
        xacNhanGiaovien: true
      });

      fetchData();
      setNewHour({ soGioThucTap: '' });
      showNotificationCard('success', 'Thêm giờ thành công', `Đã thêm giờ thực tập cho sinh viên ${mssv}.`);
    } catch (err) {
      showNotificationCard('error', 'Lỗi thêm giờ', 'Không thể thêm giờ thực tập.');
      console.error('Lỗi thêm giờ:', err);
    }
  };

  const handleUpdate = async gio => {
    try {
      await axios.put(`${apiInsertHour}/update`, {
        mssv: gio.mssv,
        maDotThucTap: gio.maDotThucTap,
        thang: gio.thang,
        soGioThucTap: gio.soGioThucTap
      });

      fetchData();
      setEditing(null);
      showNotificationCard('success', 'Cập nhật giờ thành công', `Đã cập nhật giờ thực tập cho tháng ${gio.thang}.`);
    } catch (err) {
      showNotificationCard('error', 'Lỗi cập nhật giờ', 'Không thể cập nhật giờ thực tập.');
      console.error('Lỗi cập nhật giờ:', err);
    }
  };

  // Function to open the confirmation modal for deleting an hour
  const openDeleteHourModal = (hour) => {
    setHourToDelete(hour);
    setShowConfirmDeleteHourModal(true);
  };

  // Function to confirm and perform the delete for an hour
  const confirmDeleteHour = async () => {
    if (hourToDelete) {
      try {
        await axios.delete(`${apiInsertHour}/delete/${hourToDelete.maGioThucTapSinhVien}`);
        fetchData();
        showNotificationCard('success', 'Xoá giờ thành công', `Giờ thực tập tháng ${hourToDelete.thang} của ${hourToDelete.mssv} đã được xoá.`);
      } catch (err) {
        showNotificationCard('error', 'Lỗi xoá giờ', 'Không thể xoá giờ thực tập.');
        console.error('Lỗi xoá giờ:', err);
      } finally {
        setShowConfirmDeleteHourModal(false);
        setHourToDelete(null);
      }
    }
  };


  // Function to open the confirmation modal for deleting a student
  const openDeleteStudentModal = (mssv, maDotThucTap) => {
    setStudentToDelete({ mssv, maDotThucTap });
    setShowConfirmDeleteModal(true);
  };

  // Function to confirm and perform the delete for a student
  const confirmDeleteStudent = async () => {
    if (studentToDelete) {
      try {
        await axios.delete(`${process.env.REACT_APP_API_URL}/api/ChiTietThucTap/delete/${studentToDelete.mssv}/${studentToDelete.maDotThucTap}`);
        fetchData();
        showNotificationCard('success', 'Xoá sinh viên thành công', `Sinh viên ${studentToDelete.mssv} đã được xoá.`);
      } catch (err) {
        showNotificationCard('error', 'Lỗi xoá sinh viên', 'Không thể xoá sinh viên này.');
        console.error('Xoá sinh viên thất bại:', err);
      } finally {
        setShowConfirmDeleteModal(false);
        setStudentToDelete(null);
      }
    }
  };

  const downloadFile = async (mssv, isKT = false) => {
    const url = isKT
      ? `${apiKetThuc}/download-ho-so/${mssv}`
      : `${apiHoSo}/download-ho-so/${mssv}`;
    try {
      const res = await axios.get(url, { responseType: 'blob' });
      saveAs(res.data, `${mssv}_${isKT ? 'HoSoKetThuc' : 'HoSoBanDau'}.zip`);
      showNotificationCard('success', 'Tải hồ sơ thành công', `Hồ sơ ${isKT ? 'kết thúc' : 'ban đầu'} của ${mssv} đã được tải.`);
    } catch {
      showNotificationCard('error', 'Tải hồ sơ thất bại', `Không thể tải ${isKT ? 'HS kết thúc' : 'HS ban đầu'} của ${mssv}.`);
    }
  };

  const preview = async (id, isKT = false) => {
    const url = isKT
      ? `${apiKetThuc}/preview/${id}`
      : `${apiHoSo}/preview/${id}`;
    try {
      const res = await axios.get(url);
      setPreviewLink(res.data.previewLink);
    } catch {
      showNotificationCard('error', 'Xem trước thất bại', 'Không thể lấy liên kết xem trước.');
    }
  };

  const getHoursByMSSV = mssv => hours.filter(h => h.mssv === mssv);

  const getTotalHours = mssv => {
    const studentHours = getHoursByMSSV(mssv);
    return studentHours.reduce((sum, h) => {
      const hours = Number(h.soGioThucTap);
      return sum + (isNaN(hours) ? 0 : hours);
    }, 0);
  };

  const filteredStudents = students
    .filter(sv => sv.maDonViThucTap === maDonViThucTapUser) // chỉ hiển thị đúng đơn vị
    .filter(sv =>
      sv.mssv.includes(searchTerm) ||
      (`${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(sv => !kyFilter || sv.tenDotThucTap === kyFilter);

  // Function to display notification card
  const showNotificationCard = (type, message, subText = '') => {
    setNotificationType(type);
    setNotificationMessage(message);
    setNotificationSubText(subText);
    setShowNotification(true);
  };


  return (
    <div>
      <h2 className="title">DANH SÁCH SINH VIÊN ĐANG THỰC TẬP</h2>

      <div className="controls">
        <input
          placeholder="Tìm MSSV hoặc Họ tên..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
        <select value={kyFilter} onChange={e => setKyFilter(e.target.value)}>
          <option value="">-- Tất cả đợt --</option>
          {[...new Set(students.map(sv => sv.tenDotThucTap))].map((ky, i) => (
            <option key={i} value={ky}>{ky}</option>
          ))}
        </select>

        <button onClick={() => filteredStudents.forEach(sv => downloadFile(sv.mssv))}>
          Tải tất cả HS ĐK
        </button>
        <button onClick={() => {
          const mssvs = filteredStudents.map(sv => sv.mssv);
          axios.post(`${apiKetThuc}/download-ho-so-multiple`, mssvs, { responseType: 'blob' })
            .then(r => {
              saveAs(r.data, 'HoSoKT_All.zip');
              showNotificationCard('success', 'Tải tất cả HS KT thành công', 'Đã tải về hồ sơ kết thúc của tất cả sinh viên.');
            })
            .catch(() => showNotificationCard('error', 'Tải tất cả HS KT thất bại', 'Có lỗi xảy ra khi tải hồ sơ kết thúc.'));
        }}>
          Tải tất cả HS KT
        </button>
        <button onClick={exportToExcel}>📄 Xuất Excel</button>
        <button className="print-btn" onClick={() => window.print()}>
          In danh sách
        </button>


      </div>

      <table className="main-table">
        <thead>
          <tr>
            <th>MSSV</th><th>Họ Tên</th><th>Đơn Vị</th><th>Đợt</th>
            <th>Ngày BĐ</th><th>Ngày KT</th><th>Hồ Sơ ĐK</th><th>Hồ Sơ BC</th>
            <th>Tổng giờ</th><th>Chi tiết</th><th>Xoá SV</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map(sv => {
            const hsbd = dsFilesMap[sv.mssv] || [];
            const hskt = dsFilesKetThucMap[sv.mssv] || [];
            return (
              <React.Fragment key={sv.mssv}>
                <tr>
                  <td>{sv.mssv}</td>
                  <td>{sv.hoSinhVien} {sv.tenSinhVien}</td>
                  <td>{String(sv.tenDonViThucTap)}</td>
                  <td>{String(sv.tenDotThucTap)}</td>
                  <td>{new Date(sv.ngayBatDau).toLocaleDateString()}</td>
                  <td>{new Date(sv.ngayKetThuc).toLocaleDateString()}</td>
                  <td>{hsbd.length
                    ? <button onClick={() => downloadFile(sv.mssv)}><FiDownload /></button>
                    : 'Chưa nộp'}</td>
                  <td>{hskt.length
                    ? <button onClick={() => downloadFile(sv.mssv, true)}><FiDownload /></button>
                    : 'Chưa nộp'}</td>
                  <td>{getTotalHours(sv.mssv)}</td>
                  <td>
                    <button onClick={() => toggleDetail(sv.mssv)}>
                      {expandedMSSV === sv.mssv ? 'Ẩn' : 'Chi tiết'}
                    </button>
                  </td>
                  <td>
                    <button onClick={() => openDeleteStudentModal(sv.mssv, sv.maDotThucTap)}>
                      Xoá
                    </button>
                  </td>
                </tr>

                {expandedMSSV === sv.mssv && (
                  <tr>
                    <td colSpan={11}>
                      <h4>Giờ thực tập</h4>
                      <table className="sub-table">
                        <thead>
                          <tr><th>Tháng</th><th>Giờ</th><th>HĐ</th></tr>
                        </thead>
                        <tbody>
                          {getHoursByMSSV(sv.mssv).map(h =>
                            <tr key={h.maGioThucTapSinhVien}>
                              <td>{h.thang}</td>
                              <td>
                                {editing?.maGioThucTapSinhVien === h.maGioThucTapSinhVien
                                  ? <input
                                      type="number"
                                      value={editing.soGioThucTap}
                                      onChange={e =>
                                        setEditing({ ...editing, soGioThucTap: Number(e.target.value) })
                                      }
                                    />
                                  : h.soGioThucTap}
                              </td>
                              <td>
                                {editing?.maGioThucTapSinhVien === h.maGioThucTapSinhVien
                                  ? <>
                                      <button onClick={() => handleUpdate(editing)}>Lưu</button>
                                      <button onClick={() => setEditing(null)}>Huỷ</button>
                                    </>
                                  : <>
                                      <button onClick={() => setEditing(h)}>Sửa</button>
                                      {/* Updated handleDelete call to use openDeleteHourModal */}
                                      <button onClick={() => openDeleteHourModal(h)}>Xoá</button>
                                    </>}
                              </td>
                            </tr>
                          )}
                          <tr>
                            <td>Tháng {getHoursByMSSV(sv.mssv).length + 1}</td>
                            <td><input
                              type="number"
                              placeholder="Giờ"
                              value={newHour.soGioThucTap}
                              onChange={e => setNewHour({ ...newHour, soGioThucTap: e.target.value })}
                            /></td>
                            <td><button onClick={() => handleInsert(sv.mssv, sv.maDotThucTap)}>Xác nhận</button></td>
                          </tr>
                        </tbody>
                      </table>

                      <h4>Hồ sơ ĐK</h4>
                      <ul className="file-list">
                        {hsbd.length
                          ? hsbd.map(f =>
                            <li key={f.id} onClick={() => preview(f.id, false)}>{f.name}</li>
                          )
                          : <li>Chưa nộp hồ sơ ĐK</li>
                        }
                      </ul>

                      <h4>Hồ sơ KT</h4>
                      <ul className="file-list">
                        {hskt.length
                          ? hskt.map(f =>
                            <li key={f.id} onClick={() => preview(f.id, true)}>{f.name}</li>
                          )
                          : <li>Chưa nộp hồ sơ KT</li>
                        }
                      </ul>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      {previewLink && (
        <div className="modal-overlay" onClick={() => setPreviewLink('')}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setPreviewLink('')}>×</button>
            <iframe
              src={previewLink}
              title="Preview"
              style={{ width: '100%', height: '90vh', border: 'none' }}
            />
          </div>
        </div>
      )}

      {/* Modal xác nhận xoá sinh viên */}
      {showConfirmDeleteModal && studentToDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDeleteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Xác nhận xoá sinh viên</h3>
            <p>Bạn có chắc chắn muốn **xoá sinh viên** **{studentToDelete.mssv}** khỏi danh sách thực tập?</p>
            <div className="modal-actions">
              <button onClick={confirmDeleteStudent} className="btn-confirm-delete">Xác nhận xoá</button>
              <button onClick={() => setShowConfirmDeleteModal(false)} className="btn-cancel">Hủy</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận xoá giờ thực tập */}
      {showConfirmDeleteHourModal && hourToDelete && (
        <div className="modal-overlay" onClick={() => setShowConfirmDeleteHourModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3>Xác nhận xoá giờ thực tập</h3>
            <p>Bạn có chắc chắn muốn **xoá giờ thực tập** của sinh viên **{hourToDelete.mssv}** cho tháng **{hourToDelete.thang}**?</p>
            <div className="modal-actions">
              <button onClick={confirmDeleteHour} className="btn-confirm-delete">Xác nhận xoá</button>
              <button onClick={() => setShowConfirmDeleteHourModal(false)} className="btn-cancel">Hủy</button>
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

export default DanhSachSVDangThucTap;