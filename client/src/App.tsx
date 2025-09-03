import React from 'react'
import { BrowserRouter, Routes, Route} from "react-router-dom";
import Home from './pages/Home';
import Navbar from './common-components/Navbar';


const App: React.FC = () => {
  return (
    <div className="App box-border max-w-[2160px] flex justify-center mx-auto min-w-[360px]">
      <BrowserRouter>
      <Navbar/>
        <main>
          <Routes>
            <Route path='/' element={<Home/>} />
          </Routes>
        </main>
      </BrowserRouter>
    </div>
  )
}

export default App