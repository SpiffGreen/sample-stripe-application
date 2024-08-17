import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import axios from "axios";
import { useState } from "react";

function DashboardPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const { setUser, user } = useAppStore((store) => store);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const setupStripeAccount = async () => {
    if (!file) {
      alert("Please upload a file.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("idDocument", file);

      const response = await axios.post(
        "/api/payments/setup-payout",
        formData,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("tid"),
          },
        }
      );
      if (response.status.toString().startsWith("2")) {
        // Set user
        console.log(response.data);
      } else {
        console.log(response);
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
            Profile
          </h3>
          <div>
            <p>{user?.name}</p>
            <p>{user?.email}</p>
            <p>
              Balance: $
              {(user?.balance ? user.balance / 100 : 0).toLocaleString()}
            </p>

            <div className="actions mt-3 flex flex-wrap gap-3">
              <Link
                to="/dashboard/fund-wallet"
                className="bg-green-500 rounded px-3 py-1 text-nowrap"
              >
                Fund Wallet
              </Link>
              <button className="bg-red-500 rounded px-3 py-1 text-nowrap">
                Request Withdrawal
              </button>
              <Link
                to="/dashboard/history"
                className="bg-blue-500 rounded px-3 py-1 text-nowrap"
              >
                Transaction history
              </Link>
            </div>
            <div className="actions mt-3 flex flex-wrap gap-3">
              <Link
                to="/dashboard/buy-product"
                className="bg-black text-white rounded px-3 py-1 text-nowrap"
              >
                Buy product
              </Link>
            </div>
          </div>
        </div>
        <br />
        <div className="max-w-[500px] mx-auto bg-gray-600 rounded-lg px-4 py-6 text-white">
          {user?.stripeConnectedAccount ? (
            <div>Account connected</div>
          ) : (
            <>
              <h3 className="mb-5 text-2xl text-white font-bold font-heading">
                Payout documents
              </h3>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="actions mt-3 flex gap-3">
                  <button
                    onClick={setupStripeAccount}
                    className="bg-gray-900 rounded px-4 py-1"
                  >
                    Update account
                  </button>
                </div>
              </div>
            </>
          )}
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
export default DashboardPage;
