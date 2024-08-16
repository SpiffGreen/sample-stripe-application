import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../store";

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const setUser = useAppStore((store) => store.setUser);
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/users/profile", {
        headers: {
          Authorization: "Bearer " + localStorage.getItem("tid"),
        },
      })
      .then((res) => {
        if (!res.status.toString().startsWith("2")) {
          navigate("/signin");
        } else {
          // Set user
          setUser(res.data.data);
        }
      })
      .catch((err) => {
        if (err.response.status === 401) {
          navigate("/signin");
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading...</div>;

  return <>{children}</>;
}
export default DashboardLayout;
