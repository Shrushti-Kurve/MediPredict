function Navbar() {

  return (

    <div className="navbar">

      <div className="navbar-left">

        <h2>Dashboard</h2>

      </div>

      <div className="navbar-right">

        <input
          type="text"
          placeholder="🔍 Search..."
          className="search-box"
        />

        <button className="notification-btn">
          🔔
        </button>

        <div className="profile">

          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
          />

          <div>

            <h4>Admin</h4>

            <p>MediPredict</p>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Navbar;