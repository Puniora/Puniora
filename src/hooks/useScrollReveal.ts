import { useEffect } from 'react';

export const useScrollReveal = (className = 'reveal-active', threshold = 0.1, trigger?: any) => {
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add(className);
                        observer.unobserve(entry.target); // Reveal only once
                    }
                });
            },
            {
                threshold,
                rootMargin: '0px 0px -50px 0px', // Trigger slightly before element is fully in view
            }
        );

        // Small timeout to ensure DOM is updated if trigger just changed
        const timer = setTimeout(() => {
            const elements = document.querySelectorAll('.reveal');
            elements.forEach((el) => observer.observe(el));
        }, 100);

        return () => {
            observer.disconnect();
            clearTimeout(timer);
        };
    }, [className, threshold, trigger]);
};
