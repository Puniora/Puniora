interface AnnouncementBannerProps {
  enabled: boolean;
  text: string;
}

import { useLocation } from "react-router-dom";

const AnnouncementBanner = ({ enabled, text }: AnnouncementBannerProps) => {
  const location = useLocation();
  const isHome = location.pathname === "/";

  if (!enabled || !text) return null;

  return (
    <div className={`w-full bg-gold text-white overflow-hidden py-1.5 z-[60] relative ${isHome ? 'bg-opacity-90 backdrop-blur-sm' : ''}`}>
      <div className="animate-marquee whitespace-nowrap">
        <span className="mx-4 text-xs font-bold uppercase tracking-[0.2em] inline-block">
          {text}
        </span>
        <span className="mx-4 text-xs font-bold uppercase tracking-[0.2em] inline-block">
          •
        </span>
        <span className="mx-4 text-xs font-bold uppercase tracking-[0.2em] inline-block">
          {text}
        </span>
        <span className="mx-4 text-xs font-bold uppercase tracking-[0.2em] inline-block">
          •
        </span>
        <span className="mx-4 text-xs font-bold uppercase tracking-[0.2em] inline-block">
          {text}
        </span>
         <span className="mx-4 text-xs font-bold uppercase tracking-[0.2em] inline-block">
          •
        </span>
        <span className="mx-4 text-xs font-bold uppercase tracking-[0.2em] inline-block">
          {text}
        </span>
      </div>
      
      {/* CSS for marquee animation if not in global css */}
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          display: inline-block;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AnnouncementBanner;
