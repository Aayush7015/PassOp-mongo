import React from 'react'
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const loggedIn = Boolean(sessionStorage.getItem("passopToken"));
  const logout = () => { sessionStorage.removeItem("passopToken"); navigate("/login"); };
  return (
    <nav className='bg-slate-800 text-white'>
        <div className="mycontainer flex 
    justify-between items-center px-4 py-5 h-14">
        <div className='logo font-bold  text-white text-2xl'>
            <span className='text-green-700'>&lt;</span>
            <span>Pass</span><span className='text-green-700'>OP/&gt;</span>

        </div>
    {/* <ul>
        <li className='flex gap-4'>
            <a  classname ='hover:font-bold' href = '/' >Home</a>
             <a classname ='hover:font-bold' href = '#' >About</a>
              <a classname ='hover:font-bold' href = '#' >Contact</a>
        </li>
        </ul> */}
        {loggedIn && <button onClick={logout} className='text-white bg-green-700 rounded-full px-4 py-2 ring-white ring-1'>Logout</button>}
        </div>
    </nav>
  )
}

export default Navbar
