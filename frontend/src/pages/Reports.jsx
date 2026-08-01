import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Reports() {

  const activities = [
    {
      id:1,
      activity:"New Patient Added",
      date:"28 July 2026"
    },
    {
      id:2,
      activity:"Medicine Stock Updated",
      date:"28 July 2026"
    },
    {
      id:3,
      activity:"Disease Prediction Completed",
      date:"29 July 2026"
    }
  ];

  return (

    <>
      <Sidebar />

      <div className="dashboard-container">

        <Navbar />

        <div className="dashboard-content">

          <h1>Reports Dashboard</h1>

          <div className="report-cards">

            <div className="report-card">
              <h2>245</h2>
              <p>Total Patients</p>
            </div>

            <div className="report-card">
              <h2>85</h2>
              <p>Medicines</p>
            </div>

            <div className="report-card">
              <h2>192</h2>
              <p>Predictions</p>
            </div>

            <div className="report-card">
              <h2>6</h2>
              <p>Low Stock Alerts</p>
            </div>

          </div>

          <div className="activity-table">

            <h2>Recent Activities</h2>

            <table>

              <thead>

                <tr>

                  <th>ID</th>
                  <th>Activity</th>
                  <th>Date</th>

                </tr>

              </thead>

              <tbody>

                {

                  activities.map((item)=>(

                    <tr key={item.id}>

                      <td>{item.id}</td>

                      <td>{item.activity}</td>

                      <td>{item.date}</td>

                    </tr>

                  ))

                }

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </>

  );

}

export default Reports;