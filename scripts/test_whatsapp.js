import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Helper to get __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../.env.local');
    const data = fs.readFileSync(envPath, 'utf8');
    const env = {};
    data.split('\n').forEach(line => {
      const parts = line.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim();
        if (key && !key.startsWith('#')) {
          env[key] = value;
        }
      }
    });
    return env;
  } catch (err) {
    console.error("Error reading .env.local:", err);
    return {};
  }
}

const env = loadEnv();
const TOKEN = env.VITE_WHATSAPP_API_TOKEN;
const PHONE_ID = env.VITE_WHATSAPP_PHONE_ID;
// We'll use the hardcoded recipient for now as confirmed by user
const RECIPIENT = "918590814463"; 

if (!TOKEN || !PHONE_ID) {
  console.error("Missing credentials in .env.local");
  process.exit(1);
}

async function sendMessage(templateName, components = []) {
  console.log(`\n--- Sending Template: ${templateName} ---`);
  
  const body = {
    messaging_product: "whatsapp",
    to: RECIPIENT,
    type: "template",
    template: {
      name: templateName,
      language: { code: "en_US" }
    }
  };

  if (components.length > 0) {
    body.template.components = components;
  }

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${PHONE_ID}/messages`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    if (!response.ok) {
      console.error("FAILED:", JSON.stringify(data, null, 2));
    } else {
      console.log("SUCCESS:", JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.error("Network Error:", error);
  }
}

async function run() {
  // 1. Test Baseline
  await sendMessage("hello_world");

  // 2. Test Order Confirmation
  // Matching the structure in whatsappService.ts
  const orderComponents = [
    {
      type: "body",
      parameters: [
        { type: "text", text: "Test Product A" }, // {{1}}
        { type: "text", text: "https://puniora.com/track/123" } // {{2}}
      ]
    }
  ];
  await sendMessage("order_confirmation", orderComponents);
}

run();
