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
                cursor: 'pointer'
            }}
            onClick={onClick}
        >
            <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: 2, gap: 2 }}>
                    <Typography variant="h6" sx={{ flex: 1 }}>
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

                <Typography><strong>평단가:</strong> {formatNumber(trade.buyPrice)}</Typography>
                <Typography>
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

const VirtualTradeTable = ({ refreshKey, selectedFields, onConfigClick, onTradeSelect, selectedTradeIds }) => {
    const [virtualTrades, setVirtualTrades] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [sortOrder, setSortOrder] = useState('desc'); // 정렬 순서: 'asc' 또는 'desc'
    const [resultFilter, setResultFilter] = useState('all'); // 결과 필터링 상태: 'all', '승리', '패배', 'none'

    useEffect(() => {
        fetchTodayTrades();
    }, [refreshKey]); // refreshKey가 변경될 때마다 fetchTodayTrades를 호출

    const fetchTodayTrades = () => {
        const today = DateTime.now().setZone('Asia/Seoul').toISODate();
        axios.get(`/api/trades?date=${today}`)
            .then(response => {
                setVirtualTrades(response.data);
                setIsSearching(false);
            })
            .catch(error => {
                console.error('There was an error fetching the virtual trades!', error);
            });
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

            return matchesSearch && matchesResult && (searchQuery.trim() !== '' || isSameDay);
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