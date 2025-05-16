import { BrowserRouter, Routes, Route } from "react-router-dom";

import DangNhap from "./DangNhap/DangNhap";
import DoiMatKhau from "./DangNhap/DoiMatKhau";
import QuenMatKhau from "./DangNhap/QuenMatKhau";


import LayoutSV from "./LayoutChung/LayoutSV";
import LayoutCBQLCLB from "./LayoutChung/LayoutCBQLCLB";
import LayoutCBQLChung from "./LayoutChung/LayoutCBQLChung";

import LayoutSVTN from "./TotNghiep/LayoutTNChung/LayoutSVTN";
import LayoutQLTN from "./TotNghiep/LayoutTNChung/LayoutQLTN";




import DangKyThucTap from "./ThucTap/SinhVien/DangKyThucTap";
import ThongTinThucTap from "./ThucTap/SinhVien/ThongTinThucTap";


import DanhSachSVDangKy from "./ThucTap/CanBoQLCLB/DanhSachSVDangKy";
import DanhSachSVDangThucTap from "./ThucTap/CanBoQLCLB/DanhSachSVDangThucTap";

import DanhSachCacDonViThucTap from "./ThucTap/CanBoQLChung/DanhSachCacDonViThucTap";
import DanhSachSVDuocXacNhanTuCLB from "./ThucTap/CanBoQLChung/DanhSachSVDuocXacNhanTuCLB";
import DanhSachSVHienDangThucTap from "./ThucTap/CanBoQLChung/DanhSachSVHienDangThucTap";
import DanhSachCacDotThucTap from "./ThucTap/CanBoQLChung/DanhSachCacDotThucTap";

import DangKyTotNghiep from "./TotNghiep/SinhVienTN/DangKyTotNghiep";
import ThongTinTotNghiep from "./TotNghiep/SinhVienTN/ThongTinTotNghiep";

import DanhSachSVDangKyTN from "./TotNghiep/CanBoQLTN/DanhSachSVDangKyTN";
import DanhSachSVDuocXacNhan from "./TotNghiep/CanBoQLTN/DanhSachSVDuocXacNhan";
import CacDotTotNghiep from "./TotNghiep/CanBoQLTN/CacDotTotNghiep";


function App() {
  return (

    

    <BrowserRouter>
      <Routes>
        {/* Trang đăng nhập */}
        <Route path="/" element={<DangNhap />} />
        <Route path="/quen-mat-khau" element={<QuenMatKhau />} />

        {/* Layout Sinh Viên */}
        <Route path="/layout-sv" element={<LayoutSV />}>
          <Route path="dang-ky-thuc-tap" element={<DangKyThucTap />} />
          <Route path="thong-tin-thuc-tap" element={<ThongTinThucTap />} />
          <Route path="doi-mat-khau" element={<DoiMatKhau />} />
        </Route>

        {/* Layout Cán Bộ QL CLB */}
        <Route path="/layout-cbql-clb" element={<LayoutCBQLCLB />}>
          <Route path="danh-sach-sv-dang-ky" element={<DanhSachSVDangKy />} />
          <Route path="danh-sach-sv-dang-thuc-tap" element={<DanhSachSVDangThucTap />} />
          <Route path="doi-mat-khau" element={<DoiMatKhau />} />
        </Route>

        {/* Layout Cán Bộ QL Chung */}
        <Route path="/layout-cbql-chung" element={<LayoutCBQLChung />}>
          <Route path="danh-sach-cac-don-vi-thuc-tap" element={<DanhSachCacDonViThucTap />} />
          <Route path="danh-sach-sv-duoc-xac-nhan-tu-clb" element={<DanhSachSVDuocXacNhanTuCLB />} />
          <Route path="danh-sach-sv-hien-dang-thuc-tap" element={<DanhSachSVHienDangThucTap />} />
          <Route path="danh-sach-cac-dot-thuc-tap" element={<DanhSachCacDotThucTap />} />
          <Route path="doi-mat-khau" element={<DoiMatKhau />} />
        </Route>

        {/* Layout Sinh Viên Đăng Ký Tốt Nghiệp */}
        <Route path="/layout-sv-tn" element={<LayoutSVTN />}>
          <Route path="dang-ky-tot-nghiep" element={<DangKyTotNghiep />} />
          <Route path="thong-tin-tot-nghiep" element={<ThongTinTotNghiep />} />
          <Route path="doi-mat-khau" element={<DoiMatKhau />} />
        </Route>

        {/* Layout Quản Lý Tốt Nghiệp */}
        <Route path="/layout-ql-tn" element={<LayoutQLTN />}>
          <Route path="danh-sach-sv-dk-tn" element={<DanhSachSVDangKyTN />} />
          <Route path="danh-sach-sv-duoc-xn" element={<DanhSachSVDuocXacNhan />} />
          <Route path="cac-dot-tot-nghiep" element={<CacDotTotNghiep />} />
          <Route path="doi-mat-khau" element={<DoiMatKhau />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
