import { Link } from "react-router-dom";
import { useAppStore } from "../store";

function HomePage() {
  const user = useAppStore((store) => store.user);
  return (
    <div className="text-center py-10">
      <h1 className="text-3xl">Stripe sample</h1>
      <span className="text-blue-500 underline">
        {user ? (
          <Link to="/dashboard">Dashboard</Link>
        ) : (
          <Link to="/signin">Signin</Link>
        )}
      </span>
    </div>
  );
}
export default HomePage;
