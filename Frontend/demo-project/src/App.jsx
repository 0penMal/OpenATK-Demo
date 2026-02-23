import {Routes, Route, Navigate} from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import ThankYouPage from "./pages/ThankYouPage";

export default function App(){
  return(
    <Routes>
      <Route path = "/" element ={<ChatPage/>} />
      <Route path = "/thank-you" element ={<ThankYouPage/>} />
      <Route path = "*" element ={<Navigate to = "/" replace/>} />
    </Routes>
  )
}