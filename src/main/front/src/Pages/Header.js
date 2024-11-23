import React, { useState } from 'react';
import { Tabs, Tab } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

function Header() {
    const navigate = useNavigate();
    const location = useLocation();

    // 현재 활성화된 탭을 상태로 관리
    const [value, setValue] = useState(() => {
        if (location.pathname === '/Scalping') return 0;
        if (location.pathname === '/Statistics') return 1;
        return 0; // 기본값
    });

    const handleChange = (event, newValue) => {
        setValue(newValue);
        if (newValue === 0) {
            navigate('/Scalping');
        } else if (newValue === 1) {
            navigate('/Statistics');
        }
    };

    return (
        <Tabs
            value={value}
            onChange={handleChange}
            variant="fullWidth"
            sx={{
                '& .MuiTab-root': {
                    color: '##DDDDDD', // 탭 텍스트 색상
                    fontWeight: 'bold', // 텍스트 굵기
                    fontSize: '18px', // 텍스트 크기
                },
                '& .Mui-selected': {
                    backgroundColor: '#cce5ee', // 선택된 탭의 배경색
                    color: '#cce5ee', // 선택된 텍스트 색상
                },
            }}
        >
            <Tab label="스캘핑연구소" />
            <Tab label="데이터센터" />
        </Tabs>
    );
}

export default Header;