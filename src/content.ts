console.log("✅ AdFriend content script loaded");

// Ad selectors for removal
const adSelectors: string[] = [
  "iframe[title*='advertisement']",
  "div[id*='ad']",
  "div[class*='ad']",
  "ins.adsbygoogle",
  "div[data-ad]",
  "aside[aria-label='advertisement']"
];

// Function to remove ads and replace them
const removeAdsAndReplace = () => {
  let removedCount = 0;
  
  adSelectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((ad) => {
      const replacement = document.createElement("div");
      replacement.className = "adfriend-replacement";
      replacement.style.cssText = `
        display: flex;
        align-items: center;
        justify-content: center;
        background: #222;
        color: #fff;
        font-size: 16px;
        text-align: center;
        padding: 10px;
        margin: 10px 0;
        border-radius: 5px;
        min-height: 50px;
      `;

      // Choose between survey, quote, or recommendation
      const contentTypes = ["survey", "quote", "recommendation"];
      const selectedType = contentTypes[Math.floor(Math.random() * contentTypes.length)];

      if (selectedType === "survey") {
        const text = document.createElement("strong");
        text.innerHTML = "📝 Quick Survey: What's your top priority this year? ";
        
        const button = document.createElement("button");
        button.innerText = "Answer";
        button.style.cssText = "margin-left: 10px; padding: 5px 10px; background: #ff9800; color: #fff; border: none; cursor: pointer;";
        button.addEventListener("click", sendSurveyResponse);
      
        replacement.appendChild(text);
        replacement.appendChild(button);
      } else if (selectedType === "quote") {
        replacement.innerHTML = `<strong>💡 Inspiration:</strong> "The best way to predict the future is to create it." – Peter Drucker`;
      } else {
        replacement.innerHTML = `<strong>🔍 Recommendation:</strong> Check out this amazing book on productivity!  
        <a href="#" style="color: #ff9800; text-decoration: underline;">See More</a>`;
      }

      ad.replaceWith(replacement);
      removedCount++;
    });
  });

  if (removedCount > 0) console.log(`🗑 Removed ${removedCount} ads and replaced with content`);
};

// Observer to handle dynamically loaded ads
const observeAds = () => {
  const observer = new MutationObserver(() => removeAdsAndReplace());
  observer.observe(document.body, { childList: true, subtree: true });
};

// Function to track user behavior
const trackUserBehavior = () => {
  const startTime = Date.now();

  document.addEventListener("click", (event) => {
    const targetText = (event.target as HTMLElement)?.innerText?.trim();
    if (targetText) {
      sendMessageToBackground("CLICK", targetText);
    }
  });

  let lastScrollTime = 0;
  document.addEventListener("scroll", () => {
    const now = Date.now();
    if (now - lastScrollTime > 1000) { // Throttle scroll tracking
      lastScrollTime = now;
      const scrollDepth = window.scrollY + window.innerHeight;
      sendMessageToBackground("SCROLL", scrollDepth.toString());
    }
  });

  window.addEventListener("beforeunload", () => {
    const timeSpent = ((Date.now() - startTime) / 1000).toFixed(2);
    sendMessageToBackground("TIME_SPENT", timeSpent);
  });
};

// Function to send messages to background script
const sendMessageToBackground = (type: string, data: string) => {
  if (chrome.runtime) {
    chrome.runtime.sendMessage({ type, data });
  } else {
    console.warn("🚨 Chrome runtime not available. Skipping message:", { type, data });
  }
};

// Function to handle survey responses
const sendSurveyResponse = () => {
  const response = prompt("What's your top priority this year?");
  if (response) {
    sendMessageToBackground("SURVEY_RESPONSE", response);
    alert("Thank you for your response!");
  }
};

// Run scripts
removeAdsAndReplace();
observeAds();
trackUserBehavior();
