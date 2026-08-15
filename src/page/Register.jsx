import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {

  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registration Successful");
      navigate("/login");
    } else {
      alert(data.message);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-green-100">

      <form
        onSubmit={handleRegister}
        className="bg-white p-8 rounded-xl shadow-lg w-96"
      >

        <h1 className="text-3xl font-bold text-center mb-6">
          Register
        </h1>

        <input
          type="text"
          name="name"
          placeholder="Enter Name"
          className="w-full border p-3 mb-4 rounded"
          onChange={handleChange}
        />

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
          Register
        </button>

        <p className="text-center mt-4">
          Already have account?
          <Link className="text-blue-500" to="/login">
            Login
          </Link>
        </p>

      </form>

    </div>
  );
};

export default Register;