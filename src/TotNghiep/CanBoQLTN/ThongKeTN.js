import './ThongKeTN.css';
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

const ThongKeTN = () => {
  const [data, setData] = useState([]);
  const [chartDataTrangThai, setChartDataTrangThai] = useState(null);
  const [chartDataKetQua, setChartDataKetQua] = useState(null);
  const [chartDataDot, setChartDataDot] = useState(null);


  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/api/ChiTietSinhVienDKTN/get-all`);
        setData(res.data);
      } catch (err) {
        console.error('Lỗi khi gọi API:', err);
      }
    };

    fetchData();
  }, []);

  const tinhTong = (arr) => arr.reduce((a, b) => a + b, 0);

  useEffect(() => {
    if (data.length === 0) return;

    // Biểu đồ 1: Thống kê theo maTrangThai
    const counts = {
      'Chưa đủ điều kiện báo cáo': 0,
      'Đủ điều kiện báo cáo': 0,
      'Bị từ chối': 0,
    };

    data.forEach((item) => {
      switch (item.maTrangThai) {
        case '0':
          counts['Chưa đủ điều kiện báo cáo']++;
          break;
        case '1':
          counts['Đủ điều kiện báo cáo']++;
          break;
        case '2':
          counts['Bị từ chối']++;
          break;
        default:
          break;
      }
    });

    setChartDataTrangThai({
      labels: Object.keys(counts),
      datasets: [
        {
          label: 'Số lượng sinh viên',
          data: Object.values(counts),
          backgroundColor: ['#FFC107', '#4CAF50', '#F44336'],
        },
      ],
    });

    // Biểu đồ 3: Thống kê số lượng sinh viên theo từng đợt (maDotDKTN)
const dotCounts = {};

data.forEach((item) => {
  const maDot = item.maDotDKTN;
  const tenDot = item.tenDotDKTN;

  if (!dotCounts[maDot]) {
    dotCounts[maDot] = { count: 0, tenDot: tenDot };
  }

  dotCounts[maDot].count++;
});

const labelsDot = Object.values(dotCounts).map((item) => item.tenDot);
const dataDot = Object.values(dotCounts).map((item) => item.count);

setChartDataDot({
  labels: labelsDot,
  datasets: [
    {
      label: 'Số lượng sinh viên',
      data: dataDot,
      backgroundColor: '#673AB7',
    },
  ],
});


    // Biểu đồ 2: Kết quả tốt nghiệp cho sinh viên đủ điều kiện báo cáo
    const ketQuaCounts = {
      'Đạt': 0,
      'Không Đạt': 0,
    };

    data.forEach((item) => {
      if (item.maTrangThai === '1') {
        const result = item.ketQuaTotNghiep?.toString().toLowerCase();
        if (result === 'true') {
          ketQuaCounts['Đạt']++;
        } else if (result === 'false') {
          ketQuaCounts['Không Đạt']++;
        }
      }
    });

    setChartDataKetQua({
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

  if (!chartDataTrangThai || !chartDataKetQua || !chartDataDot)
  return <div>Đang tải dữ liệu...</div>;


  return (
    <>

{/* Biểu đồ 3: Thống kê theo đợt */}
<div className="thongke-container">
  <h2 style={{ textAlign: 'center' }}>THỐNG KÊ SỐ LƯỢNG SINH VIÊN THEO ĐỢT ĐĂNG KÝ TỐT NGHIỆP</h2>
  <div className="chart-item">
    <Bar
      data={chartDataDot}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Biểu đồ số lượng sinh viên theo từng đợt',
          },
          legend: {
            display: false,
          },
        },
      }}
    />
    <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
      TỔNG: {tinhTong(chartDataDot.datasets[0].data)} SINH VIÊN
    </p>
  </div>
</div>

      {/* Biểu đồ 1: Tình trạng báo cáo */}
      <div className="thongke-container">
        <h2 style={{ textAlign: 'center' }}>THỐNG KÊ ĐIỀU KIỆN BÁO CÁO TỐT NGHIỆP</h2>
        <div className="chart-item">
          <Bar
            data={chartDataTrangThai}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Biểu đồ tình trạng điều kiện báo cáo tốt nghiệp',
                },
                legend: {
                  display: false,
                },
              },
            }}
          />
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            TỔNG: {tinhTong(chartDataTrangThai.datasets[0].data)} SINH VIÊN
          </p>
        </div>
      </div>

      


      {/* Biểu đồ 2: Kết quả tốt nghiệp */}
      <div className="thongke-container">
        <h2 style={{ textAlign: 'center' }}>THỐNG KÊ KẾT QUẢ TỐT NGHIỆP (SV ĐỦ ĐIỀU KIỆN)</h2>
        <div className="chart-item">
          <Bar
            data={chartDataKetQua}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                title: {
                  display: true,
                  text: 'Biểu đồ kết quả tốt nghiệp',
                },
                legend: {
                  display: false,
                },
              },
            }}
          />
          <p style={{ textAlign: 'center', fontWeight: 'bold' }}>
            TỔNG: {tinhTong(chartDataKetQua.datasets[0].data)} SINH VIÊN
          </p>
        </div>
      </div>
    </>
  );
};

export default ThongKeTN;
