import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Patients() {

  const patients = [
    {
      id: 1,
      name: "Rahul Sharma",
      age: 35,
      gender: "Male",
      disease: "Malaria"
    },
    {
      id: 2,
      name: "Sneha Patil",
      age: 28,
      gender: "Female",
      disease: "Dengue"
    },
    {
      id: 3,
      name: "Amit Kumar",
      age: 42,
      gender: "Male",
      disease: "Typhoid"
    }
  ];

  return (
    <>
      <Sidebar />

      <div className="dashboard-container">

        <Navbar />

        <div className="dashboard-content">

          <h1>Patient Management</h1>

          <div className="patient-form">

            <h2>Add New Patient</h2>

            <div className="form-grid">

              <input type="text" placeholder="Patient Name" />

              <input type="number" placeholder="Age" />

              <select>
                <option>Male</option>
                <option>Female</option>
              </select>

              <input type="text" placeholder="Disease" />

              <input type="text" placeholder="Village" />

              <input type="text" placeholder="Mobile Number" />

            </div>

            <button className="save-btn">
              Save Patient
            </button>

          </div>

          <div className="patient-table">

            <h2>Patient List</h2>

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Disease</th>
                </tr>

              </thead>

              <tbody>

                {patients.map((patient) => (

                  <tr key={patient.id}>

                    <td>{patient.id}</td>
                    <td>{patient.name}</td>
                    <td>{patient.age}</td>
                    <td>{patient.gender}</td>
                    <td>{patient.disease}</td>

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

export default Patients;