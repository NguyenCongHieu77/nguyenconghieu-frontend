// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './index.css';
// import App from './App';
// import reportWebVitals from './reportWebVitals';
// import axios from 'axios';

// // 1) Dùng env làm baseURL
// axios.defaults.baseURL       = process.env.REACT_APP_API_URL; // http://localhost:5225
// axios.defaults.withCredentials = true;
// axios.interceptors.request.use(cfg => {
//   const token = localStorage.getItem('accessToken');
//   if (token) cfg.headers.Authorization = `Bearer ${token}`;
//   return cfg;
// });

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>
// );

// reportWebVitals();

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import axios from 'axios';


// 1) Base URL từ .env
axios.defaults.baseURL       = process.env.REACT_APP_API_URL;  // ví dụ "http://localhost:5225"
// 2) Cho phép gửi cookie HttpOnly (AccessToken/RefreshToken)
axios.defaults.withCredentials = true;

// **BỎ** interceptor gắn header Authorization
// axios.interceptors.request.use(...)

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
