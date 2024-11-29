import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
    TextField,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Card,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CardContent,
    Avatar,
    useMediaQuery,
    Box,
    Grid,
    IconButton,
    Checkbox,
    Button,
} from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';
import { DateTime } from 'luxon';
import CloseImage from './Close.png';
import OpenImage from './Open.png';
import EmptyImage from './Empty.png';
import './Scalping.css';  // CSS 파일을 따로 관리
import ScrollToTop from './ScrollToTop';
import RefreshableGrid from "./RefreshableGrid";
import { Popover } from '@mui/material';

axios.defaults.baseURL = 'https://scalping.app';

// axios.defaults.baseURL = 'http://localhost:8080';

const TitleText = ({ tradeStats }) => {
    const { winRate = 0, lossRate = 0, ongoingRate = 0 } = tradeStats || {};

    return (
        <Card sx={{ marginBottom: 2 }}>
            <CardContent>
                <Typography variant="h5">喝!!!!!!!!!!!!</Typography>
                <Typography variant="h5">다산 파이버는 당장 1% 수익대까지 회복하라!!!!</Typography>
                <Typography variant="h6" sx={{ marginTop: 2, marginBottom: 1 }}>오늘의 매매 결과 점유율</Typography>

                {/* 누적 프로그래스바 */}
                <Box sx={{ position: 'relative', height: 30, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' }}>
                    <Box
                        sx={{
                            width: `${winRate}%`,
                            backgroundColor: '#4caf50', // 승리 색상
                            height: '100%',
                            display: 'inline-block',
                        }}
                    />
                    <Box
                        sx={{
                            width: `${lossRate}%`,
                            backgroundColor: '#f44336', // 패배 색상
                            height: '100%',
                            display: 'inline-block',
                        }}
                    />
                    <Box
                        sx={{
                            width: `${ongoingRate}%`,
                            backgroundColor: '#2196f3', // 진행중 색상
                            height: '100%',
                            display: 'inline-block',
                        }}
                    />
                </Box>

                {/* 레이블 표시 */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
                    <Typography sx={{ color: '#4caf50' }}>승리: {winRate}%</Typography>
                    <Typography sx={{ color: '#f44336' }}>패배: {lossRate}%</Typography>
                    <Typography sx={{ color: '#2196f3' }}>진행중: {ongoingRate}%</Typography>
                </Box>
            </CardContent>
        </Card>
    );
};

const VirtualTradeCard = ({ trade, selectedFields, onClick, isSelected }) => {
    let tradeResultImage = CloseImage;
    if (trade.tradeResult === '승리') {
        tradeResultImage = OpenImage;
    } else if (trade.tradeResult === '패배') {
        tradeResultImage = EmptyImage;
    }

    const formatNumber = (value) => {
        return new Intl.NumberFormat('ko-KR').format(value);
    };

    const buyTimeDate = new Date(trade.buyTime);
    const isBefore920 = buyTimeDate.getHours() < 9 || (buyTimeDate.getHours() === 9 && buyTimeDate.getMinutes() < 20);

    const getMarketTypeLabel = (marketType) => {
        switch (marketType) {
            case "KOSPI":
                return "코스피";
            case "KOSDAQ":
                return "코스닥";
            default:
                return marketType;
        }
    };

    return (
        <Card
            sx={{
                marginBottom: 2,
                backgroundColor:
                    trade.tradeResult === '승리'
                        ? '#3DFF92'
                        : trade.tradeResult === '패배'
                            ? '#FF5675'
                            : trade.tradeResult === ''
                                ? '#f8f9fa'
                                : 'default',
                borderRadius: '12px',
                boxShadow: isSelected ? 'rgba(3, 102, 214, 0.3) 0px 0px 0px 3px' : '0px 4px 6px rgba(0, 0, 0, 0.1)',
                margin: '10px 0',
                cursor: 'pointer',
                position: 'relative', // 추가
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, gap: 2}}>
                    <Typography variant="h6" sx={{ flex: 1 ,fontWeight: 'bold' }}>
                        <strong>{trade.stockName}</strong>
                    </Typography>
                    <Avatar
                        src={tradeResultImage}
                        alt="매매 결과"
                        sx={{
                            width: 70,
                            height: 80,
                            borderRadius: 0,
                        }}
                    />
                </Box>
                <Typography
                    sx={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: '#000', // 글자색을 검은색으로 설정
                        border: '2px solid #FFD700', // 노란색 테두리
                        borderRadius: '4px', // 모서리를 둥글게 처리
                        padding: '2px 8px', // 내부 여백
                        display: 'inline-block', // 글씨만큼만 크기를 설정
                        backgroundColor : '#FFD700',
                    }}
                >
                    {getMarketTypeLabel(trade.marketType)}
                </Typography>
                <Typography><strong>평단가:</strong> {formatNumber(trade.buyPrice)}</Typography>
                <Typography
                    sx={{
                        color: isBefore920 ? '#7b00ff' : 'inherit' // 9시 20분 이전인 경우 글씨 색 노란색으로 변경
                    }}
                >
                    <strong>매수일:</strong> {buyTimeDate.toLocaleString('ko-KR')}
                </Typography>
                <Typography><strong>매수횟수:</strong> {trade.numBuys}</Typography>
                {/*<Typography><strong>매매결과:</strong> {trade.tradeResult}</Typography>*/}
                <Typography><strong>손절가:</strong> {formatNumber(trade.stopLossPrice)}</Typography>
                <Typography><strong>조건식:</strong> {trade.conditionType}</Typography>
                <Typography><strong>1% 매도가:</strong> {trade.sellPrice1 ? formatNumber(trade.sellPrice1) : 'N/A'}</Typography>
                <Typography><strong>1% 경과시간:</strong> {trade.reachTime1}</Typography>
                {selectedFields['2% 매매내역'] && (
                    <Typography><strong>2% 매도가:</strong> {trade.sellPrice2 ? formatNumber(trade.sellPrice2) : 'N/A'}</Typography>
                )}
                {selectedFields['2% 매매내역'] && (
                    <Typography><strong>2% 경과시간:</strong> {trade.reachTime2}</Typography>
                )}
                {selectedFields['3% 매매내역'] && (
                    <Typography><strong>3% 매도가:</strong> {trade.sellPrice3 ? formatNumber(trade.sellPrice3) : 'N/A'}</Typography>
                )}
                {selectedFields['3% 매매내역'] && (
                    <Typography><strong>3% 경과시간:</strong> {trade.reachTime3}</Typography>
                )}

                {/* 우측 하단 marketType 표시 */}

            </CardContent>
        </Card>
    );
};

const VirtualTradeTable = ({ refreshKey, selectedFields, onConfigClick, onTradeSelect, selectedTradeIds, setTradeStats  }) => {
    const [virtualTrades, setVirtualTrades] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc'); // 정렬 순서: 'asc' 또는 'desc'
    const [resultFilter, setResultFilter] = useState('all'); // 결과 필터링 상태: 'all', '승리', '패배', 'none'

    // useEffect(() => {
    //     fetchTodayTrades();
    // }, [refreshKey]); // refreshKey가 변경될 때마다 fetchTodayTrades를 호출
    //
    //
    //
    // useEffect(() => {
    //     const todayTrades = virtualTrades.filter(isTodayTrade);
    //     calculateTradeStats(todayTrades); // 오늘 날짜 데이터만 사용하여 비율 계산
    // }, [virtualTrades]);

    // const fetchTodayTrades = () => {
    //     const today = DateTime.now().setZone('Asia/Seoul').toISODate();
    //     axios.get(`/api/trades?date=${today}`)
    //         .then(response => {
    //             setVirtualTrades(response.data);
    //             setIsSearching(false);
    //         })
    //         .catch(error => {
    //             console.error('There was an error fetching the virtual trades!', error);
    //         });
    // };
    useEffect(() => {
        fetchTrades();
    }, [refreshKey]); // refreshKey가 변경될 때마다 fetchTrades 호출

    useEffect(() => {
        const filteredTrades = virtualTrades.filter(isRecentTrade);
        calculateTradeStats(filteredTrades); // 최근 날짜 데이터만 사용하여 비율 계산
    }, [virtualTrades]);

    const fetchTrades = () => {
        const endDate = DateTime.now().setZone('Asia/Seoul').toISODate();
        let startDate;

        if (selectedFields['3일치 표시']) {
            startDate = DateTime.now().setZone('Asia/Seoul').minus({ days: 2 }).toISODate();
        } else {
            startDate = endDate;
        }

        axios
            .get(`/api/trades?startDate=${startDate}&endDate=${endDate}`)
            .then(response => {
                setVirtualTrades(response.data);
                setIsSearching(false);
            })
            .catch(error => {
                console.error('There was an error fetching the virtual trades!', error);
            });
    };

    const isRecentTrade = (trade) => {
        const tradeDate = new Date(trade.buyTime);
        const today = new Date();
        const threeDaysAgo = new Date();
        threeDaysAgo.setDate(today.getDate() - 2); // 오늘 포함 3일 전

        return tradeDate >= threeDaysAgo && tradeDate <= today;
    };






    const isTodayTrade = (trade) => {
        const tradeDate = new Date(trade.buyTime);
        const today = new Date();
        return (
            tradeDate.getFullYear() === today.getFullYear() &&
            tradeDate.getMonth() === today.getMonth() &&
            tradeDate.getDate() === today.getDate()
        );
    };


    const calculateTradeStats = (trades) => {
        const totalTrades = trades.length;
        const wins = trades.filter(trade => trade.tradeResult === '승리').length;
        const losses = trades.filter(trade => trade.tradeResult === '패배').length;
        const ongoing = totalTrades - wins - losses;

        const stats = {
            winRate: ((wins / totalTrades) * 100).toFixed(2) || 0,
            lossRate: ((losses / totalTrades) * 100).toFixed(2) || 0,
            ongoingRate: ((ongoing / totalTrades) * 100).toFixed(2) || 0,
        };

        setTradeStats(stats);
    };

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
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
                (resultFilter === 'none' && !trade.tradeResult);

            const today = new Date();
            const tradeDate = new Date(trade.buyTime);
            const isSameDay =
                today.getFullYear() === tradeDate.getFullYear() &&
                today.getMonth() === tradeDate.getMonth() &&
                today.getDate() === tradeDate.getDate();

            return matchesSearch && matchesResult && (
                searchQuery.trim() !== '' ||
                (selectedFields['3일치 표시'] ? isRecentTrade(trade) : isSameDay)
            );
        })
        .sort((a, b) =>
            sortOrder === 'asc'
                ? new Date(a.buyTime) - new Date(b.buyTime)  // 정순 정렬
                : new Date(b.buyTime) - new Date(a.buyTime)  // 역순 정렬
        );

    return (
        <div>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
                <RadioGroup row value={sortOrder} onChange={handleSortOrderChange}>
                    <FormControlLabel value="asc" control={<Radio />} label="시간 정순" />
                    <FormControlLabel value="desc" control={<Radio />} label="시간 역순" />
                </RadioGroup>
                <IconButton onClick={onConfigClick} sx={{ marginLeft: 1 }}>
                    <SettingsIcon />
                </IconButton>
            </Box>

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
                    <MenuItem value="none">진행중</MenuItem>
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

            {selectedTradeIds.map((tradeId) => (
                <VirtualTradeCard
                    key={tradeId}
                    trade={virtualTrades.find((trade) => trade.tradeId === tradeId)}
                    selectedFields={selectedFields}
                    onClick={() => onTradeSelect(selectedTradeIds.filter(id => id !== tradeId))}
                    isSelected={true}
                    sx={{
                        position: 'sticky',
                        top: 0, // 화면 상단에 고정
                        zIndex: 10,
                    }}
                />
            ))}

            {filteredTrades.length > 0 ? (
                filteredTrades
                    .filter(trade => !selectedTradeIds.includes(trade.tradeId))
                    .map((trade) => (
                        <VirtualTradeCard
                            key={trade.tradeId}
                            trade={trade}
                            selectedFields={selectedFields}
                            onClick={() => onTradeSelect([...selectedTradeIds, trade.tradeId])}
                            isSelected={false}
                        />
                    ))
            ) : (
                <Typography>해당 종목이 없습니다.</Typography>
            )}
        </div>
    );
};


const MonitoringAndTrades = () => {
    const [tradeStats, setTradeStats] = useState({
        winRate: 0,
        lossRate: 0,
        ongoingRate: 0,
    }); // 초기값 명시
    const isMobile = useMediaQuery('(max-width:600px)');
    const containerRef = useRef(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedFields, setSelectedFields] = useState(() => {
        const savedFields = localStorage.getItem('selectedFields');
        return savedFields ? JSON.parse(savedFields) : {
            '2% 매매내역': true,
            '3% 매매내역': true,
            '3일치 표시': false // 추가된 필드
        };
    });

    const [selectedTradeIds, setSelectedTradeIds] = useState([]);
    const [openConfig, setOpenConfig] = useState(false);

    const refreshTrades = () => {
        setRefreshKey((prevKey) => prevKey + 1);
    };

    // const handleOpenConfig = () => setOpenConfig(true);
    // const handleCloseConfig = () => setOpenConfig(false);
    const handleClearSelection = () => {
        setSelectedTradeIds([]);
    };

    const handleCheckboxChange = (event) => {
        const { name, checked } = event.target;
        setSelectedFields((prev) => {
            const updatedFields = {
                ...prev,
                [name]: checked,
            };
            localStorage.setItem('selectedFields', JSON.stringify(updatedFields));
            return updatedFields;
        });
    };

    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenConfig = (event) => {
        setAnchorEl(event.currentTarget);
        setOpenConfig(true);
    };

    const handleCloseConfig = () => {
        setAnchorEl(null);
        setOpenConfig(false);
    };

    const PopoverComponent = () => (
        <Popover
            open={openConfig}
            anchorEl={anchorEl}
            onClose={handleCloseConfig}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            PaperProps={{
                sx: {
                    p: 2,
                    width: 280,
                    borderRadius: 2
                }
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">표시할 항목 선택</Typography>
            </Box>
            <Box sx={{ mb: 2 }}>
                {Object.keys(selectedFields).map((field) => (
                    <FormControlLabel
                        key={field}
                        control={
                            <Checkbox
                                checked={selectedFields[field]}
                                onChange={handleCheckboxChange}
                                name={field}
                            />
                        }
                        label={field}
                        sx={{ display: 'block', mb: 1 }}
                    />
                ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
                <Button fullWidth variant="outlined" onClick={() => {handleClearSelection(); handleCloseConfig();}}>
                    초기화
                </Button>
                <Button fullWidth variant="contained" onClick={handleCloseConfig}>
                    확인
                </Button>
            </Box>
        </Popover>
    );

    return (
        <Box
            component="div"
            sx={{
                height: '100vh',
                overflow: 'hidden', // 변경
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Box
                ref={containerRef}
                sx={{
                    flex: 1,
                    padding: 2,
                    overflowY: 'auto',
                    position: 'relative',
                }}
            >
                <PopoverComponent />
                <Grid
                    container
                    spacing={2}
                    direction={isMobile ? 'column' : 'row'}
                    justifyContent="center"
                >
                    <Grid item xs={12} md={6}>
                        <TitleText tradeStats={tradeStats} />
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        md={6}
                        sx={{
                            height: '100%',
                            position: 'relative'
                        }}
                    >
                        <VirtualTradeTable
                            refreshKey={refreshKey}
                            selectedFields={selectedFields}
                            onConfigClick={handleOpenConfig}
                            onTradeSelect={setSelectedTradeIds}
                            selectedTradeIds={selectedTradeIds}
                            setTradeStats={setTradeStats} // 비율 업데이트
                        />
                    </Grid>
                </Grid>
            </Box>
            <ScrollToTop scrollRef={containerRef} />
            <RefreshableGrid onRefresh={refreshTrades} />
        </Box>
    );
};

export default MonitoringAndTrades;