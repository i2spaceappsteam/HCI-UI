import React, { useState, useEffect } from 'react';
import { Button } from 'antd';
import { UpOutlined } from '@ant-design/icons';

const ScrollToTopButton = () => {
    const [visible, setVisible] = useState(false);

    const toggleVisibility = () => {
        if (window.pageYOffset > 350) {
            setVisible(true);
        } else {
            setVisible(false);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    if (!visible) return null;

    return (
        <div 
            className="scroll-to-top"
            style={{
                position: 'fixed',
                bottom: '30px',
                right: '30px',
                zIndex: 1000,
                pointerEvents: 'auto',
            }}
        >
            <Button
                type="primary"
                shape="circle"
                size="large"
                onClick={scrollToTop}
                className="scroll-button"
                style={{
                    width: '42px',
                    height: '42px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.2)',
                    background: '#00164d',
                    borderColor: '#00164d',
                }}
            >
                <UpOutlined style={{ fontSize: '16px', color: '#ffffff' }} />
            </Button>
        </div>
    );
};

export default ScrollToTopButton;
