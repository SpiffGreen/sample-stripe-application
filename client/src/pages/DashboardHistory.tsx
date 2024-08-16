import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import axios from "axios";
import { useState, useEffect } from "react";

function DashboardHistory() {
  const navigate = useNavigate();
  const { setUser } = useAppStore((store) => store);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/payments/transactions", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tid"),
        },
      })
      .then((res) => {
        if (res.status.toString().startsWith("2")) {
          // Set user
          setLoading(false);
          setHistory(res.data.data);
          console.log(res.data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="py-20 2xl:py-40 bg-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto pt-10">
        <div className="max-w-[500px] mx-auto bg-gray-600 rounded-lg px-4 py-6 text-white">
          <h3 className="mb-5 text-2xl text-white font-bold font-heading">
            Transaction history
          </h3>

          <div className="actions mt-3 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="bg-blue-500 rounded px-3 py-1 text-nowrap"
            >
              Back
            </Link>
          </div>
        </div>

        <br />
        <div className="px-4 text-white">
          {history.length ? (
            <div className="bg-gray-900 rounded px-4 py-1">Update account</div>
          ) : (
            <div className="text-center">
              {history.map((transaction) => {
                return (
                  <div>
                    {transaction.summary} - {transaction.status} - $
                    {transaction.amount}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <br />

        <Link
          to="/"
          className="text-center text-white underline block mt-4"
          onClick={() => {
            localStorage.removeItem("tid");
            setUser(null);
            navigate("/signin");
          }}
        >
          Logout
        </Link>
      </div>
    </div>
  );
}
export default DashboardHistory;
