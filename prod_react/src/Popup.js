import React, { useState } from 'react';

const Popup = ({ children, info }) => {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <span
      style={{
        color: 'yellow',
        textDecoration: 'underline',
        cursor: 'pointer',
      }}
      onMouseEnter={() => setShowPopup(true)}
      onMouseLeave={() => setShowPopup(false)}
    >
      {children}
      {showPopup && (
        <div
        style={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#333',
            color: 'white',  // Maximum height of the box
            minWidth: '50vw',  // Maximum width of the box (80% of the viewport width)
            width: 'auto',  // Width adjusts based on content
            padding: '10px',
            borderRadius: '5px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            transition: 'opacity 0.3s ease',
            zIndex: 100

          }}
          
        >
          {info}
        </div>
      )}
    </span>
  );
};

export default Popup;
