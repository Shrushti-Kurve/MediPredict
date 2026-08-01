import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Alerts() {

  const alerts = [

    {
      id:1,
      type:"Medicine Shortage",
      message:"Paracetamol stock is below minimum level.",
      priority:"High"
    },

    {
      id:2,
      type:"Disease Outbreak",
      message:"Malaria cases increased in Village A.",
      priority:"Critical"
    },

    {
      id:3,
      type:"Medicine Expiry",
      message:"ORS will expire next month.",
      priority:"Medium"
    }

  ];

  return (

    <>

      <Sidebar />

      <div className="dashboard-container">

        <Navbar />

        <div className="dashboard-content">

          <h1>Alerts & Notifications</h1>

          <div className="alerts-container">

            {

              alerts.map((alert)=>(

                <div
                  className="alert-card"
                  key={alert.id}
                >

                  <h3>{alert.type}</h3>

                  <p>{alert.message}</p>

                  <span
                    className={
                      alert.priority==="Critical"
                      ? "critical"

                      : alert.priority==="High"
                      ? "high"

                      : "medium"
                    }
                  >

                    {alert.priority}

                  </span>

                </div>

              ))

            }

          </div>

        </div>

      </div>

    </>

  );

}

export default Alerts;