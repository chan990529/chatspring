// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header style={{ backgroundColor: '#007bff', color: '#fff', display: 'flex'}}>
            {/* 왼쪽 절반 클릭 영역 */}
            <Link
                to="/Scalping"
                style={{
                    color: '#fff',
                    textDecoration: 'none',
                    width: '50%',
                    padding: '10px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}
            >
                스캘핑연구소
            </Link>

            {/* 오른쪽 절반 클릭 영역 */}
            <Link
                to="/Statistics"
                style={{
                    color: '#fff',
                    textDecoration: 'none',
                    width: '50%',
                    padding: '10px 0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '18px'
                }}
            >
                데이터센터
            </Link>
        </header>
    );
}

export default Header;
