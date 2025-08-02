import {BrowserRouter, Routes, Route} from 'react-router-dom';
import { Menu } from './pages/Menu';
import { CheckoutPage } from './pages/CheckoutPage';
import { ConfirmationPage } from './pages/ConfirmationPage';

function App(){
  return(
    <>
      <BrowserRouter>
        <Routes>
          <Route index element={<Menu/>}/>
          <Route path='/menu' element={<Menu/>}/>
          <Route path='/checkout' element={<CheckoutPage/>}/>{/*  checkout */}
          <Route path='/confirm' element={<ConfirmationPage/>}/> 
        </Routes>
      </BrowserRouter>
    </>
  )
}
  

export default App;