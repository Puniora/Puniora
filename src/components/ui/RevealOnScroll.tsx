import React, { useEffect, useRef, useState } from "react";

interface RevealOnScrollProps {
  children: React.ReactNode;
  variant?: "fade-up" | "fade-in" | "scale-up" | "slide-left" | "slide-right";
  delay?: number; // in ms
  duration?: number; // in ms
  threshold?: number; // 0 to 1
  className?: string;
  runOnce?: boolean;
}

const RevealOnScroll: React.FC<RevealOnScrollProps> = ({
  children,
  variant = "fade-up",
  delay = 0,
  duration = 800,
  threshold = 0.1,
  className = "",
  runOnce = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (runOnce && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!runOnce) {
            setIsVisible(false);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -50px 0px", // Trigger slightly before element is fully in view
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, runOnce]);

  const getTransformOrigin = () => {
     switch (variant) {
        case "scale-up": return "center center";
        default: return "center";
     }
  };

  const getBaseStyle = () => {
    const common = `transition-all ease-[cubic-bezier(0.16,1,0.3,1)]`; // Nice smooth ease
    
    // Initial States
    switch (variant) {
      case "fade-up":
        return `${common} ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"}`;
      case "fade-in":
        return `${common} ${isVisible ? "opacity-100" : "opacity-0"}`;
      case "scale-up":
        return `${common} ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`;
      case "slide-left":
        return `${common} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-12"}`;
      case "slide-right":
        return `${common} ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-12"}`;
      default:
        return common;
    }
  };

  return (
    <div
      ref={ref}
      className={`${getBaseStyle()} ${className}`}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transformOrigin: getTransformOrigin()
      }}
    >
      {children}
    </div>
  );
};

export default RevealOnScroll;
