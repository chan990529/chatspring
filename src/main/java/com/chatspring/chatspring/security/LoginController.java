package com.chatspring.chatspring.security;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class LoginController {

    private static String VALID_LOGIN_CODE = "chiman"; // 초기 유효 코드
    private static final String AUTH_KEY = "IAMCHIMAN"; // 코드 변경을 위한 인증키

    // 로그인 검증
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody Map<String, String> request) {
        String code = request.get("code");

        if (VALID_LOGIN_CODE.equals(code)) {
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
}
