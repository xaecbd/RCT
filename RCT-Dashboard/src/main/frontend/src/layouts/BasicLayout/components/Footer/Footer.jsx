import React from 'react';
import Logo from '../Logo';

export default () => {
  return (
    <div
      style={{
        width: '100%',
        padding: '20px 40px',
        textAlign: 'center',
        lineHeight: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingBottom: '20px',
         position: 'absolute',
        bottom: '0',
        height: '50px',

      }}
    >
      <div style={{ filter: 'grayscale(100%)', opacity: 0.3 }}>
        <Logo isDark />
      </div>
      <div
        style={{
          color: '#999',
          lineHeight: 1.5,
          fontSize: 12,
          textAlign: 'right',
        }}
      >
       EC-BigData Team
        <br />
        © 2019 版权所有
      </div>
    </div>
  );
};


