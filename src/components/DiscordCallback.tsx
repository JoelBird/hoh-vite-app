import React, { useEffect } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const DiscordCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`/callback${location.search}`);
        localStorage.setItem("user", JSON.stringify(response.data));
        navigate("/"); // Redirect to the home page after setting the user
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    fetchUser();
  }, [location.search, navigate]);

  return <div>Loading...</div>;
};

export default DiscordCallback;
