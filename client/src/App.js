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
import { PostDetails } from "./pages/PostDetails";
import { Chat } from "@mui/icons-material";
import { Goal } from "./pages/Goal";
import { GoalDetails } from "./pages/GoalDetails";
import Faq from "./pages/Faq";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authAction());
  }, [dispatch]);

  const user = useSelector((state) => state.auth.userInfo);

  return (
    <div className="App box-border max-w-[1920px] flex justify-center mx-auto min-w-[360px]">
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/Buddies/:username" element={<Buddies />} />
            <Route path="/EditProfile/:id" element={<EditProfile />} />
            <Route path="/GoalDetails/:id" element={<GoalDetails />} />
            <Route path="/dashboard" element={<Allpost />} />
            <Route path="/Register" element={<Register />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/Chat" element={<Chat />} />
            <Route path="/Goal" element={<Goal />} />
            <Route path="/Profile" element={!user ? <Login /> : <Profile />} />
            <Route
              path="/PostDetails/:id"
              element={!user ? <Login /> : <PostDetails />}
            />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </div>
  );
}

export default App;
