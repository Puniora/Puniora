
export const whatsappService = {
  token: import.meta.env.VITE_WHATSAPP_API_TOKEN,
  phoneId: import.meta.env.VITE_WHATSAPP_PHONE_ID,

  async sendOrderConfirmation(order: any) {
    if (!this.token || !this.phoneId) {
      console.warn("WhatsApp credentials missing. Skipping notification.");
      return;
    }

    try {
      const response = await fetch(`https://graph.facebook.com/v21.0/${this.phoneId}/messages`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          to: order.customer_mobile,
          type: "template",
          template: {
            name: "order_confirmation",
            language: {
              code: "en_US"
            },
            components: [
              {
                type: "body",
                parameters: [
                  {
                    type: "text",
                    text: order.items[0]?.name || "Item" // Parameter {{1}}: Item Name
                  },
                  {
                    type: "text",
                    text: `${window.location.origin}/auth?redirect=/track-order` // Parameter {{2}}: Tracking Link (via Auth)
                  }
                ]
              }
            ]
          }
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error("WhatsApp API Error:", data);
        return { success: false, error: data };
      }

      console.log("WhatsApp Notification Sent:", data);
      return { success: true, data };
    } catch (error) {
      console.error("WhatsApp Service Error:", error);
      return { success: false, error };
    }
  }
};
