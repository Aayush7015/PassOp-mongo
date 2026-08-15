import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {

      localStorage.setItem("token", data.token);

      alert("Login Successful");

      navigate("/");

    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-green-100">

      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >

        <h1 className="text-3xl font-bold text-center mb-6">
          Login
        </h1>

        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

        <input
          type="password"
          name="password"
          placeholder="Enter Password"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

        <button className="bg-green-600 text-white w-full py-3 rounded">
          Login
        </button>

        <p className="text-center mt-4">
          Don't have account?
          <Link className="text-blue-500" to="/register">
            Register
          </Link>
        </p>

      </form>

    </div>
  );
};

export default Login;