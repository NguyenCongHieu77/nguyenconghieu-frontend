import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoiMatKhau.css";
import { useNavigate } from "react-router-dom";

const DoiMatKhau = () => {
    const navigate = useNavigate();
    const [mssv, setMssv] = useState(localStorage.getItem("username") || ""); // lấy MSSV từ localStorage
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showPassword, setShowPassword] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const handleChangePassword = async () => {
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const response = await axios.post(
                "http://118.69.126.49:5225/api/Account/ChangePassword",

                requestData,

                {
                    tenTaiKhoan: mssv,
                    oldPassword,
                    newPassword,
                    confirmPassword,
                },

                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            setSuccess("Đổi mật khẩu thành công!");
            setError("");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // setTimeout(() => navigate("/http://localhost:3000"), 2000);
        } catch (error) {
            setError(error.response?.data?.message || "Đổi mật khẩu thất bại!");
            setSuccess("");
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="change-password-page">
            <div className="left-section">
                <img src="/image/logo.png" alt="Logo" className="logo" />
                <h2>THAY ĐỔI MẬT KHẨU</h2>
            </div>

            <div className="form-section">
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}

                <div className="input-group">
                    <input
                        type={showPassword.old ? "text" : "password"}
                        placeholder="Mật khẩu cũ"
                        value={oldPassword}
                        onChange={(e) => setOldPassword(e.target.value)}
                    />
                    <span onClick={() => togglePasswordVisibility("old")}>👁</span>
                </div>

                <div className="input-group">
                    <input
                        type={showPassword.new ? "text" : "password"}
                        placeholder="Mật khẩu mới"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <span onClick={() => togglePasswordVisibility("new")}>👁</span>
                </div>

                <div className="input-group">
                    <input
                        type={showPassword.confirm ? "text" : "password"}
                        placeholder="Xác nhận mật khẩu mới"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <span onClick={() => togglePasswordVisibility("confirm")}>👁</span>
                </div>

                <button
                    className="change-password-btn"
                    onClick={handleChangePassword}
                    disabled={!oldPassword || !newPassword || !confirmPassword}
                >
                    Đổi mật khẩu
                </button>
            </div>
        </div>
    );
};

export default DoiMatKhau;
