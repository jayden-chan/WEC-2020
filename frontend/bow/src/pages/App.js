import React from "react";
import "../App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "../pages/Login";
import Header from "../components/Header";
import Home from "../pages/Home";
import Investments from "../pages/Investments";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Route exact path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/investments" component={Investments} />
      </Router>
    </div>
  );
}

export default App;
