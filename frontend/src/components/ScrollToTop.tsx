'use client';

import { ChevronUp } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ScrollToTopButton() {
    const [isVisible, setIsVisible] = useState(false);

    // Show button when page is scrolled down
    const toggleVisibility = () => {
        if (window.pageYOffset > 300) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    };

    // Scroll to top smoothly
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        window.addEventListener('scroll', toggleVisibility);
        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, []);

    if (!isVisible) {
        return null;
    }

    return (
        <button
            type="button"
            onClick={scrollToTop}
            className="fixed bottom-6 bg-[#263796] hover:bg-[#1e2a7a] text-white right-6 p-3 rounded-full shadow-lg transition-all duration-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 z-50 cursor-pointer"
            aria-label="На вверх"
        >
            <ChevronUp className="h-6 w-6" />
        </button>
    );
}
