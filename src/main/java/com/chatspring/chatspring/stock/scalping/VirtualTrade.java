package com.chatspring.chatspring.stock.scalping;

import jakarta.persistence.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "virtual_trades")
public class VirtualTrade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "trade_id")
    private Long tradeId;

    @Column(name = "stock_name", nullable = false)
    private String stockName;


    @Column(name = "stock_code", nullable = false)
    private String stockCode;

    @Column(name = "buy_price", nullable = false)
    private Integer buyPrice;

    @Column(name = "buy_time", nullable = false)
    private LocalDateTime buyTime;

    @Column(name = "num_buys", nullable = false)
    private Integer numBuys;

    @Column(name = "sell_price_1")
    private Integer sellPrice_1;

    @Column(name = "reach_time_1")
    private String reachTime_1;

    @Column(name = "sell_price_2")
    private Integer sellPrice_2;

    @Column(name = "reach_time_2")
    private String reachTime_2;

    @Column(name = "sell_price_3")
    private Integer sellPrice_3;

    @Column(name = "reach_time_3")
    private String reachTime_3;

    @Column(name = "stop_loss_price")
    private Integer stopLossPrice;

    @Column(name = "trade_result")
    private String tradeResult;

    @Column(name = "condition_type")
    private String conditionType;

//    @Column(name = "code")
//    private String Code;
//
//    public String getCode() {
//        return Code;
//    }
//
//    public void setCode(String Code) {
//        this.Code = Code;
//    }


//    @Column(name = "profit_reason")
//    private String profitReason;

    // Getters and Setters
    public Long getTradeId() {
        return tradeId;
    }

    public void setTradeId(Long tradeId) {
        this.tradeId = tradeId;
    }

    public String getStockName() {
        return stockName;
    }

    public void setStockName(String stockName) {
        this.stockName = stockName;
    }

    public String getStockCode() {
        return stockCode;
    }

    public void setStockCode(String stockCode) {
        this.stockCode = stockCode;
    }

    public Integer getBuyPrice() {
        return buyPrice;
    }

    public void setBuyPrice(Integer buyPrice) {
        this.buyPrice = buyPrice;
    }

    public LocalDateTime getBuyTime() {
        return buyTime;
    }

    public void setBuyTime(LocalDateTime buyTime) {
        this.buyTime = buyTime;
    }

    public Integer getNumBuys() {
        return numBuys;
    }

    public void setNumBuys(Integer numBuys) {
        this.numBuys = numBuys;
    }

    public Integer getSellPrice1() {
        return sellPrice_1;
    }

    public Integer getSellPrice2() {
        return sellPrice_2;
    }

    public Integer getSellPrice3() {
        return sellPrice_3;
    }

    public void setSellPrice1(Integer sellPrice_1) {
        this.sellPrice_1 = sellPrice_1;
    }

    public void setSellPrice2(Integer sellPrice_2) {
        this.sellPrice_2 = sellPrice_2;
    }

    public void setSellPrice3(Integer sellPrice_3) {
        this.sellPrice_3 = sellPrice_3;
    }

    public String getReachTime1() {
        return reachTime_1;
    }

    public void setReachTime1(String reachTime_1) {
        this.reachTime_1 = reachTime_1;
    }

    public String getReachTime2() {
        return reachTime_2;
    }

    public void setReachTime2(String reachTime_2) {
        this.reachTime_2 = reachTime_2;
    }

    public String getReachTime3() {
        return reachTime_3;
    }

    public void setReachTime3(String reachTime_3) {
        this.reachTime_3 = reachTime_3;
    }

    public Integer getstopLossPrice() {
        return stopLossPrice;
    }

    public void setstopLossPrice(Integer stopLossPrice) {
        this.stopLossPrice = stopLossPrice;
    }

    public String gettradeResult() {
        return tradeResult;
    }

    public void settradeResult(String tradeResult) {
        this.tradeResult = tradeResult;
    }

    public String getconditionType() {
        return conditionType;
    }

    public void setconditionType(String conditionType) {
        this.conditionType = conditionType;
    }

}

