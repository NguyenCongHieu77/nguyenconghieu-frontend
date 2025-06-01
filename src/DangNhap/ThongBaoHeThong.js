import React from 'react';
import styled from 'styled-components';

const NotificationCard = ({ type, message, subText, onClose }) => {
  const isSuccess = type === 'success';

  // Định nghĩa màu sắc và icon dựa trên type
  const waveColor = isSuccess ? '#04e4003a' : '#ff00003a';
  const iconBgColor = isSuccess ? '#04e40048' : '#ff000048';
  const iconColor = isSuccess ? '#269b24' : '#cc0000'; // Màu đỏ đậm hơn
  const messageColor = isSuccess ? '#269b24' : '#cc0000';

  // SVG cho icon
  const checkIcon = (
    <svg className="icon" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11.9686 3.03145C12.1932 3.25603 12.1932 3.6201 11.9686 3.84468L6.21865 9.59468C5.99407 9.81926 5.62999 9.81926 5.40541 9.59468L3.03145 7.22072C2.80687 6.99614 2.80687 6.63206 3.03145 6.40748C3.25603 6.1829 3.6201 6.1829 3.84468 6.40748L5.81203 8.37483L11.1554 3.03145C11.3799 2.80687 11.744 2.80687 11.9686 3.03145Z"
        fill="currentColor"
      />
    </svg>
  );

  const crossIcon = (
    <svg className="cross-icon" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fill="currentColor"
        d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z"
        clipRule="evenodd"
        fillRule="evenodd"
      />
    </svg>
  );

  return (
    <StyledWrapper>
      <div className="card">
        <svg className="wave" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg" style={{ fill: waveColor }}>
          <path fillRule="evenodd" clipRule="evenodd" d="M0,160L48,160C96,160,192,160,288,170.7C384,181,480,203,576,192C672,181,768,139,864,138.7C960,139,1056,181,1152,192C1248,203,1344,181,1392,170.7L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
        </svg>

        <div className="icon-container" style={{ backgroundColor: iconBgColor }}>
          {isSuccess ? checkIcon : crossIcon}
        </div>

        <div className="message-text-container">
          <p className="message-text" style={{ color: messageColor }}>
            {message}
          </p>
          {subText && <p className="sub-text">{subText}</p>}
        </div>

        <div className="cross-icon" onClick={onClose}>
          {crossIcon} {/* Icon đóng dùng chung cho cả hai loại thông báo */}
        </div>
      </div>
    </StyledWrapper>
  );
};

// CSS cho NotificationCard (có thể đặt trong cùng file hoặc file riêng)
const StyledWrapper = styled.div`
  /* Đảm bảo NotificationCard hiển thị ở góc dưới bên phải và ở vị trí cố định */
position: fixed;
bottom: 5px; /* Cách mép dưới */
right: 5px;  /* Cách mép phải */
z-index: 10000; /* Hiển thị trên modal */

  
  .card {
    width: 330px;
    height: 80px;
    border-radius: 8px;
    box-sizing: border-box;
    padding: 10px 15px;
    background-color: #ffffff;
    box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 24px;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 15px;
  }
  .wave {
    position: absolute;
    transform: rotate(90deg);
    left: -31px;
    top: 32px;
    width: 80px;
    /* fill color được truyền qua style prop */
  }
  .icon-container {
    width: 35px;
    height: 35px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* background-color được truyền qua style prop */
    border-radius: 50%;
    margin-left: 8px;
  }
  .icon {
    width: 17px;
    height: 17px;
    /* color được truyền qua style prop */
  }
  .message-text-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    flex-grow: 1;
  }
  .message-text,
  .sub-text {
    margin: 0;
    cursor: default;
  }
  .message-text {
    /* color được truyền qua style prop */
    font-size: 17px;
    font-weight: 700;
  }
  .sub-text {
    font-size: 14px;
    color: #555;
  }
  .cross-icon {
    width: 18px;
    height: 18px;
    color: #555;
    cursor: pointer;
    margin-right: 5px; /* Thêm một chút khoảng cách */
  }
`;

export default NotificationCard;