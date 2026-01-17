import { useLocation } from "react-router-dom";
import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
    const location = useLocation();

    // Hide on admin pages
    if (location.pathname.startsWith("/admin")) return null;

    const phoneNumber = "917010418285";
    const message = encodeURIComponent("Hi, I identify this from the Puniora website and would like to know more.");

    return (
        <a
            href={`https://wa.me/${phoneNumber}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300 animate-bounce-subtle flex items-center gap-2 group"
            aria-label="Chat on WhatsApp"
        >
            <MessageCircle className="w-8 h-8 fill-current" />
            <span className="max-w-0 overflow-hidden font-bold whitespace-nowrap group-hover:max-w-xs transition-all duration-500 ease-in-out">
                Chat with us
            </span>
        </a>
    );
};

export default WhatsAppButton;
