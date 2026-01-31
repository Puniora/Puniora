
interface ShiprocketAuthResponse {
  token: string;
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  company_id: number;
  created_at: string;
}

interface ShiprocketOrderPayload {
  order_id: string;
  order_date: string;
  pickup_location: string;
  billing_customer_name: string;
  billing_last_name: string;
  billing_address: string;
  billing_address_2: string;
  billing_city: string;
  billing_pincode: string;
  billing_state: string;
  billing_country: string;
  billing_email: string;
  billing_phone: string;
  shipping_is_billing: boolean;
  order_items: Array<{
    name: string;
    sku: string;
    units: number;
    selling_price: string;
  }>;
  payment_method: "COD" | "Prepaid";
  sub_total: number;
  length: number;
  breadth: number;
  height: number;
  weight: number;
}

export const shiprocketService = {
  // NOTE: In a production app, credentials should NOT be hardcoded on client side.
  // This should ideally be an edge function. For now, we put it here as requested.
  // User must provide these env vars or replace values here.
  email: import.meta.env.VITE_SHIPROCKET_EMAIL || "Induilaya040@gmail.com",
  password: import.meta.env.VITE_SHIPROCKET_PASSWORD || "y#aOSRRUM!$%Pzd3#q$sn6N1CgcmnMCN",
  token: localStorage.getItem('shiprocket_token') || "",
  tokenTimestamp: localStorage.getItem('shiprocket_token_time') || "",
  
  // Use Vercel Proxy in production or Vite Proxy in development
  baseUrl: window.location.hostname.includes('localhost') ? '/api/shiprocket' : '/api/shiprocket',

  // Fixed Login: Allows forcing refresh
  async login(forceRefresh = false) {
    try {
      // 1. Check if we have a cached token and it is valid (less than 9 days old)
      if (!forceRefresh && this.token && this.tokenTimestamp) {
          const now = Date.now();
          const tokenTime = parseInt(this.tokenTimestamp);
          const nineDaysInMs = 9 * 24 * 60 * 60 * 1000;
          
          if (now - tokenTime < nineDaysInMs) {
              console.log("Using Cached Shiprocket Token (Valid for 9 days)");
              return this.token;
          }
      }

      console.log("Fetching New Shiprocket Token...");
      const response = await fetch(`${this.baseUrl}/v1/external/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Shiprocket Login Failed Details:", response.status, errorText);
        throw new Error(`Shiprocket Login Failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: ShiprocketAuthResponse = await response.json();
      
      this.token = data.token;
      this.tokenTimestamp = Date.now().toString();
      
      localStorage.setItem('shiprocket_token', data.token);
      localStorage.setItem('shiprocket_token_time', this.tokenTimestamp);
      
      return data.token;
    } catch (error) {
       console.error("Shiprocket Login Error:", error);
       throw error;
    }
  },

  async checkServiceability(pincode: string) {
      try {
          const token = await this.login();
          const pickupPincode = import.meta.env.VITE_SHIPROCKET_PICKUP_PINCODE || "600122";
          
          const url = `${this.baseUrl}/v1/external/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${pincode}&weight=0.5&cod=1`;
          
          let response = await fetch(url, {
              method: 'GET',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
          });

          // Auto-Retry on 401 (Unauthorized)
          if (response.status === 401) {
              console.warn("Shiprocket Token Expired. Refreshing...");
              const newToken = await this.login(true); // Force refresh
              response = await fetch(url, {
                  method: 'GET',
                  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` }
              });
          }

          const data = await response.json();
          return { isServiceable: data.status === 200, data: data };

      } catch (error) {
          console.error("Serviceability Check Error:", error);
          return { isServiceable: false, error };
      }
  },

  async createOrder(order: any) {
    try {
      const token = await this.login();
      
      const payload: ShiprocketOrderPayload = {
        order_id: order.id,
        order_date: new Date(order.created_at).toISOString().split('T')[0] + ' ' + new Date(order.created_at).toTimeString().split(' ')[0],
        pickup_location: import.meta.env.VITE_SHIPROCKET_PICKUP_LOCATION || "Home",
        billing_customer_name: order.customer_name,
        billing_last_name: "",
        billing_address: order.address_json.houseAddress,
        billing_address_2: `${order.address_json.landmark || ""}${order.address_json.district ? `, ${order.address_json.district}` : ""}`,
        billing_city: order.address_json.place,
        billing_pincode: order.address_json.pincode,
        billing_state: order.address_json.state,
        billing_country: "India",
        billing_email: "contact@puniora.com",
        billing_phone: order.customer_mobile.replace(/\s/g, ''), // Remove spaces for Shiprocket validation
        shipping_is_billing: true,
        order_items: order.items.map((item: any) => ({
           name: item.name,
           sku: item.id,
           units: item.quantity,
           selling_price: item.price.toString()
        })),
        payment_method: order.payment_status === 'paid' ? 'Prepaid' : 'COD',
        sub_total: order.total_amount,
        length: 10, breadth: 10, height: 10, weight: 0.5
      };

      let response = await fetch(`${this.baseUrl}/v1/external/orders/create/adhoc`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });

      // Auto-Retry on 401
      if (response.status === 401) {
          console.warn("Shiprocket CreateOrder 401. Refreshing Token...");
          const newToken = await this.login(true);
          response = await fetch(`${this.baseUrl}/v1/external/orders/create/adhoc`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${newToken}` },
            body: JSON.stringify(payload)
          });
      }

      const data = await response.json();
      
      // Check for logical errors even if 200 OK (Shiprocket sometimes returns 200 with error inside)
      if (data.status_code === 404 || data.message === "Invalid token detected") {
           throw new Error(data.message || "Shiprocket Error");
      }
      
      return data;
    } catch (error: any) {
      console.error("Shiprocket Create Order Error:", error);
      throw error; // Propagate to show toast
    }
  },

  async getTracking(awbOrOrderId: string) {
    try {
        const token = await this.login();
        const response = await fetch(`${this.baseUrl}/v1/external/courier/track/awb/${awbOrOrderId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        return data; 
    } catch (error) {
        console.error("Tracking error:", error);
        return null;
    }
  },

  // Helper to map Shiprocket Status to App Status
  mapShiprocketStatus(srStatus: string): 'Order Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled' {
      const status = srStatus.toUpperCase();
      
      if (status.includes("DELIVERED")) return 'Delivered';
      if (status.includes("OUT FOR DELIVERY")) return 'Out for Delivery';
      if (status.includes("SHIPPED") || status.includes("IN TRANSIT") || status.includes("PICKED UP") || status.includes("RTO")) return 'Shipped';
      if (status.includes("PACKED") || status.includes("PICKUP SCHEDULED") || status.includes("NEW")) return 'Packed';
      if (status.includes("CANCELED") || status.includes("CANCELLED")) return 'Cancelled';
      
      return 'Order Placed'; // Default fallback
  },

  async cancelOrder(shiprocketOrderId: string) {
    try {
      const token = await this.login();
      const response = await fetch(`${this.baseUrl}/v1/external/orders/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ids: [shiprocketOrderId] })
      });
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Shiprocket Cancel Error:", error);
      throw error;
    }
  }
};
