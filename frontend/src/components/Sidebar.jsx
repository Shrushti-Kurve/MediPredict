import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
function Sidebar() {

  const location = useLocation();

  const menuItems = [
    { name: "Dashboard", path: "/dashboard", icon: "🏠" },
    { name: "Patients", path: "/patients", icon: "👨‍⚕️" },
    { name: "Prediction", path: "/predict", icon: "🧠" },
    { name: "Medicine Stock", path: "/medicine", icon: "💊" },
    { name: "Alerts", path: "/alerts", icon: "🚨" },
    { name: "Reports", path: "/reports", icon: "📄" },
    { name: "History", path: "/history", icon: "🕒" }
  ];

  return (
    <div className="sidebar">

      <div className="sidebar-logo">
        <img id="logo-img" src={logo} alt="logo"/>
        {/* 🏥 <span>MediPredict</span> */}
      </div>

      <ul className="sidebar-menu">

        {menuItems.map((item) => (

          <li
            key={item.path}
            className={
              location.pathname === item.path ? "active" : ""
            }
          >

            <Link to={item.path}>

              <span className="icon">{item.icon}</span>

              {item.name}

            </Link>

          </li>

        ))}

      </ul>

    </div>
  );
}

export default Sidebar;