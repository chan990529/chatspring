package com.chatspring.chatspring.stock.scalping;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface VirtualTradeRepository extends JpaRepository<VirtualTrade, Long> {

    // 주식 코드로 검색 (대소문자 구분 없이)
    List<VirtualTrade> findByStockCodeContainingIgnoreCase(String stockCode);

    // 특정 기간 동안의 거래 내역 조회
    @Query("SELECT v FROM VirtualTrade v WHERE v.buyTime BETWEEN :startDate AND :endDate")
    List<VirtualTrade> findByBuyTimeBetween(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}

