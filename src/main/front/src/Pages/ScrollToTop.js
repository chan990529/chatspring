// ScrollToTop.js
import React, { useEffect, useState } from 'react';
import { Fab } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    // 스크롤이 일정 수준 이상 내려갔을 때만 버튼을 표시
    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > 100) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth', // 부드러운 스크롤
        });
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
                }}
            >
                <ArrowUpwardIcon />
            </Fab>
        )
    );
};

export default ScrollToTop;
