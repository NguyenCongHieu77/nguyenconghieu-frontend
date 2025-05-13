// src/pages/ThongTinThucTap.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ThongTinThucTap.css";

function ThongTinThucTap() {
  const [dsChiTiet, setDsChiTiet] = useState([]);
  const [dsHoSo, setDsHoSo] = useState([]);
  const [dsHoSoKetThuc, setDsHoSoKetThuc] = useState([]);
  const [gioThucTap, setGioThucTap] = useState([]);
  const [selectedDot, setSelectedDot] = useState(null);

  const [banDauLink, setBanDauLink] = useState("");
  const [ketThucLink, setKetThucLink] = useState("");

  const [showSelection, setShowSelection] = useState(false);
  const [chosenType, setChosenType] = useState(null); // 1 = ngoài, 0 = trong

  // modal confirm
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingChoice, setPendingChoice] = useState(null);

  const mssv = localStorage.getItem("username");
  const apiChiTiet = "http://118.69.126.49:5225/api/ChiTietThucTap/get-all";
  const apiGio = "http://118.69.126.49:5225/api/GioThucTapSinhVien/get-all";
  const apiHoSoBanDau = "http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau/get-all-ho-so-ban-dau";
  const apiHoSoKetThuc = "http://118.69.126.49:5225/api/ChiTietHoSoThucTapKetThuc/get-all-ho-so-ket-thuc";
  const apiUpsertType = "http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau/chon-thuc-tap-trong-hoac-ngoai";
  const apiCapNhatHoSoBanDau = "http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau";
  const apiCapNhatHoSoKetThuc = "http://118.69.126.49:5225/api/ChiTietHoSoThucTapKetThuc/cap-nhat-ho-so";

  useEffect(() => {
    // Load chi tiết, giờ, hồ sơ ban đầu và hồ sơ kết thúc
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
      }
    };
    if (mssv) fetchAll();
  }, [mssv]);

  const handleCardClick = dot => {
    setSelectedDot(dot);

    // tìm hồ sơ ban đầu
    const hs = dsHoSo.find(
      h => h.mssv === dot.mssv && h.maDotThucTap === dot.maDotThucTap
    );
    if (hs && typeof hs.thucTapNgoai === "boolean") {
      setChosenType(hs.thucTapNgoai ? 1 : 0);
      setShowSelection(false);
    } else {
      setChosenType(null);
      setShowSelection(true);
    }
    setBanDauLink(hs?.hoSoThucTapBanDau || "");

    // tìm hồ sơ kết thúc
    const hsKt = dsHoSoKetThuc.find(
      h => h.mssv === dot.mssv && h.maDotThucTap === dot.maDotThucTap
    );
    setKetThucLink(hsKt?.hoSoThucTapKetThuc || "");

    // load giờ
    axios
      .get(apiGio)
      .then(res => {
        setGioThucTap(
          res.data.filter(
            g =>
              g.mssv === dot.mssv && g.maDotThucTap === dot.maDotThucTap
          )
        );
      })
      .catch(err => console.error("Lỗi khi lấy giờ thực tập:", err));
  };

  // bấm Có/Không lần đầu
  const handleChoiceClick = value => {
    setPendingChoice(value);
    setShowConfirmModal(true);
  };

  // xác nhận trong modal
  const handleModalConfirm = async () => {
    try {
      await axios.put(apiUpsertType, {
        MSSV: selectedDot.mssv,
        MaDotThucTap: selectedDot.maDotThucTap,
        ThucTapNgoai: pendingChoice,
      });
      setChosenType(pendingChoice ? 1 : 0);
      setShowSelection(false);
      alert("Cập nhật loại hình thực tập thành công.");
    } catch {
      alert("Cập nhật thất bại.");
    }
    setShowConfirmModal(false);
    setPendingChoice(null);
  };

  // hủy modal
  const handleModalCancel = () => {
    setShowConfirmModal(false);
    setPendingChoice(null);
  };

  // Nộp hoặc cập nhật hồ sơ ban đầu
  const submitBanDau = async () => {
    if (!banDauLink) return alert("Vui lòng nhập link hồ sơ ban đầu");
    try {
      await axios.post(`${apiCapNhatHoSoBanDau}/cap-nhat-ho-so`, null, {
        params: {
          MSSV: mssv,
          MaDotThucTap: selectedDot.maDotThucTap,
          HoSoThucTapBanDau: banDauLink,
        },
      });
      alert("Hồ sơ ban đầu đã được gửi/cập nhật thành công");
    } catch {
      alert("Nộp hồ sơ ban đầu thất bại");
    }
  };

  // Nộp hoặc cập nhật hồ sơ kết thúc
  const submitKetThuc = async () => {
    if (!ketThucLink) return alert("Vui lòng nhập link hồ sơ kết thúc");
    try {
      await axios.post(apiCapNhatHoSoKetThuc, null, {
        params: {
          MSSV: mssv,
          MaDotThucTap: selectedDot.maDotThucTap,
          HoSoThucTapKetThuc: ketThucLink,
        },
      });
      alert("Hồ sơ kết thúc đã được gửi/cập nhật thành công");
    } catch {
      alert("Nộp hồ sơ kết thúc thất bại");
    }
  };

  const currentHoSo = dsHoSo.find(
    h => selectedDot && h.mssv === selectedDot.mssv && h.maDotThucTap === selectedDot.maDotThucTap
  );
  const currentHoSoKetThuc = dsHoSoKetThuc.find(
    h => selectedDot && h.mssv === selectedDot.mssv && h.maDotThucTap === selectedDot.maDotThucTap
  );

  return (
    <div className="thongtin-container">
      <h2>THÔNG TIN THỰC TẬP CỦA BẠN</h2>

      <div className="card-container">
        {dsChiTiet.map((item, idx) => (
          <div className="card" key={idx} onClick={() => handleCardClick(item)}>
            <h3>{item.hoSinhVien} {item.tenSinhVien}</h3>
            <p><strong>MSSV:</strong> {item.mssv}</p>
            <p><strong>Đợt:</strong> {item.tenDotThucTap}</p>
            <p><strong>Đơn vị:</strong> {item.tenDonViThucTap}</p>
            <p><strong>GV hướng dẫn:</strong> {item.hoTenGiaoVien}</p>
            <p><strong>Tổng giờ:</strong> {item.tongSoGio} giờ</p>
          </div>
        ))}
      </div>

      {selectedDot && (
        <div className="detail-section">
          <h3>Đợt {selectedDot.tenDotThucTap}</h3>

          {/* Chọn loại hình thực tập */}
          {showSelection ? (
            <div className="loai-section">
              <p>Bạn thực tập ngoài trường?</p>
              <button className="btn-yes" onClick={() => handleChoiceClick(true)}>Có</button>
              <button className="btn-no" onClick={() => handleChoiceClick(false)}>Không</button>
            </div>
          ) : (
            <div className="loai-section">
              <p>
                <strong>Loại hình đã chọn:</strong>{" "}
                {chosenType === 1 ? "Ngoài trường" : "Trong trường"}
              </p>
              <button className="btn-edit" onClick={() => setShowSelection(true)}>Sửa</button>
            </div>
          )}

          {/* Chi tiết giờ */}
          <table className="gio-table">
            <thead>
              <tr><th>Tháng</th><th>Số giờ</th><th>GV xác nhận</th></tr>
            </thead>
            <tbody>
              {gioThucTap.length > 0 ? (
                gioThucTap.map((g, i) => (
                  <tr key={i}>
                    <td>{typeof g.thang === "number" ? g.thang : "-"}</td>
                    <td>{typeof g.soGioThucTap === "number" ? g.soGioThucTap : "-"}</td>
                    <td>{g.xacNhanGiaovien ? "✅" : "❌"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" style={{ textAlign: "center" }}>Chưa có dữ liệu giờ thực tập</td>
                </tr>
              )}
            </tbody>
          </table>

          {/* CBQL Ban đầu */}
          <div className="hoso">
          <h3>HỒ SƠ ĐĂNG KÝ THỰC TẬP ĐÃ NỘP</h3>
          </div>
          {currentHoSo && (
            <table className="confirm-table">
              <thead>
                <tr>
                  <th>ĐƠN ĐĂNG KÝ ĐƠN VỊ THỰC TẬP</th>
                  <th>ĐƠN TIẾP NHẬN SINH VIÊN THỰC TẬP</th>
                  <th>ĐƠN CAM KẾT TỰ TÌM ĐƠN VỊ THỰC TẬP</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{currentHoSo.xacNhanCBQLDaNopDonDangKyDonViThucTap ? "✅" : "❌"}</td>
                  <td>{currentHoSo.xacNhanCBQLDaNopGiayTiepNhanSVThucTap ? "✅" : "❌"}</td>
                  <td>{currentHoSo.xacNhanCBQLDaNopDonCamKetTuTimDVTT ? "✅" : "❌"}</td>
                </tr>
              </tbody>
            </table>
          )}
            
          {/* CBQL Kết thúc */}
          <div className="hoso">
          <h3>HỒ SƠ KẾT THÚC THỰC TẬP ĐÃ NỘP</h3>
          </div>
          {currentHoSoKetThuc && (
            <table className="confirm-table">
              <thead>
                <tr>
                  <th>Sổ nhật ký</th>
                  <th>Giấy TN SVTT</th>
                  <th>Phiếu ĐG DVTT</th>
                  <th>Phiếu ĐG NVHDTT</th>
                  <th>Cam kết DVTT</th>
                  <th>Cuốn báo cáo</th>
                  <th>Hợp đồng lao động</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{currentHoSoKetThuc.xacNhanCBQLDaNopSoNhatKyThucTap ? "✅" : "❌"}</td>
                  <td>{currentHoSoKetThuc.xacNhanCBQLDaNopGiayTiepNhanSVThucTap ? "✅" : "❌"}</td>
                  <td>{currentHoSoKetThuc.xacNhanCBQLDaNopPhieuNhanXetCuaDVTT ? "✅" : "❌"}</td>
                  <td>{currentHoSoKetThuc.xacNhanCBQLDaNopPhieuNhanXetCuaNhanSuHDThucTap ? "✅" : "❌"}</td>
                  <td>{currentHoSoKetThuc.xacNhanCBQLDaNopDonCamKetTuTimDVTT ? "✅" : "❌"}</td>
                  <td>{currentHoSoKetThuc.xacNhanCBQLDaNopCuonBaoCao ? "✅" : "❌"}</td>
                  <td>{currentHoSoKetThuc.xacNhanCBQLDaNopHopDongLaoDong ? "✅" : "❌"}</td>
                </tr>
              </tbody>
            </table>
          )}

          {/* Hồ sơ */}
          <div className="hoso-forms">
            <div className="hoso-ban-dau">
              {currentHoSo?.hoSoThucTapBanDau ? (
                <>
                  <h4>Hồ sơ đăng ký thực tập đã nộp</h4>
                  <p>
                    Link hồ sơ đăng ký thực tập:{" "}
                    <a href={currentHoSo.hoSoThucTapBanDau} target="_blank" rel="noopener noreferrer">
                      {currentHoSo.hoSoThucTapBanDau}
                    </a>
                  </p>
                  <h4>Sửa hồ sơ đăng ký thực tập</h4>
                  <input
                    value={banDauLink}
                    onChange={e => setBanDauLink(e.target.value)}
                    placeholder="Link hồ sơ ban đầu"
                  />
                  <button onClick={submitBanDau}>Cập nhật hồ sơ đăng ký thực tập</button>
                </>
              ) : (
                <>
                  <h4>Nộp hồ sơ đăng ký thực tập</h4>
                  <input
                    value={banDauLink}
                    onChange={e => setBanDauLink(e.target.value)}
                    placeholder="Link hồ sơ ban đầu"
                  />
                  <button onClick={submitBanDau}>Nộp hồ sơ đăng ký thực tập</button>
                </>
              )}
            </div>
            <div className="hoso-ket-thuc">
              {currentHoSoKetThuc?.hoSoThucTapKetThuc ? (
                <>
                  <h4>Hồ sơ kết thúc thực tập đã nộp</h4>
                  <p>
                    Link hồ sơ kết thúc thực tập:{" "}
                    <a href={currentHoSoKetThuc.hoSoThucTapKetThuc} target="_blank" rel="noopener noreferrer">
                      {currentHoSoKetThuc.hoSoThucTapKetThuc}
                    </a>
                  </p>
                  <h4>Sửa hồ sơ kết thúc thực tập</h4>
                  <input
                    value={ketThucLink}
                    onChange={e => setKetThucLink(e.target.value)}
                    placeholder="Link hồ sơ kết thúc"
                  />
                  <button onClick={submitKetThuc} disabled={selectedDot.tongSoGio < 700}>
                    Cập nhật hồ sơ kết thúc thực tập
                  </button>
                </>
              ) : (
                <>
                  <h4>Nộp hồ sơ kết thúc thực tập</h4>
                  <input
                    value={ketThucLink}
                    onChange={e => setKetThucLink(e.target.value)}
                    placeholder="Link hồ sơ kết thúc"
                  />
                  <button onClick={submitKetThuc} disabled={selectedDot.tongSoGio < 700}>
                    Nộp hồ sơ kết thúc thực tập
                  </button>
                </>
              )}
              {selectedDot.tongSoGio < 700 && (
                <p className="warning">Phải đủ 700 giờ mới được nộp</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal xác nhận */}
      {showConfirmModal && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <p>Bạn có chắc chắn xác nhận lựa chọn này?</p>
            <button onClick={handleModalConfirm}>Xác nhận</button>
            <button onClick={handleModalCancel}>Hủy</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThongTinThucTap;
