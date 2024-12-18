package com.chatspring.chatspring.notification;

import org.springframework.web.bind.annotation.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.List;



@RestController
@RequestMapping("/api/notifications")
public class PushController {

    private final PushNotificationService pushNotificationService;
    private final PushSubscriptionRepository pushSubscriptionRepository;

    public PushController(PushNotificationService pushNotificationService, PushSubscriptionRepository repository) {
        this.pushNotificationService = pushNotificationService;
        this.pushSubscriptionRepository = repository;
    }


    // 메모리에 구독 정보 저장 (실제로는 DB 사용)
    private final ConcurrentHashMap<String, PushSubscription> subscriptions = new ConcurrentHashMap<>();

    @PostMapping("/save-subscription")
    public String saveSubscription(@RequestBody PushSubscription subscription) {
        pushSubscriptionRepository.save(subscription);
        System.out.println("구독 정보 저장 완료: " + subscription);
        return "구독 정보 저장 성공";
    }

    @PostMapping("/send")
    public String sendPushNotification(@RequestBody NotificationMessage message) {
        try {

            // 데이터베이스에서 구독 정보 가져오기
            List<PushSubscription> subscriptions = pushSubscriptionRepository.findAll();

            // 저장된 모든 구독 정보를 순회하며 푸시 알림 전송
            for (PushSubscription subscription : subscriptions) {
                String payload = createPayload(message);
                pushNotificationService.sendPushNotification(
                        subscription.getEndpoint(),
                        subscription.getKeys().getP256dh(),
                        subscription.getKeys().getAuth(),
                        payload
                );
            }
            return "푸시 알림 전송 성공";
        } catch (Exception e) {
            e.printStackTrace();
            return "푸시 알림 전송 실패";
        }
    }

    // 페이로드 생성 메서드
    private String createPayload(NotificationMessage message) {
        return "{ " +
                "\"title\": \"" + (message.getType().equals("매도") ? "매도 완료" : "손절 발생") + "\", " +
                "\"body\": \"" + message.getMessage() + "\", " +
                "\"icon\": \"" + (message.getType().equals("매도") ? "/open-icon.png" : "/empty-icon.png") + "\", " +
                "\"stockName\": \"" + message.getStockName() + "\", " +  // 종목명 추가
                "\"data\": { \"url\": \"/trade-details\" } " +
                "}";
    }


}