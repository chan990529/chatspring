import React, { useState, useEffect } from 'react';
import { Grid, Fab } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

function RefreshableGrid() {
    const [gridData, setGridData] = useState([]);

    const fetchGridData = async () => {
        // 여기에서 API를 호출하거나 데이터를 불러옵니다.
        const data = await fetch("API_ENDPOINT").then((res) => res.json());
        setGridData(data);
    };

    useEffect(() => {
        fetchGridData(); // 컴포넌트가 처음 마운트될 때 데이터 로드
    }, []);

    const handleRefresh = () => {
        fetchGridData(); // 데이터 다시 로드
    };

    return (
        <div>
            <Grid container spacing={2}>
                {gridData.map((item, index) => (
                    <Grid item xs={4} key={index}>
                        <div>{item.name}</div>
                    </Grid>
                ))}
            </Grid>


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
            )
        </div>
    );
}

export default RefreshableGrid;
