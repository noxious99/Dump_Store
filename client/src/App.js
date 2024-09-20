import "./App.css";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { Home } from "./pages/Home";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Profile } from "./pages/Profile";
import { Allpost } from "./pages/Allpost";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { authAction } from "./actions/authAction";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { Buddies } from "./pages/Buddies";
import { EditProfile } from "./pages/EditProfile";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authAction());
  }, [dispatch]);

  const user = useSelector((state) => state.auth.userInfo);

  return (
    <div className="App">
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/Buddies/:username" element={<Buddies />} />
            <Route path="/EditProfile/:id" element={<EditProfile />} />
            <Route path="/dashboard" element={<Allpost />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Profile" element={!user ? <Login /> : <Profile />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
