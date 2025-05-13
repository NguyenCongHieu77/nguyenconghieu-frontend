

import React, { useState } from "react";
import axios from "axios";
import "./DangNhap.css";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faLock, faUser } from "@fortawesome/free-solid-svg-icons";

const DangNhap = () => {
  const [tenTaiKhoan, setTenTaiKhoan] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5225/api/Account/login", {
        tenTaiKhoan,
        matKhau,
      });

      const data = res.data;

      // ✅ Lưu thông tin vào localStorage
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("tenHienThi", data.tenHienThi); // dùng cho hiển thị
      localStorage.setItem("username", tenTaiKhoan); // ✅ MSSV là username
      localStorage.setItem("user", JSON.stringify(data)); // tuỳ chọn

      setTimeout(() => {
        if (data.maNhomTaiKhoan === 1) {
          navigate("/layout-cbql-clb/danh-sach-sv-dang-ky");
        } else if (data.maNhomTaiKhoan === 3) {
          navigate("/layout-sv/dang-ky-thuc-tap");
        } else if (data.maNhomTaiKhoan === 2) {
          navigate("/layout-cbql-chung/danh-sach-sv-duoc-xac-nhan-tu-clb");
        } else {
          setLoading(false);
          setError("Quyền truy cập không hợp lệ.");
        }
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.message || "Tên đăng nhập hoặc mật khẩu không đúng");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="logo-side">
        <img src="/image/logo.png" alt="Logo" className="logo" />
        <h2>ĐĂNG NHẬP</h2>
        <a href="/nhaptentaikhoandelaylaimatkhau" className="forgot-password">
          quên mật khẩu
        </a>
      </div>
      <form className="form-side" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}

        <div className="input-wrapper">
          <FontAwesomeIcon icon={faUser} />
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={tenTaiKhoan}
            onChange={(e) => setTenTaiKhoan(e.target.value)}
            required
          />
        </div>

        <div className="input-wrapper">
          <FontAwesomeIcon icon={faLock} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Mật khẩu"
            value={matKhau}
            onChange={(e) => setMatKhau(e.target.value)}
            required
          />
          <FontAwesomeIcon
            icon={showPassword ? faEyeSlash : faEye}
            className="toggle-password"
            onClick={() => setShowPassword(!showPassword)}
          />
        </div>

        <button className="login-btn" type="submit" disabled={loading}>
          <FontAwesomeIcon icon={faLock} /> {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
        </button>
      </form>
    </div>
  );
};

export default DangNhap;
