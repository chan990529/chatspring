import React, { useEffect, useState } from 'react';
import { Calendar } from 'lucide-react';
import { Card } from '@mui/material';
import axios from "axios";

axios.defaults.baseURL = 'https://13.209.60.49:443';

const TradeStatistics = () => {
  const [statistics, setStatistics] = useState({
    date: 'N/A',
    count_sell_price_1: 0,
    count_sell_price_2: 0,
    count_sell_price_3: 0,
    total_trades: 0,
    total_wins: 0,
    avg_reach_time: 'N/A'
  });
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [year, setYear] = useState('');
  const [month, setMonth] = useState('');
  const [day, setDay] = useState('');

  const fetchStatistics = async (date) => {
    setIsLoading(true);
    try {
      const url = date ? `/api/trades/statistics?date=${date}` : '/api/trades/statistics';
      const response = await axios.get(url);
      setStatistics(response.data);
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
    setShowDatePicker(false);
  };

  const handleManualDateInput = () => {
    if (year && month && day) {
      const formattedMonth = month.padStart(2, '0');
      const formattedDay = day.padStart(2, '0');
      const formattedDate = `${year}-${formattedMonth}-${formattedDay}`;
      setSelectedDate(formattedDate);
    }
  };

  useEffect(() => {
    handleManualDateInput();
  }, [year, month, day]);

  const handleSearch = () => {
    if (selectedDate) {
      fetchStatistics(selectedDate);
    }
  };

  const calculatePercentage = (count) => {
    return statistics.total_trades > 0 ? ((count / statistics.total_trades) * 100).toFixed(2) + '%' : '0%';
  };

  return (
      <Card className="p-4">
        <div className="space-y-4">
          <h2 className="text-xl font-bold">거래 통계 검색</h2>

          <div className="space-y-4">
            <div className="relative">
              <input
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
              />
              <button
                  onClick={() => setShowDatePicker(true)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                <Calendar className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="flex gap-2">
              <input
                  type="number"
                  placeholder="년도"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="2000"
                  max="2099"
              />
              <input
                  type="number"
                  placeholder="월"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="12"
              />
              <input
                  type="number"
                  placeholder="일"
                  value={day}
                  onChange={(e) => setDay(e.target.value)}
                  className="w-1/3 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="1"
                  max="31"
              />
            </div>

            <button
                onClick={handleSearch}
                disabled={!selectedDate || isLoading}
                className={`w-full px-4 py-2 rounded-lg text-white ${!selectedDate || isLoading
                    ? 'bg-gray-400'
                    : 'bg-blue-500 hover:bg-blue-600'}`}
            >
              {isLoading ? '검색 중...' : '검색'}
            </button>
          </div>

          {error ? (
              <div className="text-red-500 font-bold">{error}</div>
          ) : (
              <div className="space-y-2 mt-4">
                <p><span className="font-bold">날짜:</span> {statistics.date}</p>
                <p><span className="font-bold">포착종목수:</span> {statistics.total_trades}</p>
                <p>
                  <span className="font-bold">승리 :</span> {statistics.total_wins}
                  <span className="font-bold"> 패배 :</span> {statistics.total_trades - statistics.total_wins}
                </p>
                <p>
                  <span className="font-bold">승률 :</span> {calculatePercentage(statistics.total_wins)}
                </p>
                <p>
                  <span className="font-bold">평균 도달시간 :</span> {statistics.avg_reach_time}
                </p>
              </div>
          )}
        </div>
      </Card>
  );
};

export default TradeStatistics;
