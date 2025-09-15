import React from 'react'
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import Navbar from './common-components/Navbar';
import Footer from "@/common-components/Footer.tsx";
import Auth from './pages/Auth';


const App: React.FC = () => {
  return (
    <div className="App box-border max-w-[2160px] flex justify-center min-w-[360px]">
      <BrowserRouter>
      <Navbar/>
        <main>
          <Routes>
            <Route path='/' element={<Home/>} />
            <Route path='/auth' element={<Auth/>} />
          </Routes>
        </main>
      <Footer/>
      </BrowserRouter>
    </div>
  )
}

export default App