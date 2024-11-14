import React, { useState, useEffect } from 'react';
import { Grid, Fab } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

function RefreshableGrid() {
    const [gridData, setGridData] = useState([]);

    const fetchGridData = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const response = await fetch('https://scalping.app/api/trades?date=${today}');
            if (!response.ok) {
                throw new Error(`HTTP error ${response.status}`);
            }
            const data = await response.json();
            setGridData(data);
        } catch (error) {
            console.error('Error fetching grid data:', error);
            // 오류 메시지 표시 등의 처리
        }
    };

    useEffect(() => {
        fetchGridData(); // 컴포넌트가 처음 마운트될 때 데이터 로드
    }, []);

    const handleRefresh = () => {
        fetchGridData();
    };

    return (
        <Fab
            color="secondary"
            onClick={handleRefresh}
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 1000
            }}
        >
            <RefreshIcon />
        </Fab>
    );
}

export default RefreshableGrid;
