import { supabase } from "../supabase";

export interface Address {
  state: string;
  district: string;
  place: string;
  houseAddress: string;
  landmark: string;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  size?: string;
  note?: string;
}

export interface Order {
  id: string;
  created_at: string;
  customer_name: string;
  customer_mobile: string;
  customer_email?: string; // Added for guest checkout
  address_json: Address;
  total_amount: number;
  payment_status: 'pending' | 'paid' | 'failed';
  tracking_status: 'Order Placed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  tracking_id?: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  items: OrderItem[];
  user_id?: string; // Link to authenticated user
  shiprocket_order_id?: string;
  shiprocket_shipment_id?: string;
  awb_code?: string;
  cancellation_reason?: string;
}

export const orderService = {
  async createOrder(orderData: Omit<Order, 'id' | 'created_at' | 'tracking_status'>) {
    const { data, error } = await supabase
      .from('orders')
      .insert([{ ...orderData, tracking_status: 'Order Placed' }])
      .select()
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }
    return data;
  },

  async updatePaymentStatus(orderId: string, status: 'paid' | 'failed', razorpayPaymentId?: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: status,
        razorpay_payment_id: razorpayPaymentId
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
    return data;
  },

  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
    return data;
  },

  async getOrders() {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
    return data || [];
  },

  async updateTracking(orderId: string, status: Order['tracking_status'], trackingId?: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({
        tracking_status: status,
        tracking_id: trackingId
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating tracking:', error);
      throw error;
    }
    return data;
  },

  async updateShiprocketDetails(orderId: string, details: { shiprocket_order_id: string, shiprocket_shipment_id: string, awb_code: string }) {
    const { data, error } = await supabase
      .from('orders')
      .update(details)
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating shiprocket details:', error);
      // Don't throw, just log
    }
    return data;
  },

  async cancelOrder(orderId: string, reason?: string) {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        tracking_status: 'Cancelled',
        cancellation_reason: reason 
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
       console.error("Error cancelling order:", error);
       throw error;
    }
    return data;
  },

  async deleteOrder(orderId: string) {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);



    if (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
    return true;
  },

  async getOrdersByMobile(mobile: string) {
    // Normalize mobile (basic check)
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('customer_mobile', mobile)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders by mobile:', error);
      throw error;
    }
    return data || [];
  },

  // Modified to fetch by user_id OR email (for linking guest orders)
  async getOrdersByUser(userId: string, email?: string) {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (email) {
      // Fetch orders where either user_id matches OR customer_email matches
      query = query.or(`user_id.eq.${userId},customer_email.eq.${email}`);
    } else {
      query = query.eq('user_id', userId);
    }
    
    const { data, error } = await query;

    if (error) {
       console.error('Error fetching user orders:', error);
       throw error;
    }
    return data || [];
  }
};
