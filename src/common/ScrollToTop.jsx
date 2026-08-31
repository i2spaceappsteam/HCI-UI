import React, { useState, useEffect } from 'react';
import { Button } from 'antd'; // or any UI library you're using
import { UpOutlined } from '@ant-design/icons'; // Example using Ant Design

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

    return (
        <div className="scroll-to-top">
            {visible && (
                <Button
                    type="primary"
                    shape="circle"
                    onClick={scrollToTop}
                    className="scroll-button"
                    style={{display:"block"}}
                >
                    <span><i class="fa fa-chevron-circle-up" aria-hidden="true"></i></span>
                    {/* <span className="scroll-text">Scroll to Top</span> */}
                </Button>
            )}
        </div>
    );
};

export default ScrollToTopButton;
