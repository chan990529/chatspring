import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import theme from './theme';  // 만든 테마 파일 import
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";

// VAPID Public Key를 Base64에서 Uint8Array로 변환하는 함수
const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <App />
        </ThemeProvider>
    </React.StrictMode>
);

// Service Worker 등록
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
        .then(function(registration) {
            console.log('Service Worker 등록 성공:', registration);

            // Service Worker 준비 이후 Push Subscription 구독
            navigator.serviceWorker.ready.then((registration) => {
                registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array('BFJG1gHuoGRcNzD8N8uZMvltfQIY6kJhA9RzsJ9InK3TyUcpq7DSHIg_chFQrn3xYRT4q4RfkU1MA_7I0rboLVQ') // VAPID 공개키 사용
                })
                    .then((subscription) => {
                        console.log('Push Subscription:', subscription);

                        // 구독 정보를 서버에 전송
                        fetch('/api/notifications/save-subscription', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(subscription)
                        })
                            .then((response) => {
                                if (response.ok) {
                                    console.log('구독 정보 서버 전송 성공');
                                } else {
                                    console.error('구독 정보 서버 전송 실패:', response.status);
                                }
                            })
                            .catch((error) => console.error('구독 정보 전송 중 오류:', error));
                    })
                    .catch((error) => {
                        console.error('Push Subscription 실패:', error);
                    });
            });
        })
        .catch(function(error) {
            console.error('Service Worker 등록 실패:', error);
        });
}

// CRA 기본 설정
serviceWorkerRegistration.register();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();