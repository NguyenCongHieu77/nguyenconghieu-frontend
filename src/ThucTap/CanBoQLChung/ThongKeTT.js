import './ThongKeTT.css';
import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
  Title
);

const ThongkeTT = () => {
  const [data, setData] = useState([]);
  const [chartDataStatus, setChartDataStatus] = useState(null);
  const [chartDataDot, setChartDataDot] = useState(null);
  const [chartDataBaoCao, setChartDataBaoCao] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get('http://118.69.126.49:5225/api/ChiTietThucTap/get-all');
        setData(res.data);
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
      }
    };

    fetchData();
  }, []);
const tinhTong = (dataArr) => dataArr.reduce((a, b) => a + b, 0);
  useEffect(() => {
    if (data.length === 0) return;

    // Biểu đồ 1: tình trạng xác nhận
    const counts = {
      'Đã xác nhận': 0,
      'Bị từ chối': 0,
      'Đang Xác Nhận...': 0,
    };

    data.forEach((item) => {
      const status = item.tinhTrangXacNhan;
      if (counts.hasOwnProperty(status)) {
        counts[status]++;
      }
    });

    setChartDataStatus({
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Số lượng sinh viên',
          data: Object.values(counts),
          backgroundColor: ['#4CAF50', '#F44336', '#FFC107'],
        },
      ],
    });

    // Biểu đồ 2: sinh viên theo đợt thực tập
    const dotCounts = {};
    data.forEach((item) => {
      const dot = item.tenDotThucTap || 'Không rõ';
      dotCounts[dot] = (dotCounts[dot] || 0) + 1;
    });

    setChartDataDot({
      labels: Object.keys(dotCounts),
      datasets: [
        {
          label: 'Số lượng sinh viên',
          data: Object.values(dotCounts),
          backgroundColor: '#42A5F5',
        },
      ],
    });

    

    // Biểu đồ 3: Báo cáo đạt / không đạt (đã xác nhận chờ báo cáo)
    const ketQuaCounts = {
      'Đạt': 0,
      'Không Đạt': 0,
    };

    data.forEach((item) => {
      const xacNhan = item.xacNhanChoBaoCao?.toString().toLowerCase() === 'true';
      const ketQua = item.ketQuaBaoCao?.toString().toLowerCase();

      if (xacNhan) {
        if (ketQua === 'true') {
          ketQuaCounts['Đạt']++;
        } else if (ketQua === 'false') {
          ketQuaCounts['Không Đạt']++;
        }
      }
    });

    setChartDataBaoCao({
      labels: Object.keys(ketQuaCounts),
      datasets: [
        {
          label: 'Số lượng sinh viên',
          data: Object.values(ketQuaCounts),
          backgroundColor: ['#2196F3', '#E91E63'],
        },
      ],
    });
  }, [data]);

  if (!chartDataStatus || !chartDataDot || !chartDataBaoCao)
    return <div>Đang tải dữ liệu...</div>;

  return (
    <>
      {/* Biểu đồ 1: Tình trạng xác nhận */}
      <div className="thongke-container">
        <h2 style={{ textAlign: 'center' }}>THỐNG KÊ TÌNH TRẠNG SINH VIÊN GỬI ĐĂNG KÝ</h2>
        <div className="chart-item">
          <Bar
            data={chartDataStatus}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Biểu đồ tình trạng xác nhận',
                },
                legend: {
                  display: false,
                },
              },
            }}
          />
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
  TỔNG: {tinhTong(chartDataStatus.datasets[0].data)} SINH VIÊN
</p>
        </div>
      </div>

      {/* Biểu đồ 2: Theo đợt thực tập */}
      <div className="thongke-container">
        <h2 style={{ textAlign: 'center' }}>THỐNG KÊ SINH VIÊN THEO ĐỢT THỰC TẬP</h2>
        <div className="chart-item">
          <Bar
            data={chartDataDot}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              indexAxis: 'x',
              plugins: {
                title: {
                  display: true,
                  text: 'Biểu đồ sinh viên theo đợt thực tập',
                },
                legend: {
                  display: false,
                },
              },
              scales: {
                x: {
                  ticks: {
                    maxRotation: 45,
                    minRotation: 30,
                    autoSkip: false,
                  },
                },
              },
            }}
          />
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
  TỔNG: {tinhTong(chartDataDot.datasets[0].data)} SINH VIÊN
</p>
        </div>
      </div>

      {/* Biểu đồ 3: Kết quả báo cáo */}
      <div className="thongke-container">
        <h2 style={{ textAlign: 'center' }}>THỐNG KÊ KẾT QUẢ BÁO CÁO</h2>
        <div className="chart-item">
          <Bar
            data={chartDataBaoCao}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Biểu đồ kết quả báo cáo (chỉ sinh viên đã xác nhận)',
                },
                legend: {
                  display: false,
                },
              },
            }}
          />
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
  TỔNG: {tinhTong(chartDataBaoCao.datasets[0].data)} SINH VIÊN
</p>
        </div>
      </div>
    </>
  );
};

export default ThongkeTT;
