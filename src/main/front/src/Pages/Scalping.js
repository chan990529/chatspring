import React, { useEffect, useState, useRef, useCallback } from 'react';
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
import { Popover , Tooltip } from '@mui/material';

axios.defaults.baseURL = 'https://scalping.app';

// axios.defaults.baseURL = 'http://localhost:8080';
const TitleText = ({ tradeStats }) => {
    const { winRate = 0, lossRate = 0, ongoingRate = 0 } = tradeStats || {};

    return (
        <Card sx={{ marginBottom: 2 }}>
            <CardContent>
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
    const [anchorEl, setAnchorEl] = useState(null);

    const handlePopoverOpen = (event) => {
        event.stopPropagation(); // 이벤트 전파 차단
        setAnchorEl(event.currentTarget);
    };

    const handlePopoverClose = (event) => {
        event.stopPropagation(); // 이벤트 전파 차단
        setAnchorEl(null);
    };

    const isPopoverOpen = Boolean(anchorEl);


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
                    trade.finalProfit < 2.5 && trade.sellPrice1 === null
                        ? '#000000' // Background color when finalProfit is under 2.5
                        : trade.tradeResult === '승리'
                            ? '#3DFF92'
                            : trade.tradeResult === '패배'
                                ? '#FF5675'
                                : trade.tradeResult === ''
                                    ? '#f8f9fa'
                                    : 'default',
                color : trade.finalProfit < 2.5 ? '#FFFFFF' : 'inherit',
                borderRadius: '12px',
                boxShadow: isSelected ? 'rgba(3, 102, 214, 0.3) 0px 0px 0px 3px' : '0px 4px 6px rgba(0, 0, 0, 0.1)',
                margin: '10px 0',
                cursor: 'pointer',
                position: 'relative',
            }}
            onClick={onClick}
        >
            <CardContent>
                {/* 우측 상단 테마 표시 */}
                <Box
                    sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                    }}
                >
                    <>
                        <Button
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: '0.8rem' }}
                            onClick={handlePopoverOpen} // 팝오버 열기
                        >
                            {trade.theme && trade.theme.length > 10 ? `${trade.theme.slice(0, 10)}...` : (trade.theme || '테마없음')}
                    </Button>
                        <Popover
                            open={isPopoverOpen}
                            anchorEl={anchorEl}
                            onClose={handlePopoverClose} // 팝오버 닫기
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
                                    padding: 2,
                                    maxWidth: 200,
                                },
                            }}
                            onClick={(event) => event.stopPropagation()} // 팝오버 클릭 이벤트 전파 차단
                        >
                            <Typography>{trade.theme}</Typography>
                        </Popover>
                    </>
                </Box>

                {/* 카드 콘텐츠 */}
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, gap: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1, fontWeight: 'bold' }}>
                        <strong>{trade.stockName}</strong>
                    </Typography>
                    <Avatar
                        src={tradeResultImage}
                        alt="매매 결과"
                        sx={{
                            width: 70,
                            height: 80,
                            borderRadius: 0,
                            marginTop: 4, // 이미지를 아래로 내림
                        }}
                    />
                </Box>
                <Typography
                    sx={{
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        color: '#000',
                        border: '2px solid #FFD700',
                        borderRadius: '4px',
                        padding: '2px 8px',
                        display: 'inline-block',
                        backgroundColor: '#FFD700',
                    }}
                >
                    {getMarketTypeLabel(trade.marketType)}
                </Typography>
                <Typography><strong>평단가:</strong> {formatNumber(trade.buyPrice)}</Typography>
                <Typography
                    sx={{
                        color: isBefore920 ? '#7b00ff' : 'inherit',
                    }}
                >
                    <strong>매수일:</strong> {buyTimeDate.toLocaleString('ko-KR')}
                </Typography>
                <Typography><strong>매수횟수:</strong> {trade.numBuys}</Typography>
                <Typography><strong>매매결과:</strong> {trade.tradeResult}</Typography>
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
            </CardContent>
        </Card>
    );
};

const VirtualTradeTable = ({ refreshKey, selectedFields, onConfigClick, onTradeSelect, selectedTradeIds, setTradeStats, selectedTradesCache,  setSelectedTradesCache, onVirtualTradesUpdate }) => {
    const [virtualTrades, setVirtualTrades] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc'); // 정렬 순서: 'asc' 또는 'desc'
    const [resultFilter, setResultFilter] = useState('all'); // 결과 필터링 상태: 'all', '승리', '패배', 'none'
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthorized, setIsAuthorized] = useState(false);


    useEffect(() => {
        onVirtualTradesUpdate(virtualTrades); // virtualTrades가 업데이트될 때마다 부모 컴포넌트에 알림
    }, [virtualTrades, onVirtualTradesUpdate]);

    useEffect(() => {
        fetchTodayTrades();
    }, [refreshKey]); // refreshKey가 변경될 때마다 fetchTodayTrades를 호출np

    useEffect(() => {
        const todayTrades = virtualTrades.filter(isTodayTrade);
        calculateTradeStats(todayTrades); // 오늘 날짜 데이터만 사용하여 비율 계산
    }, [virtualTrades]);

    useEffect(() => {
        const newCache = {};
        selectedTradeIds.forEach(id => {
            const trade = virtualTrades.find(t => t.tradeId === id);
            if (trade) {
                newCache[id] = trade;
            } else if (selectedTradesCache[id]) {
                newCache[id] = selectedTradesCache[id];
            }
        });
        setSelectedTradesCache(newCache);
    }, [selectedTradeIds, virtualTrades]);

    const fetchTodayTrades = useCallback(async () => {
        setIsLoading(true);
        try {
            const today = DateTime.now().setZone('Asia/Seoul').toISODate();
            const response = await axios.get(`/api/trades?date=${today}`);
            setVirtualTrades(response.data);

            // 데이터를 받아온 직후 즉시 통계 계산
            const todayTrades = response.data.filter(isTodayTrade);
            calculateTradeStats(todayTrades);
        } catch (error) {
            console.error('Failed to fetch trades:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // refreshKey 변경 시 즉시 데이터 갱신
    useEffect(() => {
        fetchTodayTrades();
    }, [fetchTodayTrades, refreshKey]);

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

    const handleSearchChange = async (e) => {
        const newQuery = e.target.value;
        setSearchQuery(newQuery);
        setIsLoading(true);

        // 권한 부여 로직
        if (newQuery === '나는천재치맨') {
            const expiryDate = new Date();
            expiryDate.setMonth(expiryDate.getMonth() + 1);
            localStorage.setItem('user_auth', JSON.stringify({ expiry: expiryDate }));
            setIsAuthorized(true);
            alert('권한이 부여되었습니다.');
            setSearchQuery('');
            setIsLoading(false);
            return;
        }

        try {
            if (newQuery === '') {
                await fetchTodayTrades();
            } else {
                const response = await axios.get(`/api/trades/search?stockName=${newQuery}`);
                const searchResults = response.data;
                setVirtualTrades(searchResults);
                const todayTrades = searchResults.filter(isTodayTrade);
                calculateTradeStats(todayTrades);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsLoading(false);
        }
    };


    const handleSortOrderChange = (e) => {
        setSortOrder(e.target.value);
    };

    const handleResultFilterChange = (e) => {
        setResultFilter(e.target.value);
    };

    const getFilteredTrades = () => {
        // 전체 거래 목록에서 필터링
        return virtualTrades
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

                return matchesSearch && matchesResult && (searchQuery.trim() !== '' || isSameDay);
            })
            .sort((a, b) =>
                sortOrder === 'asc'
                    ? new Date(a.buyTime) - new Date(b.buyTime)
                    : new Date(b.buyTime) - new Date(a.buyTime)
            );
    };

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

            {selectedTradeIds.map((tradeId) => {
                const selectedTrade = selectedTradesCache[tradeId];
                if (!selectedTrade) return null;

                return (
                    <VirtualTradeCard
                        key={tradeId}
                        trade={selectedTrade}
                        selectedFields={selectedFields}
                        onClick={() => onTradeSelect(selectedTradeIds.filter(id => id !== tradeId))}
                        isSelected={true}
                    />
                );
            })}

            {/* 필터링된 거래 목록 (선택된 것들 제외) */}
            {!isLoading && getFilteredTrades().length > 0 ? (
                getFilteredTrades()
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
                <Typography>
                    {isLoading ? "검색 중..." : "해당 종목이 없습니다."}
                </Typography>
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
            '3% 매매내역': true
        };
    });
    const [virtualTrades, setVirtualTrades] = useState([]); // 추가
    const [selectedTradesCache, setSelectedTradesCache] = useState({}); // 추가

    const [selectedTradeIds, setSelectedTradeIds] = useState(() => {
        const savedSelectedTrades = localStorage.getItem('selectedTradeIds');
        return savedSelectedTrades ? JSON.parse(savedSelectedTrades) : [];
    });


    const [openConfig, setOpenConfig] = useState(false);

    const refreshTrades = () => {
        setRefreshKey((prevKey) => prevKey + 1);
    };


    const handleClearSelection = () => {
        setSelectedTradeIds([]);
        localStorage.removeItem('selectedTradeIds');
        localStorage.removeItem('selectedTrades');  // selectedTrades도 함께 제거
    };

    const handleTradeSelect = (newSelectedIds) => {
        setSelectedTradeIds(newSelectedIds);

        // virtualTrades에서 선택된 거래 정보 가져오기
        const selectedTrades = newSelectedIds.map(id => {
            const trade = virtualTrades.find(t => t.tradeId === id);
            if (!trade) return null; // 예외 처리 추가
            return {
                tradeId: id,
                stockName: trade.stockName
            };
        }).filter(trade => trade !== null); // null인 항목 제거

        // 두 정보 모두 저장
        localStorage.setItem('selectedTradeIds', JSON.stringify(newSelectedIds));
        localStorage.setItem('selectedTrades', JSON.stringify(selectedTrades));
    };

    const handleVirtualTradesUpdate = (trades) => {
        setVirtualTrades(trades);
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
                            onTradeSelect={handleTradeSelect} // 수정
                            selectedTradeIds={selectedTradeIds}
                            setTradeStats={setTradeStats} // 비율 업데이트
                            selectedTradesCache={selectedTradesCache}        // 추가
                            setSelectedTradesCache={setSelectedTradesCache}  // 추가
                            onVirtualTradesUpdate={handleVirtualTradesUpdate}
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
