
declare global {
  interface Window {
    Razorpay: any;
  }
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string; // Optional for now (client-side flow), but HIGHLY recommended for backend
  handler: (response: any) => void;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
}

export const razorpayService = {
  openPaymentModal: (options: RazorpayOptions) => {
    return new Promise((resolve, reject) => {
      if (!window.Razorpay) {
        reject(new Error("Razorpay SDK not loaded"));
        return;
      }

      const rzp1 = new window.Razorpay(options);
      
      rzp1.on('payment.failed', function (response: any) {
         console.error("Payment Failed", response.error);
         reject(response.error);
      });

      rzp1.open();
    });
  }
};
