import { useState, useEffect } from "react";

const InitialLoader = () => {
    const [isVisible, setIsVisible] = useState(true);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        // Check if we've visited this session
        const hasVisited = sessionStorage.getItem("hasVisited");

        if (hasVisited) {
            setIsVisible(false);
            setShouldRender(false);
            return;
        }

        // Mark visited
        sessionStorage.setItem("hasVisited", "true");

        // Start exit animation after delay
        const timer = setTimeout(() => {
            setIsVisible(false);
        }, 2200); // 2.2s duration

        // Remove from DOM after animation finishes
        const removeTimer = setTimeout(() => {
            setShouldRender(false);
        }, 3000); 

        return () => {
            clearTimeout(timer);
            clearTimeout(removeTimer);
        };
    }, []);

    if (!shouldRender) return null;

    return (
        <div 
            className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-700 ease-in-out ${isVisible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
            <div className={`flex flex-col items-center transition-all duration-1000 transform ${isVisible ? "scale-100 opacity-100" : "scale-110 opacity-0"}`}>
                <div className="relative">
                    <h1 className="font-heading text-5xl md:text-7xl text-gold tracking-widest relative z-10 p-4 animate-fade-in">
                        Puniora
                    </h1>
                    <div 
                        className="absolute -inset-4 border border-gold/20 rounded-full animate-pulse"
                        style={{ animationDuration: '2s' }}
                    />
                </div>
                <p className="text-white/60 text-xs uppercase tracking-[0.5em] mt-4 animate-slide-up bg-gradient-to-r from-transparent via-gold/50 to-transparent bg-clip-text text-transparent">
                    Luxury In Every Breath
                </p>
            </div>
        </div>
    );
};

export default InitialLoader;
