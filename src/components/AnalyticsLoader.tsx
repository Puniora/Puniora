import { useEffect } from "react";
import ReactGA from "react-ga4";
import { useLocation } from "react-router-dom";
import { settingsService } from "@/lib/services/settingsService";

export const AnalyticsLoader = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Initial Load of GA Setting
    const initGA = async () => {
      const gaId = await settingsService.getSetting("google_analytics_id");
      
      if (gaId) {
        // Initialize GA4
        ReactGA.initialize(gaId);
        console.log("Analytics Initialized:", gaId);
      }
    };

    initGA();
  }, []);

  useEffect(() => {
    // 2. Track Page Views on Route Change
    // We check if GA is initialized (internal check) or just fire send
    // ReactGA.send handles the "is initialized" check gracefully mostly, but good to ensure.
    ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
  }, [location]);

  return null; // Component doesn't render anything
};
