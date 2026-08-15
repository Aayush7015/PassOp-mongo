
/*import React from 'react'
import  Navbar from "./components/Navbar"
import Manager from "./components/Manager"
import Footer from "./components/Footer"
import { ToastContainer } from "react-toastify";
const App = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar/>
      <div className='flex-1 bg-green-100 bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]'>
      <Manager />
      </div>
      <Footer />
     <ToastContainer 
      />
    </div>
  )
}

export default App*/
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Manager from "./components/Manager";

import Login from "./pages/Login";
import Register from "./pages/Register";

import ProtectedRoute from "./components/ProtectedRoute";

const App = () => {

  return (

    <BrowserRouter>

      <div className="min-h-screen flex flex-col">

        <Navbar />

        <div className="flex-1">

          <Routes>

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Manager />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

          </Routes>

        </div>

        <Footer />

      </div>

    </BrowserRouter>
  );
};

export default App;