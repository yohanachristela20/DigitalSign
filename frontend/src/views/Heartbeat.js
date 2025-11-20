import { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import axios from "axios";


let inactivityTimer = null;
const SESSION_TIMEOUT = 5 * 60 * 1000; // 5 minutes in ms
const HEARTBEAT_INTERVAL = 1 * 60 * 1000; //1 minute in ms

const sendHeartbeat = () => {
  const token = localStorage.getItem("token");
  if (!token) return;

  axios
    .post(
      "http://localhost:5000/heartbeat",
      { lastActivityTime: new Date().toISOString() },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    )
    // .then((response) => {
    //   console.log(response.data.message);
    // })
    .catch((error) => {
      console.error("Error sending heartbeat:", error);
      if (error.response?.status === 401) {
        handleSessionExpiry();
      }
    });
};


const heartbeatInterval = setInterval(() => {
  sendHeartbeat();
}, HEARTBEAT_INTERVAL);

export const stopInactivityTimer = () => {
  if (inactivityTimer) {
    clearTimeout(inactivityTimer);
    clearInterval(heartbeatInterval);
    inactivityTimer = null;
  }
};

const startInactivityTimer = () => {
  // Clear existing timer
  stopInactivityTimer();

  // Start new timer
  inactivityTimer = setTimeout(() => {
    handleSessionExpiry();
  }, SESSION_TIMEOUT);
};



export const handleSessionExpiry = () => {
  localStorage.setItem("lastRoute", window.location.pathname);
  stopInactivityTimer();

  axios.post("http://localhost:5000/logout", {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      })
      .then(() => {
          console.log("Sign out successful, session was deleted.");
      })
      .catch(error => {
          console.error("Failed to sign out:", error.response?.data?.message || error.message);
      })

  window.location.replace("/login");
};

const Heartbeat = () => {
  const history = useHistory();
  const location = useLocation();
  let lastActivityTime = Date.now();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const handleUserActivity = () => {
      lastActivityTime = Date.now();
      startInactivityTimer();
    };

    startInactivityTimer();
    
    const events = ["click", "dbclick", "mousemove", "mousedown", "mouseup", "mouseover", "mouseenter", "keydown", "keyup", "keypress", "scroll"];
    events.forEach((event) => {
      window.addEventListener(event, handleUserActivity);
    });

    return () => {
      stopInactivityTimer(); 
      clearInterval(heartbeatInterval);
      events.forEach((event) => {
        window.removeEventListener(event, handleUserActivity);
      });
    };
  }, [history, location]);

  return null;
};



export default Heartbeat;
