// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
  return (
    <header style={{ padding: '10px', backgroundColor: '#007bff', color: '#fff' }}>
      <nav>
        <ul style={{ listStyle: 'none', display: 'flex', gap: '10px' }}>
        <li>
            <Link to="/Scalping" style={{ color: '#fff', textDecoration: 'none' }}>스캘핑연구소</Link>
          </li>
          <li>
            <Link to="/Statistics" style={{ color: '#fff', textDecoration: 'none' }}>데이터센터</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
