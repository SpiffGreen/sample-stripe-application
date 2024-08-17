import { Link, useNavigate } from "react-router-dom";
import { useAppStore } from "../store";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";

const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PK);

function DashboardBuyProduct() {
  const navigate = useNavigate();
  const { setUser } = useAppStore((store) => store);
  const [products, _setProduct] = useState([
    {
      productId: "23232",
      productName: "Go FullStack with SJG",
      price: 1000,
      description:
        "This beginner-friendly Full-Stack Web Development Course is offered online in blended learning mode, and also in an on-demand self-paced format.",
      quantity: 1,
    },
  ]);

  const makePayment = async () => {
    const body = {
      products,
      successUrl: window.location.origin + "/dashboard",
      cancelUrl: window.location.origin + "/",
    };

    const response = await axios.post(
      "/api/payments/create-checkout-session",
      body,
      {
        headers: { Authorization: "Bearer " + localStorage.getItem("tid") },
      }
    );

    if (response.status !== 200) {
      alert("Sorry an error occured");
      return;
    }
    const result = await stripe?.redirectToCheckout({
      sessionId: response.data.data.id,
    });

    if (result?.error) {
      console.log(result);
    }
  };

  return (
    <div className="py-20 2xl:py-40 bg-gray-800 min-h-screen">
      <div className="max-w-6xl mx-auto pt-10">
        <div className="max-w-[500px] mx-auto bg-gray-600 rounded-lg px-4 py-6 text-white">
          <h3 className="mb-5 text-2xl text-white font-bold font-heading">
            Checkout product
          </h3>
          <div>
            <div className="actions mt-3 flex flex-wrap gap-3">
              1 year subscription - $3,999
            </div>
            <div className="actions mt-3 flex flex-wrap gap-3">
              <button
                onClick={makePayment}
                className="bg-black text-white rounded px-3 py-1 text-nowrap"
              >
                Checkout
              </button>
            </div>
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
export default DashboardBuyProduct;
