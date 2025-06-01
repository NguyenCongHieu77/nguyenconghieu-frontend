import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './TaoTaiKhoanChoQLCLB.css';

const TaoTaiKhoanChoQLCLB = () => {
  // State cho form tạo tài khoản
  const [tenTaiKhoan, setTenTaiKhoan] = useState('');
  const [tenHienThi, setTenHienThi] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [donViList, setDonViList] = useState([]);
  const [maDonViThucTap, setMaDonViThucTap] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  // State cho danh sách và chỉnh sửa tài khoản
  const [accounts, setAccounts] = useState([]);
  const [editingAccount, setEditingAccount] = useState(null); // Lưu tài khoản đang được chỉnh sửa
  const [editForm, setEditForm] = useState({ // Trạng thái cho các trường của form chỉnh sửa
    tenTaiKhoan: '',
    maDonViThucTap: ''
  });

  useEffect(() => {
    fetchDonViThucTap();
    fetchAccounts();
  }, []);

  const fetchDonViThucTap = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/DonViThucTap`);
      setDonViList(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách Đơn vị Thực tập:", err);
      setMessage('Lỗi khi tải danh sách đơn vị thực tập.');
    }
  };

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/Account/get-all`);
      setAccounts(res.data);
    } catch (err) {
      console.error("Lỗi khi lấy danh sách tài khoản:", err);
      setMessage('Lỗi khi tải danh sách tài khoản.');
    }
  };

  const handleSubmitCreate = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage('');

    try {
      const payload = {
        tenTaiKhoan,
        tenHienThi,
        matKhau,
        maNhomTaiKhoan: 5, // Mặc định nhóm tài khoản = 5 (QL CLB)
        maDonViThucTap: Number(maDonViThucTap),
      };

      await axios.post(`${process.env.REACT_APP_API_URL}/api/Account/dangkytaikhoan`, payload);
      setMessage('Tạo tài khoản thành công!');
      // Reset form tạo
      setTenTaiKhoan('');
      setTenHienThi('');
      setMatKhau('');
      setMaDonViThucTap('');
      fetchAccounts(); // Làm mới danh sách tài khoản
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Có lỗi khi tạo tài khoản. Vui lòng thử lại.';
      setMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditClick = (account) => {
    setEditingAccount(account);
    setEditForm({
      tenTaiKhoan: account.tenTaiKhoan,
      maDonViThucTap: account.maDonViThucTap || '' // Populate existing unit ID
    });
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateAccount = async (e) => {
    e.preventDefault();
    if (!editingAccount) return;

    setIsLoading(true);
    setMessage('');

    try {
      const payload = {
        tenTaiKhoan: editForm.tenTaiKhoan,
        // maNhomTaiKhoan is not being sent in the current C# API, so we remove it here too
        maDonViThucTap: editForm.maDonViThucTap ? Number(editForm.maDonViThucTap) : null,
      };

      await axios.put(`${process.env.REACT_APP_API_URL}/api/Account/${editingAccount.maTaiKhoan}`, payload);
      setMessage('Cập nhật tài khoản thành công!');
      setEditingAccount(null); // Đóng form chỉnh sửa
      fetchAccounts(); // Làm mới danh sách tài khoản
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Có lỗi khi cập nhật tài khoản. Vui lòng thử lại.';
      setMessage(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="taotaikhoanqlclb-container">
      {/* --- Form Tạo tài khoản --- */}
      <form className="taotaikhoanqlclb-form" onSubmit={handleSubmitCreate}>
        <h2 className="taotaikhoanqlclb-title">TẠO TÀI KHOẢN CHO QUẢN LÝ CLB</h2>

        <div className="form-group">
          <label className="taotaikhoanqlclb-label" htmlFor="tenTaiKhoan">Tên tài khoản</label>
          <input
            id="tenTaiKhoan"
            className="taotaikhoanqlclb-input"
            type="text"
            value={tenTaiKhoan}
            onChange={e => setTenTaiKhoan(e.target.value)}
            required
            placeholder="Nhập tên tài khoản"
          />
        </div>

        <div className="form-group">
          <label className="taotaikhoanqlclb-label" htmlFor="tenHienThi">Họ và Tên</label>
          <input
            id="tenHienThi"
            className="taotaikhoanqlclb-input"
            type="text"
            value={tenHienThi}
            onChange={e => setTenHienThi(e.target.value)}
            required
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="form-group">
          <label className="taotaikhoanqlclb-label" htmlFor="matKhau">Mật khẩu</label>
          <input
            id="matKhau"
            className="taotaikhoanqlclb-input"
            type="password"
            value={matKhau}
            onChange={e => setMatKhau(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />
        </div>

        <div className="form-group">
          <label className="taotaikhoanqlclb-label" htmlFor="donVi">Đơn vị thực tập</label>
          <select
            id="donVi"
            className="taotaikhoanqlclb-select"
            value={maDonViThucTap}
            onChange={e => setMaDonViThucTap(e.target.value)}
            required
          >
            <option value="" disabled>Chọn đơn vị thực tập</option>
            {donViList.map(dv => (
              <option key={dv.maDonViThucTap} value={dv.maDonViThucTap}>
                {dv.tenDonViThucTap}
              </option>
            ))}
          </select>
        </div>

        <button
          className="taotaikhoanqlclb-button"
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </button>

        {message && (
          <p className={`taotaikhoanqlclb-message ${message.includes('thành công') ? 'success' : 'error'}`}>
            {message}
          </p>
        )}
      </form>

      <hr className="divider" /> {/* Đường phân cách */}

      {/* --- Danh sách Tài khoản --- */}
      <div className="account-list-section">
        <h2 className="taotaikhoanqlclb-title">DANH SÁCH TÀI KHOẢN</h2>
        {accounts.length > 0 ? (
          <div className="table-responsive">
            <table className="accounts-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tên tài khoản</th>
                  <th>Họ và Tên</th>
                  <th>Đơn vị thực tập</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.maTaiKhoan}>
                    <td>{account.maTaiKhoan}</td>
                    <td>{account.tenTaiKhoan}</td>
                    <td>{account.hoTenGiaoVien || 'không có tên'}</td>
                    <td>{account.tenDonViThucTap || 'Chưa có'}</td>
                    <td>
                      <button
                        className="taotaikhoanqlclb-edit-button"
                        onClick={() => handleEditClick(account)}
                      >
                        Sửa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-accounts-message">Không tìm thấy tài khoản nào.</p>
        )}
      </div>

      {/* --- Form chỉnh sửa Tài khoản (Modal) --- */}
      {editingAccount && (
        <div className="edit-account-modal-overlay">
          <div className="edit-account-modal-content">
            {/* Nút đóng modal */}
            <button className="edit-account-modal-close" onClick={() => setEditingAccount(null)}>
              &times;
            </button>

            <h3 className="taotaikhoanqlclb-title">SỬA TÀI KHOẢN: {editingAccount.tenTaiKhoan}</h3>
            <form onSubmit={handleUpdateAccount}>
              <div className="edit-form-grid">
                <div className="form-group">
                  <label htmlFor="editTenTaiKhoan">Tên tài khoản</label>
                  <input
                    id="editTenTaiKhoan"
                    type="text"
                    name="tenTaiKhoan"
                    value={editForm.tenTaiKhoan}
                    onChange={handleEditFormChange}
                    required
                    placeholder="Nhập tên tài khoản"
                  />
                </div>

                {/* Removed Họ và Tên and Mật khẩu inputs from edit form */}

                <div className="form-group full-width"> {/* Changed to full-width for better layout */}
                  <label htmlFor="editDonVi">Đơn vị thực tập</label>
                  <select
                    id="editDonVi"
                    name="maDonViThucTap"
                    value={editForm.maDonViThucTap}
                    onChange={handleEditFormChange}
                  >
                    <option value="">Không có đơn vị thực tập</option>
                    {donViList.map(dv => (
                      <option key={dv.maDonViThucTap} value={dv.maDonViThucTap}>
                        {dv.tenDonViThucTap}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="edit-form-buttons">
                <button type="submit" disabled={isLoading}>
                  {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
                <button type="button" onClick={() => setEditingAccount(null)} disabled={isLoading}>
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaoTaiKhoanChoQLCLB;