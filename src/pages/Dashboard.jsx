import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          navigate("/");
          return;
        }

        const response = await fetch(
          "http://localhost:8000/users/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch user profile");
        }

        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <h2 className="text-xl font-semibold">
          Loading...
        </h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-red-500 text-xl">
          {error}
        </h2>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
        >
          Return to Login
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Navbar */}
      <nav className="bg-white shadow px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">
          Consultation App
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
        >
          Logout
        </button>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-3xl font-bold mb-2">
          Welcome, {user.name}
        </h2>

        <p className="text-gray-600 mb-8">
          You are logged in successfully.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Name */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg">
              Name
            </h3>

            <p className="mt-2 text-gray-600">
              {user.name}
            </p>
          </div>

          {/* Email */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg">
              Email
            </h3>

            <p className="mt-2 text-gray-600">
              {user.email}
            </p>
          </div>

          {/* Role */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="font-semibold text-lg">
              Role
            </h3>

            <p className="mt-2 text-gray-600 capitalize">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;