import React from 'react';
import { Fab } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

const ScrollToTop = () => {
    const scrollToTop = () => {
        document.documentElement.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <Fab
            color="primary"
            onClick={scrollToTop}
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                zIndex: 9999,
            }}
        >
            <ArrowUpwardIcon />
        </Fab>
    );
};

export default ScrollToTop;