import React, { useEffect, useState } from 'react';
import { Fab } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ScrollToTop = ({ scrollRef }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (scrollRef.current) {
                const scrollTop = scrollRef.current.scrollTop;
                const scrollHeight = scrollRef.current.scrollHeight;
                const clientHeight = scrollRef.current.clientHeight;

                // 스크롤이 가능하고 일정 높이 이상 스크롤 되었을 때만 버튼 표시
                setIsVisible(
                    scrollHeight > clientHeight && // 스크롤이 가능한 상태인지 확인
                    scrollTop > 300
                );
            }
        };

        const currentRef = scrollRef.current;
        if (currentRef) {
            // 초기 상태 체크
            toggleVisibility();

            // 스크롤 이벤트 리스너 등록
            currentRef.addEventListener('scroll', toggleVisibility);
            // resize 이벤트에도 대응
            window.addEventListener('resize', toggleVisibility);

            return () => {
                currentRef.removeEventListener('scroll', toggleVisibility);
                window.removeEventListener('resize', toggleVisibility);
            };
        }
    }, [scrollRef]);

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    };

    return (
        isVisible && (
            <Fab
                color="primary"
                onClick={scrollToTop}
                sx={{
                    position: 'fixed',
                    bottom: 16,
                    right: 16,
                    zIndex: 1000,
                    // 모바일에서 더 작게 표시
                    width: { xs: 40, sm: 56 },
                    height: { xs: 40, sm: 56 },
                }}
            >
                <ArrowUpwardIcon />
            </Fab>
        )
    );
};

export default ScrollToTop;