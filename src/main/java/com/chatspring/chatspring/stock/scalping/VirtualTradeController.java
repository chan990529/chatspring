package com.chatspring.chatspring.stock.scalping;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/trades")
@CrossOrigin(origins = "http://13.209.60.49:3000") // React 앱의 포트를 지정
public class VirtualTradeController {

    @Autowired
    private VirtualTradeService virtualTradeService;

    @GetMapping
    public List<VirtualTrade> getAllTrades() {
        return virtualTradeService.findAll();
    }

    @GetMapping("/{id}")
    public VirtualTrade getTradeById(@PathVariable Long id) {
        return virtualTradeService.findById(id);
    }

    @PostMapping
    public VirtualTrade createTrade(@RequestBody VirtualTrade trade) {
        return virtualTradeService.save(trade);
    }

    @DeleteMapping("/{id}")
    public void deleteTrade(@PathVariable Long id) {
        virtualTradeService.delete(id);
    }

    @GetMapping("/search")
    public List<VirtualTrade> findByStockCode(@RequestParam String stockCode) {
        return virtualTradeService.findByStockCode(stockCode);
    }

    @GetMapping("/filterByDate")
    public List<VirtualTrade> findByBuyTimeBetween(@RequestParam String startDate,
                                                   @RequestParam String endDate) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");
        LocalDateTime start = LocalDateTime.parse(startDate, formatter);
        LocalDateTime end = LocalDateTime.parse(endDate, formatter);
        return virtualTradeService.findByBuyTimeBetween(start, end);
    }
}

