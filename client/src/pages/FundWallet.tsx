import { Elements } from "@stripe/react-stripe-js";
import {
  loadStripe,
  StripeElementsOptionsClientSecret,
} from "@stripe/stripe-js";
import { useState, useEffect } from "react";
import CheckoutForm from "../components/CheckoutForm";
import axios from "axios";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PK);

function FundWallet() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    axios
      .post(
        "/api/payments/create-payment-intent",
        { amount: 40000 },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("tid"),
          },
        }
      )
      .then((res) => {
        console.log(res.data);
        setClientSecret(res.data.data.clientSecret);
      });
  }, []);

  const options = {
    clientSecret,
    appearance: {
      theme: "stripe",
    },
  } as StripeElementsOptionsClientSecret;

  return (
    <div className="py-20 2xl:py-40 bg-gray-800 min-h-screen">
      <div className="max-w-[500px] mx-auto bg-white rounded-lg px-4 py-6 text-white">
        {clientSecret && (
          <Elements options={options} stripe={stripePromise}>
            <CheckoutForm />
          </Elements>
        )}
      </div>
    </div>
  );
}
export default FundWallet;
