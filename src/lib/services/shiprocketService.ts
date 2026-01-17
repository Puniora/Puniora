
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
  email: import.meta.env.VITE_SHIPROCKET_EMAIL || "YOUR_EMAIL",
  password: import.meta.env.VITE_SHIPROCKET_PASSWORD || "YOUR_PASSWORD",
  token: localStorage.getItem('shiprocket_token') || "",

  async login() {
    try {
      if(this.token) return this.token; // Cached token

      const response = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
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

  async createOrder(order: any) {
    try {
      const token = await this.login();
      
      const payload: ShiprocketOrderPayload = {
        order_id: order.id,
        order_date: new Date(order.created_at).toISOString().split('T')[0] + ' ' + new Date(order.created_at).toTimeString().split(' ')[0],
        pickup_location: "Primary", // Must match Shiprocket dashboard
        billing_customer_name: order.customer_name,
        billing_last_name: "", // Assuming full name in customer_name
        billing_address: order.address_json.houseAddress,
        billing_address_2: order.address_json.landmark || "",
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

      const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
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
    // For simple implementation, assuming we track using AWB
    try {
      const token = await this.login();
      // Implementation depends on what ID we have. 
      // If AWB: /courier/track/awb/{awb_code}
      return null; 
    } catch (e) {
      return null;
    }
  },

  async cancelOrder(shiprocketOrderId: string) {
    try {
      const token = await this.login();
      const response = await fetch('https://apiv2.shiprocket.in/v1/external/orders/cancel', {
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
