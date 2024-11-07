import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, Button, TextField, Input} from '@mui/material';


const TradeStatistics = () => {
  const [statistics, setStatistics] = useState({
    date: 'N/A',
    total_trades: 0,
    count_sell_price_1: 0,
    count_sell_price_2: 0,
    count_sell_price_3: 0
  });
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatistics = async (date) => {
    setIsLoading(true);
    try {
      const url = date ? `/api/trades/statistics?date=${date}` : '/api/trades/statistics';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch statistics');
      }
      const data = await response.json();
      setStatistics(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch trade statistics:', error);
      setError('통계 데이터를 가져오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  const handleSearch = () => {
    if (selectedDate) {
      fetchStatistics(selectedDate);
    }
  };

  const calculatePercentage = (count) => {
    return statistics.total_trades > 0 ? ((count / statistics.total_trades) * 100).toFixed(2) + '%' : '0%';
  };

  return (
    <Card className="mb-4">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">거래 통계 검색</h2>
        
        <div className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="date"
              value={selectedDate || ''}
              onChange={handleDateChange}
              className="w-full"
            />
            <Button 
              onClick={handleSearch}
              disabled={!selectedDate || isLoading}
            >
              {isLoading ? '검색 중...' : '검색'}
            </Button>
          </div>

          {error ? (
            <div className="text-red-500 font-bold">{error}</div>
          ) : (
            <div className="space-y-2">
              <p><span className="font-bold">날짜:</span> {statistics.date}</p>
              <p><span className="font-bold">총 거래 수:</span> {statistics.total_trades}</p>
              <p>
                <span className="font-bold">1% 수익 달성 거래 수:</span> {statistics.count_sell_price_1} 
                ({calculatePercentage(statistics.count_sell_price_1)})
              </p>
              <p>
                <span className="font-bold">2% 수익 달성 거래 수:</span> {statistics.count_sell_price_2} 
                ({calculatePercentage(statistics.count_sell_price_2)})
              </p>
              <p>
                <span className="font-bold">3% 수익 달성 거래 수:</span> {statistics.count_sell_price_3} 
                ({calculatePercentage(statistics.count_sell_price_3)})
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TradeStatistics;