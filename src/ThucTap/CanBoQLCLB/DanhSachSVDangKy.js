import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DanhSachSVDangKy = () => {
  const [dsDangKy, setDsDangKy] = useState([]);
  const [banDauList, setBanDauList] = useState([]);
  const [ketThucList, setKetThucList] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterHoSoOption, setFilterHoSoOption] = useState('all'); // all | daNop | chuaNop

  useEffect(() => {
    // dữ liệu sinh viên chưa xác nhận
    axios.get('http://118.69.126.49:5225/api/ChiTietThucTap/get-all')
      .then(res => {
        const filtered = res.data.filter(sv => !sv.tenTinhTrang || sv.tenTinhTrang === '');
        setDsDangKy(filtered);
      })
      .catch(err => console.error('Lỗi khi tải dsSinhVien:', err));

    // hồ sơ ban đầu
    axios.get('http://118.69.126.49:5225/api/ChiTietHoSoThucTapBanDau/get-all-ho-so-ban-dau')
      .then(res => setBanDauList(res.data))
      .catch(err => console.error('Lỗi khi tải hồ sơ ban đầu:', err));

    // hồ sơ kết thúc
    axios.get('http://118.69.126.49:5225/api/ChiTietHoSoThucTapKetThuc/get-all-ho-so-ket-thuc')
      .then(res => setKetThucList(res.data))
      .catch(err => console.error('Lỗi khi tải hồ sơ kết thúc:', err));
  }, []);

  const isHoSoHopLe = link => link && link.trim() !== '' && link !== '\u0000';

  const getDownloadLinkFromDrive = link => {
    const match = link?.match(/[-\w]{25,}/);
    return match ? `https://drive.google.com/uc?export=download&id=${match[0]}` : null;
  };

  const hienThiHoSo = link => {
    if (!isHoSoHopLe(link)) return '❌ Chưa nộp';
    const dl = getDownloadLinkFromDrive(link);
    return dl
      ? <a href={dl} download target="_blank" rel="noopener noreferrer">📥 Tải hồ sơ</a>
      : '❌ Link không hợp lệ';
  };

  // build payload dùng chung
  const buildUpdatePayload = (sv, options = {}) => ({
    mssv: sv.mssv,
    maDotThucTap: sv.maDotThucTap,
    ngayBatDau: sv.ngayBatDau,
    ngayKetThuc: sv.ngayKetThuc,
    lanThucTap: sv.lanThucTap,
    maDonViThucTap: sv.maDonViThucTap,
    maGiaoVien: sv.maGiaoVien,
    hoSoThucTap: sv.hoSoThucTap,
    hoSoDaNop: sv.hoSoDaNop,
    xacNhanChoBaoCao: sv.xacNhanChoBaoCao,
    ketQuaBaoCao: sv.ketQuaBaoCao,
    diemBaoCao: sv.diemBaoCao,
    maTinhTrangThucTap: options.maTinhTrangThucTap ?? sv.maTinhTrangThucTap,
    tinhTrangXacNhan: options.tinhTrangXacNhan ?? sv.tinhTrangXacNhan,
    ghiChu: options.ghiChu ?? sv.ghiChu,
  });

  const handleXacNhan = sv => {
    const payload = buildUpdatePayload(sv, {
      maTinhTrangThucTap: 2,
      tinhTrangXacNhan: 'Đã xác nhận',
      ghiChu: 'Đã xác nhận bởi admin'
    });
    axios.post('http://118.69.126.49:5225/api/ChiTietThucTap/insert-update', payload)
      .then(() => {
        alert(`✅ Đã xác nhận MSSV: ${sv.mssv}`);
        setDsDangKy(prev =>
          prev.map(item =>
            item.mssv === sv.mssv && item.maDotThucTap === sv.maDotThucTap
              ? { ...item, ...payload }
              : item
          )
        );
      })
      .catch(err => { console.error('❌ Lỗi xác nhận:', err); alert('Xác nhận thất bại'); });
  };

  const handleXacNhanAll = () => {
    filteredList.forEach(handleXacNhan);
  };

  const handleDownloadAll = () => {
    filteredList.forEach(sv => {
      // tải cả ban đầu và kết thúc
      [ 
        banDauList.find(b => b.mssv === sv.mssv && b.maDotThucTap === sv.maDotThucTap)?.hoSoThucTapBanDau,
        ketThucList.find(k => k.mssv === sv.mssv && k.maDotThucTap === sv.maDotThucTap)?.hoSoThucTapKetThuc
      ].forEach(link => {
        const dl = getDownloadLinkFromDrive(link);
        if (dl) {
          const a = document.createElement('a');
          a.href = dl;
          a.download = `${sv.mssv}_hosothuctap.pdf`;
          document.body.appendChild(a); a.click(); document.body.removeChild(a);
        }
      });
    });
  };

  const handleGuiYeuCauNop = sv => {
    const payload = buildUpdatePayload(sv, { ghiChu: 'Vui lòng nộp Hồ Sơ Thực Tập' });
    axios.post('http://118.69.126.49:5225/api/ChiTietThucTap/insert-update', payload)
      .then(() => {
        alert(`📨 Đã gửi yêu cầu MSSV: ${sv.mssv}`);
        setDsDangKy(prev =>
          prev.map(item =>
            item.mssv === sv.mssv && item.maDotThucTap === sv.maDotThucTap
              ? { ...item, ghiChu: payload.ghiChu }
              : item
          )
        );
      })
      .catch(err => { console.error('Lỗi gửi yêu cầu:', err); alert('Gửi yêu cầu thất bại'); });
  };

  const handleGuiYeuCauAll = () => {
    filteredList
      .filter(sv => !isHoSoHopLe(sv.hoSoThucTap))
      .forEach(handleGuiYeuCauNop);
  };

  const filteredList = dsDangKy.filter(sv => {
    const hoTen = `${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase();
    const matchSearch =
      sv.mssv.toLowerCase().includes(searchText.toLowerCase()) ||
      hoTen.includes(searchText.toLowerCase()) ||
      sv.tenDotThucTap.toLowerCase().includes(searchText.toLowerCase());
    const hoSoValid = isHoSoHopLe(sv.hoSoThucTap);
    const matchHoSo =
      filterHoSoOption === 'all' ||
      (filterHoSoOption === 'daNop' && hoSoValid) ||
      (filterHoSoOption === 'chuaNop' && !hoSoValid);
    return matchSearch && matchHoSo;
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2>DANH SÁCH SINH VIÊN CHƯA XÁC NHẬN</h2>

      <div style={{ marginBottom: '15px' }}>
        <input
          type="text"
          placeholder="🔍 Tìm MSSV, họ tên, đợt..."
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          style={{ padding: '6px', width: '250px', marginRight: '10px' }}
        />
        <select
          value={filterHoSoOption}
          onChange={e => setFilterHoSoOption(e.target.value)}
          style={{ padding: '6px', marginRight: '10px' }}
        >
          <option value="all">📂 Tất cả hồ sơ</option>
          <option value="daNop">📥 Đã nộp</option>
          <option value="chuaNop">❌ Chưa nộp</option>
        </select>
        <button onClick={handleXacNhanAll}>✅ Xác nhận toàn bộ</button>
        <button onClick={handleDownloadAll} style={{ marginLeft: 10 }}>📥 Tải toàn bộ hồ sơ</button>
        <button onClick={handleGuiYeuCauAll} style={{ marginLeft: 10 }}>📨 Gửi yêu cầu nộp</button>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <strong>Tổng số SV:</strong> {filteredList.length}
      </div>

      <table border="1" cellPadding="8" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead style={{ backgroundColor: '#f0f0f0' }}>
          <tr>
            <th>MSSV</th>
            <th>Họ tên</th>
            <th>Đợt thực tập</th>
            <th>Thời gian</th>
            <th>Lần</th>
            <th>Đơn vị</th>
            <th>Giảng viên</th>
            <th>Hồ sơ ban đầu</th>
            <th>Hồ sơ kết thúc</th>
            <th>Tình trạng</th>
            <th>Ghi chú</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {filteredList.length === 0 ? (
            <tr>
              <td colSpan="12" style={{ textAlign: 'center', padding: '20px' }}>
                🎉 Không có sinh viên cần xử lý
              </td>
            </tr>
          ) : filteredList.map((sv, idx) => {
            // tìm link ban đầu & kết thúc
            const banDau = banDauList.find(b => b.mssv===sv.mssv && b.maDotThucTap===sv.maDotThucTap)?.hoSoThucTapBanDau;
            const ketThuc = ketThucList.find(k => k.mssv===sv.mssv && k.maDotThucTap===sv.maDotThucTap)?.hoSoThucTapKetThuc;
            return (
              <tr key={idx}>
                <td>{sv.mssv}</td>
                <td>{sv.hoSinhVien} {sv.tenSinhVien}</td>
                <td>{sv.tenDotThucTap}</td>
                <td>
                  {new Date(sv.ngayBatDau).toLocaleDateString()} -{' '}
                  {new Date(sv.ngayKetThuc).toLocaleDateString()}
                </td>
                <td>{sv.lanThucTap}</td>
                <td>{sv.tenDonViThucTap}</td>
                <td>{sv.hoTenGiaoVien}</td>
                <td>{hienThiHoSo(banDau)}</td>
                <td>{hienThiHoSo(ketThuc)}</td>
                <td>{sv.tenTinhTrang || 'Chưa cập nhật'}</td>
                <td>
                  {!isHoSoHopLe(sv.hoSoThucTap)
                    ? <button onClick={()=>handleGuiYeuCauNop(sv)}>📨 Yêu cầu nộp</button>
                    : sv.ghiChu || '...'
                  }
                </td>
                <td>
                  <button onClick={()=>handleXacNhan(sv)}>✅ Xác nhận</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default DanhSachSVDangKy;
