package com.chatspring.chatspring.stock.scalping;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class VirtualTradeService {

    @Autowired
    private VirtualTradeRepository virtualTradeRepository;

    public List<VirtualTrade> findAll() {
        return virtualTradeRepository.findAll();
    }

    public VirtualTrade findById(Long id) {
        return virtualTradeRepository.findById(id).orElse(null);
    }

    public VirtualTrade save(VirtualTrade trade) {
        return virtualTradeRepository.save(trade);
    }

    public void delete(Long id) {
        virtualTradeRepository.deleteById(id);
    }

    public List<VirtualTrade> findByStockCode(String stockCode) {
        return virtualTradeRepository.findByStockCodeContainingIgnoreCase(stockCode);
    }

    public List<VirtualTrade> findByStockName(String stockName) {
        return virtualTradeRepository.findByStockNameContainingIgnoreCase(stockName);
    }

    public List<VirtualTrade> findByBuyTimeBetween(LocalDateTime startDate, LocalDateTime endDate) {
        return virtualTradeRepository.findByBuyTimeBetween(startDate, endDate);
    }
}

