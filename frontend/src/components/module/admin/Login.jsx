import React, { useState } from "react";
import { useAppContext } from "../../../hooks/useAppContext";
import toast from "react-hot-toast";

const Login = () => {
  const { axios, setToken } = useAppContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post("/api/admin/login", {
        email,
        password,
      });
      if (data.success) {
        const retrieved_token = data.token;
        setToken(retrieved_token);
        localStorage.setItem("token", retrieved_token);
        axios.defaults.headers.common["Authorization"] = `${retrieved_token}`;
        toast.success("Logged-in Successfully!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-sm p-6 max-md:m-6 border border-primary/30 shadow-xl shadow-primary/15 rounded-lg">
        <div className="flex flex-col items-center justify-center">
          <div className="w-full py-6 text-center">
            <h1 className="text-3xl font-bold">
              <span className="text-primary">Admin</span> Login
            </h1>
            <p className="font-light">
              Enter your credentials to access the admin panel
            </p>
          </div>
          <form
            className="w-full mt-6 sm:max-w-md text-gray-600"
            onSubmit={handleSubmit}
          >
            <div className="flex flex-col">
              <label htmlFor="email">Email</label>
              <input
                onChange={(e) => setEmail(e.target.value)}
                value={email}
                className="border-b-2 border-gray-300 p-2 outline-none mb-6"
                type="email"
                name="email"
                id="email"
                required
                placeholder="Your Email Address"
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="password">Password</label>
              <input
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className="border-b-2 border-gray-300 p-2 outline-none mb-6"
                type="password"
                name="password"
                id="password"
                required
                placeholder="Enter your password"
              />
            </div>
            <button
              className="w-full py-3 font-medium bg-primary text-white rounded cursor-pointer hover:bg-primary/90 transition-all"
              type="submit"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
