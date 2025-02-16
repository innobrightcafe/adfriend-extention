import React, { Component, ReactNode } from "react";
import { useEffect, useState } from "react";
import styles from "./App.module.css";
import { Button } from "./components/Button";
import { CirclePower, List, Trash } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode; // Define the type of children
}

interface ErrorBoundaryState {
  hasError: boolean;
}


class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Please try again later.</h1>;
    }
    return this.props.children;
  }
}


export default function App() {
  const [status, setStatus] = useState<string>("");
  const [logs, setLogs] = useState<{ type: string; data: string; timestamp: string }[]>([]);
  const [isTrackingEnabled, setIsTrackingEnabled] = useState<boolean>(true);

  useEffect(() => {
    // Safeguard chrome.runtime and chrome.storage calls
    if (chrome && chrome.runtime && chrome.storage) {
      chrome.storage.local.get("isTrackingEnabled", (result) => {
        setIsTrackingEnabled(result.isTrackingEnabled ?? true);
      });
    } else {
      console.warn("⚠️ Chrome runtime or storage not available. Ensure extension is loaded.");
    }
  }, []);

  const handleClick = () => {
    console.log("Button clicked! Sending message...");

    if (chrome && chrome.runtime?.id) {
      chrome.runtime.sendMessage(
        { type: "START_ACTION", data: "User clicked Get Started" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error sending message:", chrome.runtime.lastError);
            setStatus("❌ Error: Could not send message");
          } else {
            console.log("Response from background:", response);
            setStatus("✅ Message sent successfully!");
          }
        }
      );
    } else {
      console.error("Chrome runtime not available");
      setStatus("⚠️ Chrome runtime not available");
    }
  };

  // Fetch tracking logs from storage
  const fetchLogs = () => {
    if (chrome && chrome.storage) {
      chrome.storage.local.get("trackingData", (result) => {
        if (chrome.runtime.lastError) {
          console.error("Error fetching logs:", chrome.runtime.lastError);
          setStatus("❌ Error fetching logs");
        } else {
          setLogs(result.trackingData || []);
          setStatus("📜 Tracking logs loaded");
        }
      });
    }
  };

  // Clear tracking logs
  const clearLogs = () => {
    if (chrome && chrome.storage) {
      chrome.storage.local.set({ trackingData: [] }, () => {
        setLogs([]);
        setStatus("🗑 Logs cleared");
      });
    }
  };

  // Toggle tracking state
  const toggleTracking = () => {
    const newState = !isTrackingEnabled;
    if (chrome && chrome.storage) {
      chrome.storage.local.set({ isTrackingEnabled: newState }, () => {
        setIsTrackingEnabled(newState);
        setStatus(`🔁 Tracking ${newState ? "Enabled" : "Disabled"}`);
      });
    }
  };


  return (
    <ErrorBoundary>
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          <h2 className={styles.title}>AdFriend</h2>
          <p className={styles.subtitle}>Replace ads with useful content</p>
          <Button title="Get Started" onClick={handleClick} icon={<CirclePower size={18} />} />
          <Button title="View Logs" onClick={fetchLogs} icon={<List size={18} />} />
          <Button title="Clear Logs" onClick={clearLogs} icon={<Trash size={18} />} />
          
          {/* Tracking Toggle Switch */}
          <div className={styles.toggleContainer}>
            <label className={styles.switch}>
              <input type="checkbox" checked={isTrackingEnabled} onChange={toggleTracking} />
              <span className={styles.slider}></span>
            </label>
            <p className={styles.trackingStatus}>
              {isTrackingEnabled ? "🟢 Tracking Enabled" : "🔴 Tracking Disabled"}
            </p>
          </div>

          {status && <p className={styles.status}>{status}</p>}

          {logs.length > 0 && (
            <div className={styles.logContainer}>
              <h3>📊 Tracking Logs</h3>
              <ul className={styles.logList}>
                {logs.map((log, index) => (
                  <li key={index} className={styles.logItem}>
                    <strong>{log.type}:</strong> {log.data} <br />
                    <small>{log.timestamp}</small>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
