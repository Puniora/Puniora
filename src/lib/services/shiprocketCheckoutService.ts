import { toast } from "sonner";

const SHIPROCKET_EMAIL = import.meta.env.VITE_SHIPROCKET_EMAIL;
const SHIPROCKET_PASSWORD = import.meta.env.VITE_SHIPROCKET_PASSWORD;

// Using a proxy to avoid CORS issues in development if needed, or direct API
// Note: Shiprocket API often fails with CORS from browser. Best practice is a backend proxy.
// However, for this implementation we will attempt direct call or warn about CORS.
const BASE_URL = "https://apiv2.shiprocket.in/v1/external";

export interface ShiprocketAddress {
  id?: string;
  name: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
}

class ShiprocketCheckoutService {
  private token: string | null = null;
  private tokenExpiry: number = 0;

  private async login() {
    // Return cached token if still valid (minus 1 hour buffer)
    if (this.token && Date.now() < this.tokenExpiry) {
      return this.token;
    }

    try {
      const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: SHIPROCKET_EMAIL,
          password: SHIPROCKET_PASSWORD,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to login to Shiprocket");
      }

      const data = await response.json();
      this.token = data.token;
      // Token usually lasts 10 days, setting 24h for safety
      this.tokenExpiry = Date.now() + 24 * 60 * 60 * 1000; 
      return this.token;
    } catch (error) {
      console.error("Shiprocket Login Error:", error);
      throw error;
    }
  }

  // Fetch orders by mobile number and extract unique addresses
  public async getAddressesByMobile(mobile: string): Promise<ShiprocketAddress[]> {
    try {
      if (!SHIPROCKET_EMAIL || !SHIPROCKET_PASSWORD) {
        toast.error("Shiprocket credentials missing");
        return [];
      }

      const token = await this.login();

      // Search for orders with this mobile number
      // We assume standard Shiprocket Orders API allows searching
      // Endpoint to filter might vary, commonly uses ?search={query} or ?to_phone={mobile}
      // Since specific 'search by phone' isn't explicitly documented publicly for a single endpoint,
      // we'll try the general order list with a search param.
      
      const response = await fetch(`${BASE_URL}/orders?search=${mobile}`, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        }
      });

      if (!response.ok) {
         // Silently fail or log
         return [];
      }

      const data = await response.json();
      const orders = data.data || [];

      // Extract addresses
      const addresses: ShiprocketAddress[] = [];
      const seen = new Set<string>(); // Deduplicate by pincode+address

      for (const order of orders) {
         // Check if order phone matches roughly (sometimes data has prefixes)
         if (order.customer_phone?.includes(mobile)) {
             const key = `${order.customer_pincode}-${order.customer_address}`;
             if (!seen.has(key)) {
                 seen.add(key);
                 addresses.push({
                     name: order.customer_name,
                     address_line1: order.customer_address,
                     address_line2: order.customer_address_2 || "",
                     city: order.customer_city,
                     state: order.customer_state,
                     pincode: order.customer_pincode,
                     phone: order.customer_phone
                 });
             }
         }
      }

      return addresses;

    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      // Don't show toast to user to avoid confusion if it's just a backend error
      return [];
    }
  }
}

export const shiprocketCheckoutService = new ShiprocketCheckoutService();
