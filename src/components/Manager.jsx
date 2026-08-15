import React  from 'react'
import { useRef,useState,useEffect } from 'react'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { v4 as uuidv4 } from 'uuid';
const Manager = () => {
    const ref = useRef()
    const passwordRef = useRef()
    const [form, setform] = useState({site:"", username: "",password:""})
    const [passwordArray, setPasswordArray] = useState([])

     const  getpassword = async () => {
        let req = await fetch("http://localhost:3000")
       let passwords = await req.json();
        console.log( passwords);
          setPasswordArray(passwords)
     }
     useEffect(() => {
       getpassword()
       let passwords = localStorage.getItem("password");
       if(passwords){
      console.log("passwords from local storage", passwords);
          setPasswordArray(JSON.parse(passwords))
     }
     }, [])
     const copytext =(text) =>{
        //alert("copied to clipboard" + text)
         navigator.clipboard.writeText(text);
        toast.success("copied to clipboard", {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
 progress: undefined,
});
       
     };
    const showPassword = () => {
        passwordRef.current.type = "text"
        if(ref.current.src.includes("src/assets/eyepassword.jpg")){
            ref.current.src = "src/assets/eyecross.jpg"
            passwordRef.current.type = "password"
        }
        else{
            passwordRef.current.type = "text"
           ref.current.src =  "src/assets/eyepassword.jpg" 
        }
    };
    const savePassword = () => {
  if (form.site.length > 3 && form.username.length > 3 && form.password.length > 3) {
    const newarray = [...passwordArray, { ...form, id: uuidv4() }];
    setPasswordArray(newarray);
    localStorage.setItem("passwords", JSON.stringify(newarray));
    console.log(newarray);
    setform({ site: "", username: "", password: "" });

    toast.success("Password saved", {
      position: "top-right",
      autoClose: 1000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  } else {
    toast.error("Error: Password not saved. All fields must be at least 4 characters long.", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};
const deletePassword = (id) => {
        toast.success("password deleted", {
  position: "bottom-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
 progress: undefined,
});
        console.log("Deleting password with id " , id)
        let c= confirm("Do you really want to delete this password?")
        if(c){
           const newarray = (passwordArray.filter(item=>item.id!==id))
           setPasswordArray(newarray);
            localStorage.setItem("passwords", JSON.stringify(newarray)); 
        }
      //  console.log(newarray)
 }
  const editPassword = (id) => {
        console.log("edit password with id " , id)
        setform(passwordArray.filter(i =>i.id === id)[0])
       const newarray = (passwordArray.filter(item=>item.id!==id))
        setPasswordArray(newarray);
      //  localStorage.setItem("passwords", JSON.stringify(newarray));
      //  console.log(newarray)
 }
    const handlechange = (e)=>{
       setform({...form, [e.target.name]:e.target.value})
    }
    return (
        <>
        <ToastContainer
       position="top-right"
        autoClose= {5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        transition="Bounce"
      /> 
      <ToastContainer />
            <div className="absolute top-0 z-[-2] h-screen w-screen rotate-180 transform bg-green-100 bg-[radial-gradient(60%_120%_at_50%_50%,hsla(0,0%,100%,0)_0,rgba(252,205,238,.5)_100%)]">
            </div>
            <div className='p-2 md:px-0 md:mycontainer'>
                <h1 className=' text-4xl text font-bold text-center'><span className='text-green-700'>&lt;</span>
                    <span>Pass</span><span className='text-green-700'>OP/&gt;</span></h1>
                <p className='text-green-900 text-lg text-center'>Your own password Manager</p>
                <div className='text-black flex flex-col p-2 gap-8 items-center'>
                    <input  value = {form.site}  onChange={handlechange} placeholder='Enter website url' className='rounded-full border border-green-500 w-full p-4 py-1' type="text" name="site" id="site" />
                    <div className='flex w-full justify-between gap-4'>
                        <input value = {form.username} onChange={handlechange}   placeholder='Enter username' className=' flex-[0.8] rounded-full border border-green-500 w-full p-4 py-1' type="text" name="username" id="username" />
                        <div className="flex-[0.2] relative">
                            <input  ref ={passwordRef} value = {form.password} onChange={handlechange}  placeholder='Enter Password' className='rounded-full border border-green-500  p-4 py-1 pr-24' type="password" name="password" id="password" />
                             <span className='absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer' onClick = {showPassword}>
                                 <img ref = {ref} className=' w-5 h-4' src="src/assets/eyepassword.jpg" alt="eyepassword" />
                             </span>     
                        </div>
                    </div>
                    <button onClick = {savePassword} className='flex items-center justify-center bg-green-400 hover:bg-green-300 rounded-full px-4 py-2 w-fit gap-2 border border-green-900'>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Save password</button>
                </div>
 
     <div className="passwords">
        <h2 className='font-bold text-2xl py-4'>Your passwords</h2>
         {passwordArray.length === 0 &&<div> No password to show </div>}
        {passwordArray.length != 0 &&<table className='table-auto w-full rounded-md overflow-hidden mb-10'> 
       
  <thead className='bg-green-800 text-white'>
    <tr>
      <th className = 'py-2'>site</th>
      <th className = 'py-2'>username</th>
      <th className = 'py-2'>password</th>
       <th className = 'py-2'>Actions</th>
    </tr>
  </thead >
  <tbody className = 'bg-green-100'>
    {passwordArray.map((item,index) =>{
        return <tr key ={index}>
     {/* <td className = 'flex items-center justify-center py-2 border border-white text-center w-32'><a href ={item.site} target ='_blank'>{item.site}</a>

      <img className='w-5 h-5'   src = "src/assets/copy-icon.svg" alt=""></img>
      </td>*/}
      <td className='py-2 border border-white text-center w-32'>
  <div className="flex items-center justify-center gap-2">
    <a href={item.site} target='_blank' rel="noopener noreferrer" className="break-all">{item.site}</a>
    <img className='w-5 h-5 cursor-pointer' src="src/assets/copy-icon.svg" alt="copy"  onClick = {() => copytext(item.site)}/>
  </div>
</td>
      <td className = 'py-2 border border-white text-center w-32'> 
        <div className="flex items-center justify-center gap-2">
    <a href={item.username} target='_blank' rel="noopener noreferrer" className="break-all">{item.username}</a>
    <img className='w-5 h-5 cursor-pointer' src="src/assets/copy-icon.svg" alt="copy" onClick = {() => copytext(item.username)} />
  </div></td>
      <td className = 'py-2 border border-white text-center w-32'>
         <div className="flex items-center justify-center gap-2">
    <a href={item.password} target='_blank' rel="noopener noreferrer" className="break-all">{item.password}</a>
    <img className='w-5 h-5 cursor-pointer' src="src/assets/copy-icon.svg" alt="copy" onClick = {() => copytext(item.password)} />
  </div></td>
  <td className="w-32 border border-white py-2 text-center">
  <div className="flex justify-center space-x-2">
    <span
      className="cursor-pointer"
      onClick={() => deletePassword(item.id)}
    >
      <img className="w-5 h-5" src="src/assets/delete-icon.svg" alt="" />
    </span>
    <span
      className="cursor-pointer"
      onClick={() => editPassword(item.id)}
    >
      <img className="w-5 h-5" src="src/assets/edit-pen-icon.svg" alt="" />
    </span>
  </div>
</td>

    </tr>
})}
  </tbody>
</table> }
     </div>
     
            </div>
        </>
    )
}

export default Manager
