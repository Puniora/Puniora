
const email = "Induilaya040@gmail.com";
const password = "y#aOSRRUM!$%Pzd3#q$sn6N1CgcmnMCN";

async function testShiprocket() {
    console.log("1. Attempting Login...");
    try {
        const loginRes = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!loginRes.ok) {
            console.error("Login Failed:", await loginRes.text());
            return;
        }

        const authData = await loginRes.json();
        const token = authData.token;
        console.log("Login Successful!");

        console.log("\n2. Creating Test Order...");
        const payload = {
            order_id: "TEST_" + Date.now(),
            order_date: new Date().toISOString().slice(0, 10) + " 12:00",
            pickup_location: "primary1",
            billing_customer_name: "Test User",
            billing_last_name: "Test",
            billing_address: "123 Test Street",
            billing_address_2: "Near Landmark",
            billing_city: "Kanchipuram",
            billing_pincode: "600122",
            billing_state: "Tamil Nadu",
            billing_country: "India",
            billing_email: "test@example.com",
            billing_phone: "9876543210",
            shipping_is_billing: true,
            order_items: [{
                name: "Test Product",
                sku: "TEST-SKU-1",
                units: 1,
                selling_price: "100"
            }],
            payment_method: "COD",
            sub_total: 100,
            length: 10,
            breadth: 10,
            height: 10,
            weight: 0.5
        };

        const orderRes = await fetch('https://apiv2.shiprocket.in/v1/external/orders/create/adhoc', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
            console.error("Creation Failed:", JSON.stringify(orderData, null, 2));
        } else {
            console.log("Order Created Successfully!", JSON.stringify(orderData, null, 2));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

testShiprocket();
