// ScrollToTop.js
import React, { useEffect, useState } from 'react';
import { Fab } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ScrollToTop = ({ scrollRef }) => {
    const [isVisible, setIsVisible] = useState(false);

    // 스크롤 위치 확인
    useEffect(() => {
        const toggleVisibility = () => {
            if (scrollRef.current && scrollRef.current.scrollTop > 300) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        const refCurrent = scrollRef.current;
        refCurrent.addEventListener('scroll', toggleVisibility);

        return () => refCurrent.removeEventListener('scroll', toggleVisibility);
    }, [scrollRef]);

    const scrollToTop = () => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: 0,
                behavior: 'smooth',
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
                }}
            >
                <ArrowUpwardIcon />
            </Fab>
        )
    );
};

export default ScrollToTop;
