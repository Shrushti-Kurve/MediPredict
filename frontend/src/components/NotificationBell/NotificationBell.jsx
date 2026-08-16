import React, { useEffect, useState } from "react";
import { FaBell } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { getLoggedInUser } from "../../services/localStorageService";
import "./NotificationBell.css";

const NotificationBell = () => {

  const user = getLoggedInUser();
  const navigate = useNavigate();

  const [count, setCount] = useState(0);

  const getAlertPage = () => {

    if (!user) return "/";

    if (user.role === "doctor") {
      return "/doctor/alerts";
    }

    if (user.role === "hospitalStaff") {
      return "/hospital/alerts";
    }

    if (user.role === "pharmacist") {
      return "/pharmacist/alerts";
    }

    return "/alerts";
  };

  const loadCount = async () => {

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/alerts/"
      );

      if (!response.ok) return;

      const data = await response.json();

      const important = data.filter((alert) => {

        const severity = String(
          alert.Severity ||
          alert.severity ||
          ""
        ).toUpperCase();

        return (
          severity === "HIGH" ||
          severity === "MEDIUM"
        );

      });

      setCount(important.length);

    } catch (error) {

      console.error(
        "Notification count error:",
        error
      );

    }

  };

  useEffect(() => {

    if (!user) return;

    loadCount();

    const interval = setInterval(
      loadCount,
      5000
    );

    return () => clearInterval(interval);

  }, [user?.role]);

  if (!user) return null;

  return (

    <button
      className="home-notification-button"
      onClick={() => navigate(getAlertPage())}
      title="View alerts"
    >

      <FaBell />

      {count > 0 && (

        <span className="home-notification-count">
          {count > 99 ? "99+" : count}
        </span>

      )}

    </button>

  );

};

export default NotificationBell;