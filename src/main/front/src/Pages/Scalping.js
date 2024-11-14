import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { TextField, Typography, RadioGroup, FormControlLabel, Radio, Card, Select, MenuItem, FormControl, InputLabel, CardContent, Avatar, useMediaQuery, Box, Grid} from '@mui/material';
import CloseImage from './Close.png';
import OpenImage from './Open.png';
import EmptyImage from './Empty.png';
import './Scalping.css';  // CSS 파일을 따로 관리
import ScrollToTop from './ScrollToTop';
import RefreshableGrid from "./RefreshableGrid";


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
                            trade.tradeResult === "" ? '#B0B0B0' : 'default',
                position: 'relative'
            }}
        >
            <CardContent>
                {/* Avatar와 제목 부분을 묶어서 정렬 */}
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, gap: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            wordBreak: 'break-word',
                            whiteSpace: 'normal',
                            flex: 1
                        }}
                    >
                        <strong>종목명:</strong> {trade.stockName}
                    </Typography>
                    <Avatar
                        src={tradeResultImage}
                        alt="매매 결과"
                        sx={{
                            width: 70,
                            height: 80,
                            borderRadius: 0
                        }}
                    />
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

const VirtualTradeTable = ({ refreshKey }) => {
  const [virtualTrades, setVirtualTrades] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [sortOrder, setSortOrder] = useState('desc'); // 정렬 순서: 'asc' 또는 'desc'
  const [resultFilter, setResultFilter] = useState('all'); // 결과 필터링 상태: 'all', '승리', '패배', 'none'

    useEffect(() => {
        fetchTodayTrades();
    }, [refreshKey]); // refreshKey가 변경될 때마다 fetchTodayTrades를 호출

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
          console.error('불러오기 오류!', error);
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

  const handleSortOrderChange = (e) => {
      setSortOrder(e.target.value);
  };

  const handleResultFilterChange = (e) => {
      setResultFilter(e.target.value);
  };
    const filteredTrades = virtualTrades
        .filter(trade => {
            const matchesSearch = trade.stockName.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesResult =
                resultFilter === 'all' ||
                (resultFilter === '승리' && trade.tradeResult === '승리') ||
                (resultFilter === '패배' && trade.tradeResult === '패배') ||
                (resultFilter === 'none' && !trade.tradeResult); // 결과가 없는 경우

            return matchesSearch && matchesResult;
        })
        .sort((a, b) =>
            sortOrder === 'asc'
                ? new Date(a.buyTime) - new Date(b.buyTime)  // 정순 정렬
                : new Date(b.buyTime) - new Date(a.buyTime)  // 역순 정렬
        );

    return (
        <div>
            <RadioGroup row value={sortOrder} onChange={handleSortOrderChange}>
                <FormControlLabel value="asc" control={<Radio />} label="시간 정순" />
                <FormControlLabel value="desc" control={<Radio />} label="시간 역순" />
            </RadioGroup>

            <FormControl fullWidth margin="normal">
                <InputLabel>매매 결과 필터</InputLabel>
                <Select
                    value={resultFilter}
                    onChange={handleResultFilterChange}
                    label="매매 결과 필터"
                >
                    <MenuItem value="all">전체</MenuItem>
                    <MenuItem value="승리">승리</MenuItem>
                    <MenuItem value="패배">패배</MenuItem>
                    <MenuItem value="none">결과 없음</MenuItem>
                </Select>
            </FormControl>

            <TextField
                label="종목명 검색"
                variant="outlined"
                fullWidth
                margin="normal"
                value={searchQuery}
                onChange={handleSearchChange}
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
    const containerRef = useRef(null);

    const [refreshKey, setRefreshKey] = useState(0); // 새로고침을 위한 키 값
    const refreshTrades = () => {
        setRefreshKey((prevKey) => prevKey + 1);
    };

    return (
        <Box
            ref={containerRef}
            sx={{
                height: '100vh',
                overflow: 'auto',
                position: 'relative',
                padding: 2,
                gap : 1
            }}
        >
            <Grid
                container
                spacing={2}
                direction={isMobile ? 'column' : 'row'}
            >
                <Grid item xs={12} md={6}>
                    <ScriptStatus />
                </Grid>
                <Grid item xs={12} md={6}>
                    <VirtualTradeTable refreshKey={refreshKey} />
                </Grid>
            </Grid>
            <ScrollToTop scrollRef={containerRef} />
            <RefreshableGrid onRefresh={refreshTrades} />
        </Box>
    );
};

export default MonitoringAndTrades;