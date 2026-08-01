import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Dashboard() {

  const cards = [
    {
      title: "Total Patients",
      value: 1248,
      icon: "👨‍⚕️",
      color: "#0D6EFD"
    },
    {
      title: "Disease Predictions",
      value: 318,
      icon: "🧠",
      color: "#20C997"
    },
    {
      title: "Medicine Stock",
      value: 845,
      icon: "💊",
      color: "#FFC107"
    },
    {
      title: "Critical Alerts",
      value: 18,
      icon: "🚨",
      color: "#DC3545"
    }
  ];

  const patients = [
    {
      id:1,
      name:"Rahul Sharma",
      disease:"Malaria",
      village:"Wani"
    },
    {
      id:2,
      name:"Sneha Patil",
      disease:"Dengue",
      village:"Maregaon"
    },
    {
      id:3,
      name:"Amit Kumar",
      disease:"Typhoid",
      village:"Pandharkawada"
    },
    {
      id:4,
      name:"Priya Singh",
      disease:"Viral Fever",
      village:"Yavatmal"
    }
  ];

  return (

    <>

      <Sidebar/>

      <div className="dashboard-container">

        <Navbar/>

        <div className="dashboard-content">

          <h1>Healthcare Dashboard</h1>

          <p>
            Welcome to MediPredict Rural Healthcare Analytics Platform
          </p>

          <div className="card-grid">

            {cards.map((card,index)=>(

              <div
                className="dashboard-card"
                key={index}
              >

                <div
                  className="card-icon"
                  style={{background:card.color}}
                >
                  {card.icon}
                </div>

                <h2>{card.value}</h2>

                <p>{card.title}</p>

              </div>

            ))}

          </div>

          <div className="table-section">

            <h2>Recent Patients</h2>

            <table>

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Name</th>

                  <th>Disease</th>

                  <th>Village</th>

                </tr>

              </thead>

              <tbody>

                {patients.map((patient)=>(

                  <tr key={patient.id}>

                    <td>{patient.id}</td>

                    <td>{patient.name}</td>

                    <td>{patient.disease}</td>

                    <td>{patient.village}</td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </>

  );

}

export default Dashboard;