import React, { useState } from "react"
import ReactDom from "react-dom/client"
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login.jsx"
import Home from "./pages/Home.jsx"
import Register from "./pages/Register.jsx"
import NotFound from "./pages/NotFound.jsx"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import HashtagPage from "./components/HashtagPage.jsx"
import ProfilePage from "./pages/Profile.jsx"


function Logout(){
  localStorage.clear()
  return <Navigate to="/login" />
}

function RegisterAndLogout(){
  localStorage.clear()
  return<Register />
}


function App() {
  const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/hashtag/:tag" element={<HashtagPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterAndLogout />} />
        <Route path="/profile/:username" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
