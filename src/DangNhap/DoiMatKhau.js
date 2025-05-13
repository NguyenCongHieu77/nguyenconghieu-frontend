import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DoiMatKhau.css";
import { useNavigate } from "react-router-dom";

const DoiMatKhau = ({ savedMSSV }) => {
    const navigate = useNavigate();
    const [mssv, setMssv] = useState(() => localStorage.getItem("mssv") || savedMSSV || "");
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

    useEffect(() => {
        if (savedMSSV && savedMSSV !== mssv) {
            setMssv(savedMSSV);
            localStorage.setItem("mssv", savedMSSV);
        }
    }, [savedMSSV]);

    const handleChangePassword = async () => {
        // Kiểm tra mật khẩu xác nhận có khớp không
        if (newPassword !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const requestData = {
                TenTaiKhoan: mssv, // Backend cần TenTaiKhoan, không phải mssv
                OldPassword: oldPassword,
                NewPassword: newPassword,
                ConfirmPassword: confirmPassword, // Đảm bảo gửi lên API
            };

            console.log("Dữ liệu gửi lên API:", requestData);

            const response = await axios.post(
                "http://118.69.126.49:5225/api/Account/ChangePassword",
                requestData,
                {
                    headers: { "Content-Type": "application/json" },
                }
            );

            console.log("Phản hồi từ API:", response.data);
            setSuccess("Đổi mật khẩu thành công!");
            setError("");

            // Xóa dữ liệu nhập sau khi đổi mật khẩu thành công
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");

            // Chuyển hướng về trang thông tin tài khoản sau 2 giây
            setTimeout(() => navigate("/thongtintaikhoan"), 2000);
        } catch (error) {
            console.error("Lỗi khi gửi yêu cầu:", error.response?.data || error.message);
            setError(error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!");
            setSuccess("");
        }
    };

    const togglePasswordVisibility = (field) => {
        setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
    };

    return (
        <div className="change-password-container">
            
            <h2>Đổi mật khẩu</h2>

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
                    placeholder="Xác nhận lại mật khẩu"
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
    );
};

export default DoiMatKhau;
