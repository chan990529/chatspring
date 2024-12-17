// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Layout from './Component/Layout'; // Layout을 import
import ScalpingPage from './Pages/Scalping';
import StatisticsPage from './Pages/Statistics';
import TradeNotification from "./Pages/WebSocket"; // TradeNotification을 import
import StatusPage from "./Pages/Status";
import ReviewPage from './Pages/Review';
import SimpleLogin from './Pages/SimpleLogin'; // 로그인 페이지 import

const CURRENT_VERSION = 'abc';

// ProtectedRoute 수정: 인증 및 만료 시간 검증
function ProtectedRoute({ element }) {
    const token = localStorage.getItem('authToken');
    const expiry = localStorage.getItem('authTokenExpiry');
    const savedVersion = localStorage.getItem('authTokenVersion');

    // 버전 검증 및 토큰 무효화
    const checkTokenVersion = () => {
        if (!savedVersion || savedVersion !== CURRENT_VERSION) {
            localStorage.removeItem('authToken');
            localStorage.removeItem('authTokenVersion');
            localStorage.removeItem('authTokenExpiry');
        }
    };

    // 버전 검증 실행
    checkTokenVersion();

    // 토큰 만료 검증
    const isTokenValid = () => {
        if (!token) return false; // 토큰이 없으면 무효

        if (expiry === "permanent") return true; // 영구 토큰 처리

        if (!expiry || isNaN(Number(expiry))) return false; // 만료 시간이 비정상적이면 무효

        return Date.now() <= Number(expiry); // 정상적인 만료 시간 검증
    };

    // 토큰이 무효하면 로그아웃 처리 및 리다이렉트
    if (!isTokenValid()) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('authTokenExpiry');
        return <Navigate to="/login" replace />;
    }

    return element;
}

function App() {



    return (
        <Router>
            {/* TradeNotification을 Layout 위에 두어 모든 페이지에서 알림을 받을 수 있도록 설정 */}
            <TradeNotification />
            <Routes>
                <Route path="/login" element={<SimpleLogin />} />
                <Route path="/" element={<Layout />}>
                    <Route index element={<ProtectedRoute element={<ScalpingPage />} />} />
                    <Route path="Scalping" element={<ProtectedRoute element={<ScalpingPage />} />} />
                    <Route path="Statistics" element={<ProtectedRoute element={<StatisticsPage />} />} />
                    <Route path="Status" element={<ProtectedRoute element={<StatusPage />} />} />
                    <Route path="Review" element={<ProtectedRoute element={<ReviewPage />} />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
