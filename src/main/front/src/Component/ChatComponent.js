import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import './ChatComponent.css';

function ChatComponent() {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const chatContainerRef = useRef(null); // 스크롤을 위한 ref
 
  // 메시지 전송 함수
  const handleSubmit = async (e) => {
    e.preventDefault();  // 페이지 새로고침 방지

    if (!message.trim()) {
        return; // 빈 메시지 전송 방지
    }

    // 사용자 메시지를 먼저 추가
    const userMessage = { role: 'user', content: message };
    setChatHistory((prev) => [...prev, userMessage]);

    try {
        // API에 POST 요청 보내기
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message }),
        });

        const data = await res.json();  // 응답을 JSON으로 변환

        // AI 응답을 대화 기록에 추가
        const aiMessage = { role: 'ai', content: data.completion };
        setChatHistory((prev) => [...prev, aiMessage]);

        // 입력 필드 초기화
        setMessage('');
    } catch (error) {
        console.error('Error sending the message', error);
    }
};

  // 메시지 초기화 함수
  const handleClear = async () => {
    try {
      const res = await axios.post('/api/clear');
      console.log("초기화 응답:", res.data);

      // 대화 기록 초기화
      setChatHistory([]);
    } catch (error) {
      console.error('Error clearing the messages:', error.response ? error.response.data : error.message);
    }
  };

  // 새로운 메시지가 추가될 때 스크롤을 자동으로 아래로 이동
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <div className="chat-container">
      <h1>Chat GPT 대화실</h1>

      <div className="chat-history" ref={chatContainerRef}>
        {chatHistory.map((msg, index) => (
          <div
            key={index}
            className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}
          >
            {/* 마크다운 및 코드블록 렌더링 */}
            <ReactMarkdown
              children={msg.content}
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || '');
                  return !inline && match ? (
                    <SyntaxHighlighter
                      children={String(children).replace(/\n$/, '')}
                      style={tomorrow}
                      language={match[1]}
                      PreTag="div"
                      {...props}
                    />
                  ) : (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }
              }}
            />
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="message-input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="message-input"
          placeholder="메시지를 입력하시오"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
      <button type="button" className="clear-button" onClick={handleClear}>초기화</button> {/* 초기화 버튼 */}
    </div>
  );
}

export default ChatComponent;
