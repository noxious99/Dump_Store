import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authAction } from "./actions/authAction";

function App() {
const dispatch = useDispatch();
  useEffect(()=>
  {
    dispatch(authAction());
  },[dispatch]);

  const user = useSelector((state) => state.auth.userInfo)
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/Register" element={user && user? <Profile/> : <Register />} />
          <Route path="/Login" element={user && user? <Profile/> : <Login />} />
          <Route path="/Profile" element={!user? <Login/> : <Profile />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
