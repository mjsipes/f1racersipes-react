import "./App.css";
import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/login";
import Signup from "./pages/signup";
import Initial from "./pages/initial";
import Pregaming from "./pages/pregaming";
import StartGame from "./pages/startgame";
import JoinGame from "./pages/joingame";
import GamingPage from "./pages/gamingpage";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Initial />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/pregaming" element={<Pregaming />} />
        <Route path="/startgame" element={<StartGame />} />
        <Route path="/joingame" element={<JoinGame />} />
        <Route path="/game" element={<GamingPage />} />
      </Routes>
    </div>
  );
}

export default App;
