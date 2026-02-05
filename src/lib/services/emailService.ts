import emailjs from '@emailjs/browser';
import { Order } from './orderService';
import { formatPrice } from '../products';

export const emailService = {
  serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID,
  templateId: import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
  publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY,

  async sendOrderConfirmation(order: Order) {
    if (!this.serviceId || !this.templateId || !this.publicKey) {
      console.warn("EmailJS credentials missing. Skipping email notification.");
      return { success: false, error: "Missing configuration" };
    }

    try {
      // Format items for the email
      const itemsList = order.items.map(item => 
        `- ${item.name} (${item.size || 'N/A'}) x ${item.quantity} - ${formatPrice(item.price * item.quantity)}`
      ).join('\n');

      const templateParams = {
        customer_name: order.customer_name,
        customer_email: order.customer_email || order.address_json.houseAddress, // fallback if email is missing, though we prioritize email field
        order_id: order.id,
        total_amount: formatPrice(order.total_amount),
        items_list: itemsList,
        shipping_address: `${order.address_json.houseAddress}, ${order.address_json.landmark || ''}, ${order.address_json.place}, ${order.address_json.district}, ${order.address_json.state} - ${order.address_json.pincode}`,
        tracking_link: `${window.location.origin}/auth?redirect=/track-order`
      };

      console.log("Sending email with params:", templateParams);

      const response = await emailjs.send(
        this.serviceId,
        this.templateId,
        templateParams,
        this.publicKey
      );

      console.log('Email sent successfully!', response.status, response.text);
      return { success: true, response };

    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  }
};
