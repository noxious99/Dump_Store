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
import { MyCollection, MyCollectionWrapper }  from "./pages/MyCollection";
import ExpenseMain from "./components/ExpenseMain";
import NotesMain from "./components/NotesMain";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(authAction());
  }, [dispatch]);

  const user = useSelector((state) => state.auth.userInfo);

  return (
    <div className="App box-border max-w-[2160px] flex justify-center mx-auto min-w-[360px]">
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/buddies/:username" element={<Buddies />} />
            <Route path="/editprofile/:id" element={<EditProfile />} />
            <Route path="/GoalDetails/:id" element={<GoalDetails />} />
            <Route path="/dashboard" element={<Allpost />} />
            <Route path="/collection" element={<MyCollectionWrapper/>} />
            <Route path="/collection/*" element={<MyCollection/>} >
              {/* <Route index element={<ExpenseMain />} /> */}
              <Route path="expense" element={<ExpenseMain/>}/>
              <Route path="notes" element={<NotesMain/>}/>
            </Route>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/Chat" element={<Chat />} />
            <Route path="/Goal" element={<Goal />} />
            <Route path="/profile" element={!user ? <Login /> : <Profile />} />
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
