import { useEffect } from 'react';

export const useScrollReveal = (className = 'reveal-active', threshold = 0.1) => {
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

        const elements = document.querySelectorAll('.reveal');
        elements.forEach((el) => observer.observe(el));

        return () => observer.disconnect();
    }, [className, threshold]);
};
