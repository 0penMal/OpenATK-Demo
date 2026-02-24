import {Routes, Route, Navigate} from "react-router-dom";
import ChatPage from "./pages/ChatPage";
import LearningPage from "./pages/LearningPage";
import ThankYouPage from "./pages/ThankYouPage";
import WelcomePage from "./pages/WelcomePage";

export default function App(){
  return(
    <Routes>
      <Route path = "/" element ={<WelcomePage/>} />
      <Route path = "/learning" element ={<LearningPage/>} />
      <Route path = "/challenge" element ={<ChatPage/>} />
      <Route path = "/thank-you" element ={<ThankYouPage/>} />
      <Route path = "*" element ={<Navigate to = "/" replace/>} />
    </Routes>
  )
}
