package com.chatspring.chatspring.stock.statistics;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/trades/statistics")
public class TradeStatisticsController {

    private final TradeStatisticsService tradeStatisticsService;

    @Autowired
    public TradeStatisticsController(TradeStatisticsService tradeStatisticsService) {
        this.tradeStatisticsService = tradeStatisticsService;
    }

    @PostMapping
    public ResponseEntity<String> receiveStatistics(@RequestBody Map<String, Object> statistics) {
        try {
            tradeStatisticsService.saveStatistics(statistics);
            return new ResponseEntity<>("Statistics received and saved successfully.", HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>("Failed to save statistics.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getStatistics() {
        try {
            Map<String, Object> statistics = tradeStatisticsService.getStatisticsForToday();
            return new ResponseEntity<>(statistics, HttpStatus.OK);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}
