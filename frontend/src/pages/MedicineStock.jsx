import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function MedicineStock() {

  const medicines = [
    {
      id: 1,
      name: "Paracetamol",
      stock: 250,
      expiry: "12-2027",
      status: "Available"
    },
    {
      id: 2,
      name: "Amoxicillin",
      stock: 35,
      expiry: "05-2027",
      status: "Low Stock"
    },
    {
      id: 3,
      name: "ORS",
      stock: 180,
      expiry: "10-2028",
      status: "Available"
    },
    {
      id: 4,
      name: "Insulin",
      stock: 12,
      expiry: "02-2027",
      status: "Critical"
    }
  ];

  return (
    <>
      <Sidebar />

      <div className="dashboard-container">

        <Navbar />

        <div className="dashboard-content">

          <div className="page-header">

            <h1>Medicine Stock</h1>

            <button className="add-btn">
              + Add Medicine
            </button>

          </div>

          <input
            className="medicine-search"
            type="text"
            placeholder="Search Medicine..."
          />

          <div className="medicine-table">

            <table>

              <thead>

                <tr>

                  <th>ID</th>
                  <th>Medicine</th>
                  <th>Available Stock</th>
                  <th>Expiry Date</th>
                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {medicines.map((medicine) => (

                  <tr key={medicine.id}>

                    <td>{medicine.id}</td>

                    <td>{medicine.name}</td>

                    <td>{medicine.stock}</td>

                    <td>{medicine.expiry}</td>

                    <td>

                      <span
                        className={
                          medicine.status === "Available"
                            ? "available"
                            : medicine.status === "Low Stock"
                            ? "low-stock"
                            : "critical-stock"
                        }
                      >
                        {medicine.status}
                      </span>

                    </td>

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

export default MedicineStock;