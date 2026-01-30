
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
  
  // Use Vercel Proxy in production to bypass CORS
  baseUrl: window.location.hostname.includes('localhost') ? 'https://apiv2.shiprocket.in' : '/api/shiprocket',

  async login() {
    try {
      // Basic token expiry check could be added here
      if(this.token) return this.token; 

      const response = await fetch(`${this.baseUrl}/v1/external/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: this.email, password: this.password })
      });

      if (!response.ok) {
        throw new Error('Shiprocket Login Failed');
      }

      const data: ShiprocketAuthResponse = await response.json();
      this.token = data.token;
      localStorage.setItem('shiprocket_token', data.token);
      return data.token;
    } catch (error) {
       console.error("Shiprocket Login Error:", error);
       throw error;
    }
  },

  async checkServiceability(pincode: string) {
      try {
          const token = await this.login();
          // Pickup pincode is required. Assuming a default or env var.
          const pickupPincode = import.meta.env.VITE_SHIPROCKET_PICKUP_PINCODE || "600122"; // Replace with actual pickup pincode
          
          const url = `${this.baseUrl}/v1/external/courier/serviceability?pickup_postcode=${pickupPincode}&delivery_postcode=${pincode}&weight=0.5&cod=1`;
          
          const response = await fetch(url, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`
              }
          });

          const data = await response.json();
          // status 200 means serviceable usually, but check data.status
          return {
              isServiceable: data.status === 200,
              data: data
          };

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
        pickup_location: import.meta.env.VITE_SHIPROCKET_PICKUP_LOCATION || "Home", // Must match Shiprocket dashboard
        billing_customer_name: order.customer_name,
        billing_last_name: "", // Assuming full name in customer_name
        billing_address: order.address_json.houseAddress,
        billing_address_2: `${order.address_json.landmark || ""}${order.address_json.district ? `, ${order.address_json.district}` : ""}`,
        billing_city: order.address_json.place,
        billing_pincode: order.address_json.pincode || "000000", // Need pincode in order
        billing_state: order.address_json.state,
        billing_country: "India",
        billing_email: "contact@puniora.com", // Fallback if user email not captured in order
        billing_phone: order.customer_mobile,
        shipping_is_billing: true,
        order_items: order.items.map((item: any) => ({
           name: item.name,
           sku: item.id,
           units: item.quantity,
           selling_price: item.price.toString()
        })),
        payment_method: order.payment_status === 'paid' ? 'Prepaid' : 'COD',
        sub_total: order.total_amount,
        length: 10,
        breadth: 10,
        height: 10,
        weight: 0.5
      };

      const response = await fetch(`${this.baseUrl}/v1/external/orders/create/adhoc`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Shiprocket Create Order Error:", error);
      // Don't block whole flow if shipping fails, just log it
      return null;
    }
  },

  async getTracking(awbOrOrderId: string) {
    try {
        const token = await this.login();
        const response = await fetch(`${this.baseUrl}/v1/external/courier/track/awb/${awbOrOrderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        return data; // Returns tracking data
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
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
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
