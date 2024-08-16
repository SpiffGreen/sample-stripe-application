import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAppStore } from "../store";
import axios from "axios";
import { useEffect, useState } from "react";

function PaymentProgressPage() {
  const navigate = useNavigate();
  const { setUser } = useAppStore((store) => store);
  const [update, setUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  let [searchParams] = useSearchParams();

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    axios
      .get(
        "/api/payments/verify-payment-intent/" +
          searchParams.get("payment_intent"),
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("tid"),
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setUpdate(res.data.data.verified);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchParams]);

  return (
    <div className="py-20 2xl:py-40 bg-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto pt-10">
        <div className="max-w-[500px] mx-auto bg-gray-600 rounded-lg px-4 py-6 text-white">
          <h3 className="mb-5 text-2xl text-white font-bold font-heading">
            Transaction update
          </h3>
          <div>
            {loading ? "Loading..." : <>{update ? "Successful" : "Failed"}</>}
          </div>

          <div className="actions mt-3 flex flex-wrap gap-3">
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
export default PaymentProgressPage;
