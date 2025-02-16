// Initialize AdFriend extension settings on installation
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ isTrackingEnabled: true, trackingData: [] });
  console.log("✅ AdFriend initialized: Tracking enabled.");
});

// Message listener for handling tracking settings and events
chrome.runtime.onMessage.addListener(
  async (message: { type: string; data?: any }, _sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) => {
    console.log("📩 Message received:", message);

    try {
      switch (message.type) {
        case "TOGGLE_TRACKING":
          await toggleTracking(sendResponse);
          break;

        case "GET_TRACKING_DATA":
          await getTrackingData(sendResponse);
          break;

        default:
          await logTrackingEvent(message, sendResponse);
          break;
      }
    } catch (error) {
      console.error("❌ Error handling message:", error);
      sendResponse({ success: false, message: "Error processing the request." });
    }

    return true; // Keeps `sendResponse` async
  }
);

// Toggle tracking state
async function toggleTracking(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get("isTrackingEnabled");
    const newState = !result.isTrackingEnabled;

    await chrome.storage.local.set({ isTrackingEnabled: newState });
    console.log(`🔁 Tracking toggled: ${newState ? "ON" : "OFF"}`);
    sendResponse({ success: true, isTrackingEnabled: newState });
  } catch (error) {
    console.error("❌ Error toggling tracking:", error);
    sendResponse({ success: false, message: "Failed to toggle tracking." });
  }
}

// Retrieve stored tracking data
async function getTrackingData(sendResponse: (response: any) => void) {
  try {
    const result = await chrome.storage.local.get("trackingData");
    sendResponse({ success: true, trackingData: result.trackingData || [] });
  } catch (error) {
    console.error("❌ Error fetching tracking data:", error);
    sendResponse({ success: false, message: "Failed to retrieve tracking data." });
  }
}

// Log tracking event if tracking is enabled
async function logTrackingEvent(
  message: { type: string; data?: any },
  sendResponse: (response: any) => void
) {
  try {
    const result = await chrome.storage.local.get(["isTrackingEnabled", "trackingData"]);
    if (!result.isTrackingEnabled) {
      console.log("🚫 Tracking is disabled");
      sendResponse({ success: false, message: "Tracking is disabled" });
      return;
    }

    const trackingData = result.trackingData || [];

    // Maintain a storage limit of 100 logs
    if (trackingData.length >= 100) trackingData.shift();

    const newEvent = {
      type: message.type,
      data: message.data,
      timestamp: new Date().toISOString(),
    };

    trackingData.push(newEvent);

    await chrome.storage.local.set({ trackingData });
    console.log(`✅ Logged event (${message.type}):`, message.data);
    sendResponse({ success: true, message: `Tracking event logged: ${message.type}` });
  } catch (error) {
    console.error("❌ Error logging tracking event:", error);
    sendResponse({ success: false, message: "Failed to log event." });
  }
}
