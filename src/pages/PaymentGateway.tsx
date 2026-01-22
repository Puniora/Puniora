import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, ShieldCheck, Smartphone, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const PaymentGateway = () => {
  const [searchParams] = useSearchParams();
  const amount = searchParams.get("amount") || "0";
  const navigate = useNavigate();
  const [status, setStatus] = useState<"scanning" | "processing" | "success">("scanning");
  const upiId = import.meta.env.VITE_UPI_ID || "puniora@upi"; // Fallback placeholder
  const merchantName = "Puniora Luxury Perfumes";

  const handleManualConfirmation = () => {
    setStatus("processing");
    // Simulate verification delay
    setTimeout(() => {
        setStatus("success");
    }, 2000);
  };

  useEffect(() => {
      if (status === "success") {
        setTimeout(() => {
            navigate("/checkout?payment_success=true");
        }, 1500);
      }
  }, [status, navigate]);

  // Construct Real UPI Link
  const upiLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiLink)}`;

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-white relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-slate-950">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
            <ShieldCheck className="h-6 w-6 text-green-400" />
            <span className="font-heading text-xl tracking-wide">Secure Payment Gateway</span>
        </div>

        {/* Amount */}
        <div className="mb-8 text-center">
            <p className="text-sm text-white/60 uppercase tracking-widest mb-1">Paying Puniora</p>
            <h1 className="text-4xl font-bold">₹{amount}</h1>
        </div>

        {status === "scanning" && (
            <div className="w-full flex flex-col items-center animate-fade-in">
                {/* Real QR Code */}
                <div className="w-64 h-64 bg-white rounded-2xl p-4 mb-6 relative group">
                    <div className="w-full h-full bg-black/5 border-2 border-dashed border-black/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                         <img 
                            src={qrCodeUrl} 
                            alt="Payment QR" 
                            className="w-full h-full object-contain"
                         />
                         
                         {/* Logo Overlay */}
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full p-1 shadow-lg">
                             <div className="w-full h-full bg-purple-600 rounded-full flex items-center justify-center font-bold text-xs">UPI</div>
                         </div>
                    </div>
                </div>

                <p className="text-sm text-center text-white/50 mb-6 font-mono">
                    UPI ID: <span className="text-white select-all">{upiId}</span>
                </p>

                <p className="text-sm text-center text-orange-400/80 mb-6 italic">
                    Scan using any UPI App to pay.
                </p>

                <div className="w-full space-y-3">
                    <Button onClick={handleManualConfirmation} className="w-full bg-green-600 hover:bg-green-700 h-12 gap-2 text-white font-bold animate-pulse">
                        <CheckCircle2 className="h-4 w-4" /> I Have Paid
                    </Button>
                    <Button variant="ghost" onClick={() => navigate('/checkout')} className="w-full text-white/40 hover:text-white">
                        Cancel Transaction
                    </Button>
                </div>
            </div>
        )}

        {status === "processing" && (
            <div className="py-12 flex flex-col items-center animate-fade-in">
                <Loader2 className="h-16 w-16 text-purple-500 animate-spin mb-6" />
                <h3 className="text-xl font-bold mb-2">Processing Payment...</h3>
                <p className="text-white/60 text-center text-sm">Please do not close this window</p>
            </div>
        )}

        {status === "success" && (
            <div className="py-12 flex flex-col items-center animate-scale-in">
                <div className="h-20 w-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(34,197,94,0.4)]">
                    <CheckCircle2 className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-green-400">Payment Successful!</h3>
                <p className="text-white/60 text-center text-sm">Redirecting to merchant...</p>
            </div>
        )}
        
      </div>

      <div className="mt-8 flex gap-4 opacity-30 grayscale">
          {/* Icons placeholder */}
          <div className="text-xs text-white/40">Secured by UPI</div>
      </div>
    </div>
  );
};

export default PaymentGateway;
