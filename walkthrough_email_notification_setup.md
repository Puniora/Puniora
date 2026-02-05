# Email Notification Setup & Verification

I have implemented the email notification system using **EmailJS**. To make it
work, you need to configure your API keys and create an email template.

## 1. Setup EmailJS Account

1. Go to [EmailJS](https://www.emailjs.com/) and sign up for a free account.
2. **Add Email Service**:
   - Click "Add New Service".
   - Select your email provider (e.g., Gmail).
   - Connect your account.
   - Note the **Service ID**.

3. **Create Email Template**:
   - Go to "Email Templates" and create a new template.
   - Use the following Template Parameters in your design:
     - `{{customer_name}}`
     - `{{order_id}}`
     - `{{total_amount}}`
     - `{{items_list}}`
     - `{{shipping_address}}`
     - `{{tracking_link}}`
   - Note the **Template ID**.

4. **Get Public Key**:
   - Go to "Account" (avatar icon) -> "API Keys".
   - Copy the **Public Key**.

## 2. Configure Environment Variables

Create or update your `.env.local` file in the project root with the keys from
step 1:

```env
VITE_EMAILJS_SERVICE_ID=your_service_id
VITE_EMAILJS_TEMPLATE_ID=your_template_id
VITE_EMAILJS_PUBLIC_KEY=your_public_key
```

> [!IMPORTANT]
> Restart your development server (`npm run dev`) after updating `.env.local`
> for changes to take effect.

## 3. Verify Implementation

1. Open the application locally (`npm run dev`).
2. Add items to your cart and proceed to checkout.
3. Choose "Cash on Delivery" for a quick test.
4. Place the order.
5. Check your inbox (the email you configured in EmailJS service) or the
   customer email you entered.
6. You should receive a professional purchase confirmation email with all the
   details.
