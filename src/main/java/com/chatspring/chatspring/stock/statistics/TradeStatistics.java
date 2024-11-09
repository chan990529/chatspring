package com.chatspring.chatspring.stock.statistics;

import jakarta.persistence.*;
import org.springframework.data.relational.core.sql.In;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "trade_statistics")
public class TradeStatistics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "total_trades", nullable = false)
    private Integer totalTrades;

    @Column(name = "total_wins", nullable = false)
    private Integer totalWins;

    @Column(name = "count_sell_price_1")
    private Integer countSellPrice1;

    @Column(name = "count_sell_price_2")
    private Integer countSellPrice2;

    @Column(name = "count_sell_price_3")
    private Integer countSellPrice3;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Integer getTotalTrades() {
        return totalTrades;
    }

    public void setTotalTrades(Integer totalTrades) {
        this.totalTrades = totalTrades;
    }

    public Integer getTotalWins() {
        return totalWins;
    }

    public void setTotalWins(Integer totalWins) {
        this.totalWins = totalWins;
    }

    public Integer getCountSellPrice1() {
        return countSellPrice1;
    }

    public void setCountSellPrice1(Integer countSellPrice1) {
        this.countSellPrice1 = countSellPrice1;
    }

    public Integer getCountSellPrice2() {
        return countSellPrice2;
    }

    public void setCountSellPrice2(Integer countSellPrice2) {
        this.countSellPrice2 = countSellPrice2;
    }

    public Integer getCountSellPrice3() {
        return countSellPrice3;
    }

    public void setCountSellPrice3(Integer countSellPrice3) {
        this.countSellPrice3 = countSellPrice3;
    }
}
