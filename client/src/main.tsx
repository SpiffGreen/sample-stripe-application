import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SigninPage from "./pages/SigninPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import FundWallet from "./components/FundWallet";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardHistory from "./pages/DashboardHistory";
import PaymentProgressPage from "./pages/PaymentProgressPage";
import DashboardBuyProduct from "./pages/DashboardBuyProduct";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <AuthLayout noRedirect={false}>
        <HomePage />
      </AuthLayout>
    ),
  },
  {
    path: "signin",
    element: (
      <AuthLayout>
        <SigninPage />
      </AuthLayout>
    ),
  },
  {
    path: "signup",
    element: (
      <AuthLayout>
        <SignupPage />
      </AuthLayout>
    ),
  },

  {
    path: "dashboard",
    element: (
      <DashboardLayout>
        <DashboardPage />
      </DashboardLayout>
    ),
  },
  {
    path: "dashboard/buy-product",
    element: (
      <DashboardLayout>
        <DashboardBuyProduct />
      </DashboardLayout>
    ),
  },
  {
    path: "dashboard/fund-wallet",
    element: (
      <DashboardLayout>
        <FundWallet />
      </DashboardLayout>
    ),
  },
  {
    path: "dashboard/history",
    element: (
      <DashboardLayout>
        <DashboardHistory />
      </DashboardLayout>
    ),
  },
  {
    path: "dashboard/transaction-update",
    element: (
      <DashboardLayout>
        <PaymentProgressPage />
      </DashboardLayout>
    ),
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
