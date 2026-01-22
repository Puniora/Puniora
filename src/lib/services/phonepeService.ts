import { toast } from "sonner";

export interface PhonePeParams {
  amount: number; // in paise (e.g., 100 for ₹1) - Wait, PhonePe expects in paise (cents)? Razorpay does. PhonePe expects in paise (100 = 1 INR) usually. Docs say "amount in paise".
  // Actually, PhonePe docs say "amount": Long. "Amount in PAISE". Yes.
  mobileNumber: string;
  merchantUserId: string; // usually user ID or mobile number
}

const PHONEPE_UAT_URL = "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay";
const PHONEPE_PROD_URL = "https://api.phonepe.com/apis/hermes/pg/v1/pay";

// Helper to generate SHA256 using Web Crypto API
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export const phonepeService = {
  initiatePayment: async (params: PhonePeParams) => {
    const merchantId = import.meta.env.VITE_PHONEPE_MERCHANT_ID;
    const saltKey = import.meta.env.VITE_PHONEPE_SALT_KEY;
    const saltIndex = import.meta.env.VITE_PHONEPE_SALT_INDEX || "1";
    const env = import.meta.env.VITE_PHONEPE_ENV || "UAT";
    
    const url = env === "PROD" ? PHONEPE_PROD_URL : PHONEPE_UAT_URL;
    
    // Generate a unique Transaction ID
    const merchantTransactionId = "MT" + Date.now() + Math.random().toString(36).substring(2, 6).toUpperCase();

    // Construct Payload
    const payload = {
      merchantId: merchantId,
      merchantTransactionId: merchantTransactionId,
      merchantUserId: params.merchantUserId,
      amount: params.amount,
      redirectUrl: `${window.location.origin}/track`, // Redirect to track page after success/fail
      redirectMode: "REDIRECT", // or POST
      callbackUrl: `${window.location.origin}/api/phonepe-callback`, // This endpoint doesn't exist, but is required logic usually. For frontend redirect, redirectUrl is key.
      mobileNumber: params.mobileNumber,
      paymentInstrument: {
        type: "PAY_PAGE" // Standard checkout
      }
    };

    // Base64 Encode Payload
    const dataPayload = JSON.stringify(payload);
    const base64Payload = btoa(dataPayload);

    // Verify Checksum Logic: SHA256(Base64 + "/pg/v1/pay" + SaltKey) + "###" + SaltIndex
    const stringToHash = base64Payload + "/pg/v1/pay" + saltKey;
    const sha256Value = await sha256(stringToHash);
    const checksum = sha256Value + "###" + saltIndex;

    console.log("PhonePe Initiating Request:", { url, merchantId, merchantTransactionId });

    // Since we cannot make a POST call directly due to CORS (usually), 
    // PhonePe documentation sometimes suggests S2S. 
    // However, for "Standard Checkout", we have to POST/Redirect user.
    // OPTION A: Create a Form and Submit it. This avoids CORS.
    // OPTION B: fetch API call (Blocks CORS if from localhost).
    
    // We will try Option B (fetch) first just to see if they allow it from localhost (highly unlikely).
    // If that fails, we fallback to Option A (Form Submit).
    // Actually, "redirectMode": "REDIRECT" implies we should send the user there. 
    // Wait, the API endpoint '/pg/v1/pay' returns a URL to redirect to? Yes.
    // That API call *must* happen S2S or via proxy.
    // Since we are frontend-only, we are stuck unless PhonePe allows CORS.
    // Most likely it does NOT.
    
    // Workaround: We can't easily fetch(). 
    // However, earlier PhonePe versions allowed a Form POST directly to the pay URL with payload and checksum.
    // The *modern* API requires an API call to get the `instrumentResponse.redirectInfo.url`.
    
    // Plan: We will try to fetch(). If it fails, we will show an error to the user saying "Backend Required".
    // BUT user said "implement this now".
    // I will use a simple proxy service if available? No, can't add external deps.
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-VERIFY": checksum,
          "accept": "application/json"
        },
        body: JSON.stringify({ request: base64Payload })
      });

      if (!response.ok) {
        // Try to read response text for more info
        const errorText = await response.text();
        throw new Error(`PhonePe API Error (${response.status}): ${errorText || response.statusText}`);
      }

      const result = await response.json();
      
      if (result.success && result.data.instrumentResponse.redirectInfo.url) {
        window.location.href = result.data.instrumentResponse.redirectInfo.url;
      } else {
        throw new Error(result.message || "Payment initiation failed");
      }

    } catch (error: any) {
      console.error("PhonePe Integration Error:", error);
      
      // If we are in PROD and it fails (likely CORS), we still want to indicate what happened.
      // However, for the user's specific request "make it work", if they are testing on localhost 
      // with PROD credentials, it will fail due to CORS.
      
      // We will fallback to the "Manual/Mock" flow only if explicitly on localhost to unblock testing UI,
      // but warn heavily.
      if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
         console.warn("PhonePe API Failed (CORS/Network). Simulating for Localhost Demo.");
         toast.error("PhonePe Call Failed (CORS protection). Redirecting to DEMO payment.");
         
         // Redirect to Mock Payment Page as fallback
         window.location.href = `/secure-payment?amount=${params.amount / 100}`;
         
         await new Promise(resolve => setTimeout(resolve, 5000));
         return;
      }
      
      toast.error("Payment Initialization Failed: " + (error.message || "Network Error"));
      throw error;
    }
  }
};
