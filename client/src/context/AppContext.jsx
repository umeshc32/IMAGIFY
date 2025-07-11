import axios from "axios";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [credit, setCredit] = useState(null);
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL;

  // Load credits and user info
  const loadCreditsData = async () => {
    try {
      const { data } = await axios.get(`${backendUrl}/api/users/credits`, {
        headers: { token },
      });

      console.log("Credit data:", data); // Optional debug

      if (data.success) {
        setCredit(data.credit);
        setUser(data.user);
      } else {
        toast.error(data.message || "Failed to load user data");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  // Call when token changes
  useEffect(() => {
    if (token) {
      loadCreditsData();
    }
  }, [token]);

  // Generate image
  const generateImage = async (prompt) => {
    try {
      const { data } = await axios.post(
        `${backendUrl}/api/image/generate-image`,
        { prompt },
        { headers: { token } }
      );

      console.log("Image API response:", data); // Optional debug

      if (data.success && data.resultImage) {
        setCredit((prev) => (prev > 0 ? prev - 1 : 0)); // Reduce credit on success
        return data.resultImage;
      } else {
        toast.error(data.message || "Failed to generate image");
        loadCreditsData();

        if (data.creditBalance === 0) {
          navigate("/buy");
        }

        return null;
      }
    } catch (error) {
      console.error("Image generation error:", error);
      toast.error("Error generating image");
      return null;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("token");
    setToken("");
    setUser(null);
  };

  const value = {
    user,
    setUser,
    showLogin,
    setShowLogin,
    backendUrl,
    credit,
    setCredit,
    token,
    setToken,
    loadCreditsData,
    logout,
    generateImage,
  };

  return (
    <AppContext.Provider value={value}>{children}</AppContext.Provider>
  );
};

export default AppContextProvider;
