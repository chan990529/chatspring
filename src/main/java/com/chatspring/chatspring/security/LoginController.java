package com.chatspring.chatspring.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private static String VALID_LOGIN_CODE = "chiman"; // 초기 유효 코드
    private static final String AUTH_KEY = "IAMCHIMAN"; // 코드 변경을 위한 인증키
    private static final String MASTER_KEY = "IAMCHIMAN9999";

    String CURRENT_VERSION = "abc"; // 서버 버전

//    private final UserCountService userCountService; // 서비스 추가
//
//    public LoginController(UserCountService userCountService) {
//        this.userCountService = userCountService;
//    }

    // 로그인 검증
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> request) {
        String code = request.get("code");
        String version = request.get("version");
        if ((VALID_LOGIN_CODE.equals(code) || MASTER_KEY.equals(code)) & CURRENT_VERSION.equals(version)) {
//            userCountService.incrementUserCount();
            return ResponseEntity.ok("로그인 성공");
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("로그인 실패");
        }
    }

    // 로그인 코드 변경
    @PostMapping("/change-code")
    public ResponseEntity<String> changeCode(@RequestBody Map<String, String> request) {
        String newPassword = request.get("newPassword"); // 변경할 비밀번호
        String authKey = request.get("authKey"); // 인증키 검증

        if (AUTH_KEY.equals(authKey)) {
            // 인증키가 일치하면 코드 변경
            VALID_LOGIN_CODE = newPassword;
            return ResponseEntity.ok("로그인 코드가 성공적으로 변경되었습니다.");
        } else {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("인증키가 일치하지 않습니다.");
        }
    }

//    @GetMapping("/user-count")
//    public ResponseEntity<?> getUserCount(@RequestParam String date) {
//        LocalDate queryDate = LocalDate.parse(date);
//        int count = userCountService.getUserCount(queryDate);
//        return ResponseEntity.ok(Map.of("date", queryDate, "count", count));
//    }
}
