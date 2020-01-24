import React from "react";
import { Toolbar, AppBar, Grid } from "@material-ui/core";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import styled from "styled-components";

export default function Header() {
  const NavLink = styled.span`
    margin: 0.5em;
    color: white;
    :hover {
      color: black;
    }
  `;

  const Title = styled.h2`
    color: white;
  `;

  return (
    <AppBar position="fixed">
      <Toolbar>
        <Grid item xs={6}>
          <Link style={{ textDecoration: "none" }} to="/">
            <Title>Bank Of WEC</Title>
          </Link>
        </Grid>
        <Grid item xs={6}>
          <nav>
            <Link style={{ textDecoration: "none" }} to="/">
              <NavLink>Home</NavLink>
            </Link>
            <Link style={{ textDecoration: "none" }} to="login">
              <NavLink>Login</NavLink>
            </Link>
            {/* <Link
              onClick={() => {
                localStorage.removeItem("guugle-login-token");
              }}
              style={{ textDecoration: "none" }}
              to="login"
            >
              <NavLink>Logout</NavLink>
            </Link> */}
          </nav>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
