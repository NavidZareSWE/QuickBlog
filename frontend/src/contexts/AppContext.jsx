import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

/**
 * Sets the default base URL for Axios requests to the
 * VITE_BACKEND_URL from environment variables.
 */

axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AppContext = createContext();
export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [input, setInput] = useState("");

  const fetchBlogs = async () => {
    try {
      const { data } = await axios.get("/api/blog/all");
      data.success ? setBlogs(data.blogs) : toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchBlogs();
    const token = localStorage.getItem(`token`);
    if (token) {
      setToken(token);
      /**
       * This line sets the common Authorization header for all Axios
       * requests. It uses the provided token to ensure that requests
       * are authenticated, allowing access to protected resources
       * on the server.
       */
      axios.defaults.headers.common["Authorization"] = `${token}`;
    }
  }, []);

  const value = {
    axios,
    navigate,
    token,
    setToken,
    blogs,
    setBlogs,
    input,
    setInput,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
