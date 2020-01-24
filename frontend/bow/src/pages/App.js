import React from "react";
import "../App.css";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Login from "../pages/Login";
import Header from "../components/Header";
import Home from "../pages/Home";

function App() {
  return (
    <div className="App">
      <Router>
        <Header />
        <Route exact path="/" component={Home} />
        <Route path="/login" component={Login} />
      </Router>
    </div>
  );
}

export default App;
