
import { shiprocketService } from "@/lib/services/shiprocketService";

export const testShiprocketConnection = async () => {
  console.log("Starting Shiprocket Test...");
  try {
    const token = await shiprocketService.login();
    console.log("Login Success! Token:", token ? "Received" : "Missing");

    // Try a simple profile fetch or checking pickup locations to verify permissions
    // Note: 'ordering' permissions might be separate.
    return { success: true, message: "Login successful" };
  } catch (error) {
    console.error("Test Failed:", error);
    return { success: false, message: error instanceof Error ? error.message : "Unknown error" };
  }
};
