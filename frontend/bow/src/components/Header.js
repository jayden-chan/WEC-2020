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
    <AppBar
      style={{ backgroundColor: "green", padding: "0 4em", width: "100%" }}
      position="fixed"
    >
      <Toolbar>
        <Grid style={{ marginRight: "1em" }}>
          <Link style={{ textDecoration: "none" }} to="/">
            <Title>Bank Of WEC</Title>
          </Link>
        </Grid>
        <Grid>
          <nav>
            <Link style={{ textDecoration: "none" }} to="/">
              <NavLink>Home</NavLink>
            </Link>
            <Link style={{ textDecoration: "none" }} to="login">
              <NavLink>Login</NavLink>
            </Link>
          </nav>
        </Grid>
      </Toolbar>
    </AppBar>
  );
}
