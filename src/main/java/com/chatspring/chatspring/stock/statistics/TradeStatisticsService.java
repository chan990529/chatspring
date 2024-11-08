package com.chatspring.chatspring.stock.statistics;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TradeStatisticsService {

    @Autowired
    private TradeStatisticsRepository tradeStatisticsRepository;

    public void saveStatistics(Map<String, Object> statistics) {
        TradeStatistics tradeStatistics = new TradeStatistics();
        tradeStatistics.setDate(LocalDate.parse(statistics.get("date").toString()));
        tradeStatistics.setTotalTrades((Integer) statistics.get("total_trades"));
        tradeStatistics.setCountSellPrice1((Integer) statistics.get("count_sell_price_1"));
        tradeStatistics.setCountSellPrice2((Integer) statistics.get("count_sell_price_2"));
        tradeStatistics.setCountSellPrice3((Integer) statistics.get("count_sell_price_3"));
        tradeStatisticsRepository.save(tradeStatistics);
    }


    public Map<String, Object> getStatisticsForDate(LocalDate date) {
        // 특정 날짜의 통계를 조회하는 로직 구현
        TradeStatistics stats = tradeStatisticsRepository.findByDate(date);

        if (stats != null) {
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("date", stats.getDate());
            statistics.put("total_trades", stats.getTotalTrades());
            statistics.put("count_sell_price_1", stats.getCountSellPrice1());
            statistics.put("count_sell_price_2", stats.getCountSellPrice2());
            statistics.put("count_sell_price_3", stats.getCountSellPrice3());
            return statistics;
        } else {
            throw new RuntimeException("No statistics available for this day.");
        }
    }

    public Map<String, Object> getStatisticsForToday() {
        LocalDate today = LocalDate.now();
        TradeStatistics stats = tradeStatisticsRepository.findByDate(today);

        if (stats != null) {
            Map<String, Object> statistics = new HashMap<>();
            statistics.put("date", stats.getDate());
            statistics.put("total_trades", stats.getTotalTrades());
            statistics.put("count_sell_price_1", stats.getCountSellPrice1());
            statistics.put("count_sell_price_2", stats.getCountSellPrice2());
            statistics.put("count_sell_price_3", stats.getCountSellPrice3());
            return statistics;
        } else {
            throw new RuntimeException("No statistics available for today.");
        }
    }
}
