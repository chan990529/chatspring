// src/components/Header.js
import React from 'react';
import { Link } from 'react-router-dom';

function Header() {
    return (
        <header style={{ padding: '10px 20px', backgroundColor: '#007bff', color: '#fff' }}>
            <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* 왼쪽 로고 또는 제목 */}
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                    <Link to="/Scalping" style={{ color: '#fff', textDecoration: 'none' }}>
                        스캘핑연구소
                    </Link>
                </div>

                {/* 오른쪽 메뉴 항목 */}
                <ul style={{ listStyle: 'none', display: 'flex', gap: '20px', margin: 0 }}>
                    <li>
                        <Link to="/Statistics" style={{ color: '#fff', textDecoration: 'none' }}>
                            데이터센터
                        </Link>
                    </li>
                    {/* 필요에 따라 더 많은 메뉴 항목 추가 가능 */}
                </ul>
            </nav>
        </header>
    );
}

export default Header;
