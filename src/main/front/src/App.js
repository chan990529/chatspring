// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './Component/Layout'; // Layout을 import
import ScalpingPage from './Pages/Scalping';
import StatisticsPage from './Pages/Statistics';
import TradeNotification from "./Pages/WebSocket"; // TradeNotification을 import
import StatusPage from "./Pages/Status";
import ReviewPage from './Pages/Review';


function App() {
    return (
        <Router>
            {/* TradeNotification을 Layout 위에 두어 모든 페이지에서 알림을 받을 수 있도록 설정 */}
            <TradeNotification />
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<ScalpingPage />} />
                    <Route path="Scalping" element={<ScalpingPage />} />
                    <Route path="Statistics" element={<StatisticsPage />} />
                    <Route path="Status" element={<StatusPage />}/>
                    <Route path="Review" element={<ReviewPage />}/>
                </Route>
            </Routes>
        </Router>
    );
}

export default App;