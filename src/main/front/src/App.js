// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate  } from 'react-router-dom';
import Layout from './Component/Layout'; // Layout을 import
import ScalpingPage from './Pages/Scalping';
import StatisticsPage from './Pages/Statistics';
import TradeNotification from "./Pages/WebSocket"; // TradeNotification을 import
import StatusPage from "./Pages/Status";
import ReviewPage from './Pages/Review';
import SimpleLogin from './Pages/SimpleLogin'; // 로그인 페이지 import

function ProtectedRoute({ element }) {
    const isAuthenticated = !!localStorage.getItem('authToken');
    return isAuthenticated ? element : <Navigate to="/login" />;
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