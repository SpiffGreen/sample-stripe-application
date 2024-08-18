import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import axios from "axios";

function Withdraw() {
  const [amount, setAmount] = useState(0);
  const { user, setUser } = useAppStore((state) => state);
  const navigate = useNavigate();

  const withdraw = async () => {
    try {
      const response = await axios.post(
        "/api/payments/cashout",
        { amount },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("tid"),
          },
        }
      );
      if (response.status.toString().startsWith("2")) {
        // Set user
        console.log(response.data);
        window.location.reload();
      } else {
        console.log(response);
        alert(response.data.message);
      }
    } catch (error: any) {
      alert(
        error.response?.data?.message ||
          "An error occurred while setting up the payout."
      );
      console.log(error);
    }
  };

  return (
    <div className="py-20 2xl:py-40 bg-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto pt-10">
        <div className="max-w-[500px] mx-auto bg-gray-600 rounded-lg px-4 py-6 text-white">
          <h3 className="mb-5 text-2xl text-white font-bold font-heading">
            Withdraw funds
          </h3>
          <p className="mb-2">
            Balance of ${user?.balance?.toLocaleString() ?? 0}
          </p>
          <input
            type="text"
            onChange={(e) =>
              Number.isSafeInteger(Number(e.target.value)) &&
              setAmount(Number(e.target.value))
            }
            className="px-1 bg-transparent rounded border"
          />

          <div className="actions mt-3 flex flex-wrap gap-3">
            <button
              onClick={withdraw}
              className="bg-blue-500 rounded px-3 py-1 text-nowrap"
            >
              Withdraw
            </button>
            <Link
              to="/dashboard"
              className="bg-blue-500 rounded px-3 py-1 text-nowrap"
            >
              Back
            </Link>
          </div>
        </div>

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
export default Withdraw;
