import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { Menu } from './pages/Menu';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';
import { Notfound } from "./pages/NotFound";

function App(){
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Menu/>}/>
          <Route path='/menu' element={<Menu/>}/>
          <Route path='/checkout' element={<CheckoutPage/>}/>{/*  checkout */}
          <Route path='/confirm' element={<ConfirmationPage/>}/> 
          <Route path="*" element={<Notfound />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
  

export default App;