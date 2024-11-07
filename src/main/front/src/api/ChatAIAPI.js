import axios from 'axios';

// API 클라이언트 생성
const apiClient = axios.create({
    baseURL: 'http://localhost:8080',  // 백엔드 서버의 기본 URL
    headers: {
        'Content-Type': 'application/json',  // JSON 형태로 요청을 보냄
    }
});

// 메시지 전송 함수
const sendMessageApi = (message) => {
    // POST 요청으로 메시지 전송
    return apiClient.post('/api/chat', {
        message: message   // 메시지를 요청 본문(body)에 포함
    });
};

export default sendMessageApi;