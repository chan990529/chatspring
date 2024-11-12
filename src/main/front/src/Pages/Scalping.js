import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, Typography, Grid, TextField, useMediaQuery, Avatar, Box } from '@mui/material';
import CloseImage from '../Image/Close.png';
import OpenImage from '../Image/Open.png';
import EmptyImage from '../Image/Empty.png';
axios.defaults.baseURL = 'https://scalping.app';
// axios.defaults.baseURL = 'http://localhost:8080';

const ScriptStatus = () => {
  const [status, setStatus] = useState({
    status: 'Loading...',
    lastUpdateTime: 'N/A',
    details: 'N/A',
    error: null
  });



  useEffect(() => {
    const fetchStatus = () => {
      axios.get('/api/monitoring/status')
        .then((response) => {
          setStatus(response.data);
        })
        .catch((error) => {
          console.error('Failed to fetch script status:', error);
          setStatus((prevStatus) => ({
            ...prevStatus,
            error: 'Failed to fetch status'
          }));
        });
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card sx={{ marginBottom: 2 }}>
      <CardContent>
        <Typography variant="h5">연구소 통신상태</Typography>
        <Typography><strong>상태:</strong> {status.status}</Typography>
        <Typography><strong>최종 업데이트:</strong> {status.lastUpdateTime}</Typography>
        <Typography><strong>내용:</strong> {status.details}</Typography>
        {status.error && (
          <Typography color="error"><strong>Error:</strong> {status.error}</Typography>
        )}
      </CardContent>
    </Card>
  );
};

const VirtualTradeCard = ({ trade }) => {
  // 매매 결과에 따른 이미지 경로 설정
  let tradeResultImage = CloseImage;
  if (trade.tradeResult === "승리") {
    tradeResultImage = OpenImage;
  } else if (trade.tradeResult === "패배") {
    tradeResultImage = EmptyImage;
  }

  return (
      <Card
          sx={{
            marginBottom: 2,
            backgroundColor:
                trade.tradeResult === "승리" ? '#54ED7F' :
                    trade.tradeResult === "패배" ? '#DB4455' :
                        trade.tradeResult === "N/A" ? '#B0B0B0' : 'default',
            position : 'relative'
          }}
      >
        <CardContent>
          {/* Avatar와 제목 부분을 묶어서 정렬 */}
          <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
            <Avatar
                src={tradeResultImage}
                alt="매매 결과"
                sx={{
                  width: 90,
                  height: 90,
                  marginRight: 2,
                  position : 'absolute'
                }}
            />
            <Typography variant="h6"><strong>종목명:</strong> {trade.stockName}</Typography>
          </Box>

          {/* 나머지 정보 표시 */}
          <Typography><strong>평단가:</strong> {trade.buyPrice}</Typography>
          <Typography><strong>매수일:</strong> {new Date(trade.buyTime).toLocaleString('ko-KR')}</Typography>
          <Typography><strong>매수횟수:</strong> {trade.numBuys}</Typography>
          <Typography><strong>매매결과:</strong> {trade.tradeResult}</Typography>
          <Typography><strong>손절가:</strong> {trade.stopLossPrice}</Typography>
          <Typography><strong>조건식:</strong> {trade.conditionType}</Typography>
          <Typography><strong>1% 매도가:</strong> {trade.sellPrice1 ? trade.sellPrice1 : 'N/A'}</Typography>
          <Typography><strong>1% 경과시간:</strong> {trade.reachTime1}</Typography>
          <Typography><strong>2% 매도가:</strong> {trade.sellPrice2 ? trade.sellPrice2 : 'N/A'}</Typography>
          <Typography><strong>2% 경과시간:</strong> {trade.reachTime2}</Typography>
          <Typography><strong>3% 매도가:</strong> {trade.sellPrice3 ? trade.sellPrice3 : 'N/A'}</Typography>
          <Typography><strong>3% 경과시간:</strong> {trade.reachTime3}</Typography>
        </CardContent>
      </Card>
  );
};

const VirtualTradeTable = () => {
  const [virtualTrades, setVirtualTrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchTodayTrades();
  }, []);

  const fetchTodayTrades = () => {
    const today = new Date().toISOString().split('T')[0];
    axios.get(`/api/trades?date=${today}`)
      .then(response => {
        setVirtualTrades(response.data);
        setIsSearching(false);
      })
      .catch(error => {
        console.error('There was an error fetching the virtual trades!', error);
      });
  };

  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
      setIsSearching(true);
      // 검색 시에는 날짜 제한 없이 전체 검색
      axios.get(`/api/trades?search=${searchQuery}`)
        .then(response => {
          setVirtualTrades(response.data);
        })
        .catch(error => {
          console.error('There was an error fetching the virtual trades!', error);
        });
    } else {
      // 검색어가 비었을 때는 다시 오늘 날짜 데이터만 표시
      fetchTodayTrades();
    }
  };

  const handleSearchChange = (e) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    
    // 검색어가 비워졌을 때 오늘 날짜 데이터로 복원
    if (newQuery === '') {
      fetchTodayTrades();
    }
  };

  const filteredTrades = virtualTrades.filter(trade => {
    const matchesSearch = trade.stockName.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (isSearching) {
      // 검색 중일 때는 모든 날짜의 데이터 표시
      return matchesSearch;
    } else {
      // 검색 중이 아닐 때는 오늘 날짜 데이터만 표시
      const today = new Date();
      const tradeDate = new Date(trade.buyTime);
      const isSameDay = 
        today.getFullYear() === tradeDate.getFullYear() &&
        today.getMonth() === tradeDate.getMonth() &&
        today.getDate() === tradeDate.getDate();
      
      return isSameDay && matchesSearch;
    }
  });

  return (
    <div>
      <TextField
        label="종목명 검색"
        variant="outlined"
        fullWidth
        margin="normal"
        value={searchQuery}
        onChange={handleSearchChange}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />
      {filteredTrades.length > 0 ? (
        filteredTrades.map((trade) => (
          <VirtualTradeCard key={trade.tradeId} trade={trade} />
        ))
      ) : (
        <Typography>해당 종목이 없습니다.</Typography>
      )}
    </div>
  );
};

const MonitoringAndTrades = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  return (
    <Grid container spacing={2} direction={isMobile ? 'column' : 'row'}>
      <Grid item xs={12} md={6}>
        <ScriptStatus />
      </Grid>
      <Grid item xs={12} md={6}>
        <VirtualTradeTable />
      </Grid>
    </Grid>
  );
};

export default MonitoringAndTrades;