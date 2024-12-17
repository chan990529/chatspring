// src/Pages/SimpleLogin.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SimpleLogin = () => {
    const [loginCode, setLoginCode] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async () => {
        try {
            const response = await axios.post('https://scalping.app/api/login', { code: loginCode });
            if (response.status === 200) {
                localStorage.setItem('authToken', response.data.token); // 인증 토큰 저장
                setMessage('로그인 성공!');
                navigate('/'); // 로그인 성공 시 메인 페이지로 이동
            } else {
                setMessage('로그인 실패. 올바른 코드를 입력하세요.');
            }
        } catch (error) {
            setMessage('로그인에 실패했습니다. 다시 시도해 주세요.');
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h2>!나는</h2>
            <input
                type="password"
                value={loginCode}
                onChange={(e) => setLoginCode(e.target.value)}
                placeholder="정답 입력"
            />
            <br />
            <button onClick={handleLogin} style={{ marginTop: '20px' }}>
                로그인
            </button>
            <p>{message}</p>
        </div>
    );
};

export default SimpleLogin;