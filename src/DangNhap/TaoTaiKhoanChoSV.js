import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './TaoTaiKhoanChoSV.css'; // Import file CSS riêng
import NotificationCard from './ThongBaoHeThong'; // Assuming ThongBaoHeThong.js is NotificationCard

const TaoTaiKhoanChoSV = () => {
    // State để lưu danh sách sinh viên gốc
    const [sinhViens, setSinhViens] = useState([]);
    // State để xử lý trạng thái tải dữ liệu
    const [loading, setLoading] = useState(true);
    // State để xử lý lỗi
    const [error, setError] = useState(null);
    // States for Notification Card
    const [showNotification, setShowNotification] = useState(false);
    const [notificationType, setNotificationType] = useState('');
    const [notificationMessage, setNotificationMessage] = useState('');
    const [notificationSubText, setNotificationSubText] = useState('');

    // States for search and filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLop, setFilterLop] = useState('');
    const [filterGioiTinh, setFilterGioiTinh] = useState('');
    const [filterTrangThai, setFilterTrangThai] = useState('');
    const [filterCoTaiKhoan, setFilterCoTaiKhoan] = useState(''); // 'true', 'false', or ''

    // List of unique classes for the filter dropdown
    const uniqueLops = useMemo(() => {
        const lops = new Set(sinhViens.map(sv => sv.lop).filter(Boolean));
        return ['', ...Array.from(lops).sort()]; // Add empty string for "All" option
    }, [sinhViens]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all students
                const studentsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/SinhVien/get-all`);
                const studentsData = studentsResponse.data;

                // Fetch accounts that already exist for students
                const existingAccountsResponse = await axios.get(`${process.env.REACT_APP_API_URL}/api/Account/get-tai-khoan-sinhvien`);
                const existingAccounts = existingAccountsResponse.data.map(account => account.tenTaiKhoan);

                // Add a 'coTaiKhoan' property to each student object based on existing accounts
                const initialData = studentsData.map(sv => ({
                    ...sv,
                    coTaiKhoan: existingAccounts.includes(sv.mssv)
                }));
                setSinhViens(initialData);
            } catch (err) {
                setError('Không thể tải dữ liệu sinh viên hoặc tài khoản. Vui lòng thử lại sau.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Memoized filtered and searched student list
    const filteredSinhViens = useMemo(() => {
        return sinhViens.filter(sv => {
            // Search by MSSV or Full Name
            const matchesSearch = searchTerm === '' ||
                                  sv.mssv.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  `${sv.hoSinhVien} ${sv.tenSinhVien}`.toLowerCase().includes(searchTerm.toLowerCase());

            // Filter by Class
            const matchesLop = filterLop === '' || sv.lop === filterLop;

            // Filter by Gender
            const matchesGioiTinh = filterGioiTinh === '' ||
                                    (filterGioiTinh === 'Nam' && sv.gioiTinh === 'True') ||
                                    (filterGioiTinh === 'Nữ' && sv.gioiTinh === 'False');

            // Filter by Status
            const matchesTrangThai = filterTrangThai === '' ||
                                     (filterTrangThai === 'Đang học' && sv.trangThai === '1') ||
                                     (filterTrangThai === 'Đã nghỉ' && sv.trangThai === '4');

            // Filter by Account Status
            const matchesCoTaiKhoan = filterCoTaiKhoan === '' ||
                                       (filterCoTaiKhoan === 'true' && sv.coTaiKhoan) || // CORRECTED LINE HERE
                                       (filterCoTaiKhoan === 'false' && !sv.coTaiKhoan);

            return matchesSearch && matchesLop && matchesGioiTinh && matchesTrangThai && matchesCoTaiKhoan;
        });
    }, [sinhViens, searchTerm, filterLop, filterGioiTinh, filterTrangThai, filterCoTaiKhoan]);

    // Hàm xử lý tạo tài khoản
    const handleTaoTaiKhoan = async (mssv) => {
        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/api/Account/tao-tai-khoan-cho-sinh-vien`, { mssv });
            setNotificationType('success');
            setNotificationMessage(`Tạo tài khoản cho sinh viên ${mssv} thành công!`);
            setNotificationSubText('Tài khoản đã được tạo.');
            setShowNotification(true);

            // Update state to change the button and keep filters applied
            setSinhViens(prevSinhViens =>
                prevSinhViens.map(sv =>
                    sv.mssv === mssv ? { ...sv, coTaiKhoan: true } : sv
                )
            );
        } catch (err) {
            setNotificationType('error');
            setNotificationMessage('Tạo tài khoản thất bại!');
            setNotificationSubText(err.response?.data?.message || err.message);
            setShowNotification(true);
            console.error(err);
        }
    };

    // Hàm xử lý xóa tài khoản
    const handleXoaTaiKhoan = async (mssv) => {
        try {
            const payload = {
                tenTaiKhoan: mssv,
                maNhomTaiKhoan: 3
            };
            await axios.delete(`${process.env.REACT_APP_API_URL}/api/Account/xoa-tai-khoan-sinh-vien`, { data: payload });
            setNotificationType('success');
            setNotificationMessage(`Xóa tài khoản của sinh viên ${mssv} thành công!`);
            setNotificationSubText('Tài khoản đã được xóa.');
            setShowNotification(true);

            // Cập nhật lại state để thay đổi nút và keep filters applied
            setSinhViens(prevSinhViens =>
                prevSinhViens.map(sv =>
                    sv.mssv === mssv ? { ...sv, coTaiKhoan: false } : sv
                )
            );
        } catch (err) {
            setNotificationType('error');
            setNotificationMessage('Xóa tài khoản thất bại!');
            setNotificationSubText(err.response?.data?.message || err.message);
            setShowNotification(true);
            console.error(err);
        }
    };

    if (loading) {
        return <div className="htsv-container">Đang tải danh sách sinh viên...</div>;
    }

    if (error) {
        return <div className="htsv-container htsv-error">{error}</div>;
    }

    return (
        <div className="htsv-container">
            <h2>QUẢN LÝ TÀI KHOẢN SINH VIÊN</h2>

            {/* --- Search and Filter Controls --- */}
            <div className="htsv-filters">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo MSSV hoặc Họ tên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="htsv-search-input"
                />

                <select
                    value={filterLop}
                    onChange={(e) => setFilterLop(e.target.value)}
                    className="htsv-filter-select"
                >
                    <option value="">Lọc theo Lớp</option>
                    {uniqueLops.map(lop => (
                        <option key={lop} value={lop}>{lop || 'Tất cả'}</option>
                    ))}
                </select>

               

                <select
                    value={filterTrangThai}
                    onChange={(e) => setFilterTrangThai(e.target.value)}
                    className="htsv-filter-select"
                >
                    <option value="">Lọc theo Trạng Thái</option>
                    <option value="Đang học">Đang học</option>
                    <option value="Đã nghỉ">Đã nghỉ</option>
                </select>

                <select
                    value={filterCoTaiKhoan}
                    onChange={(e) => setFilterCoTaiKhoan(e.target.value)}
                    className="htsv-filter-select"
                >
                    <option value="">Lọc theo Tài Khoản</option>
                    <option value="true">Có tài khoản</option>
                    <option value="false">Chưa có tài khoản</option>
                </select>
            </div>
            {/* --- End Search and Filter Controls --- */}

            <table className="htsv-table">
                <thead>
                    <tr>
                        <th>MSSV</th>
                        <th>Họ và Tên</th>
                        <th>Lớp</th>
                        <th>Email</th>
                        {/* <th>Giới Tính</th> */}
                        <th>Địa Chỉ</th>
                        <th>Điện Thoại</th>
                        <th>Trạng Thái</th>
                        <th>Hành Động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSinhViens.length > 0 ? (
                        filteredSinhViens.map((sv) => (
                            <tr key={sv.mssv}>
                                <td>{sv.mssv}</td>
                                <td>{`${sv.hoSinhVien} ${sv.tenSinhVien}`}</td>
                                <td>{sv.lop}</td>
                                <td>{sv.email}</td>
                                {/* <td>{sv.gioiTinh === 'True' ? 'Nam' : 'Nữ'}</td> */}
                                <td>{sv.diaChi}</td>
                                <td>{sv.dienThoai}</td>
                                <td>{sv.trangThai === '1' ? 'Đang học' : 'Đã nghỉ'}</td>
                                <td>
                                    {sv.coTaiKhoan ? (
                                        <button
                                            className="htsv-btn htsv-btn-xoa"
                                            onClick={() => handleXoaTaiKhoan(sv.mssv)}
                                        >
                                            Xóa Tài Khoản
                                        </button>
                                    ) : (
                                        <button
                                            className="htsv-btn htsv-btn-tao"
                                            onClick={() => handleTaoTaiKhoan(sv.mssv)}
                                        >
                                            Tạo Tài Khoản
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="9" style={{ textAlign: 'center', padding: '20px' }}>
                                Không tìm thấy sinh viên nào phù hợp với điều kiện tìm kiếm.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

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

export default TaoTaiKhoanChoSV;