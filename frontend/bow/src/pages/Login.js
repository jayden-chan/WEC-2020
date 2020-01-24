import React, { Component } from "react";
import Layout from "../components/Layout";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Container from "@material-ui/core/Container";

import { ToastContainer, toast } from "react-toastify";

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.state = {
      username: "",
      password: ""
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(event) {
    const target = event.target;
    const value = target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }

  handleSubmit(event) {
    console.log(this.state);
    fetch("http://localhost:3000/login", {
      method: "post",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: this.state.username,
        password: this.state.password
      })
    })
      .then(res => {
        if (res.status === 200) {
          return res.json();
        } else {
          res.text().then(text => toast.error(text));
          return null;
        }
      })
      .then(json => {
        console.log("json:", json);
        if (json !== null) {
          localStorage.setItem("bow-login-token", json.token);
          console.log("token stored");
          this.props.history.push("/");
        }
      })
      .catch(err => {
        console.log(err);
      });

    event.preventDefault();
  }

  render() {
    return (
      <Layout>
        <Container component="main" maxWidth="xs">
          <div>
            <Typography component="h1" variant="h5">
              Login
            </Typography>
            <form noValidate onSubmit={this.handleSubmit}>
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                value={this.state.username}
                onChange={this.handleChange}
                id="username"
                label="Username"
                name="username"
                autoComplete="text"
                autoFocus
                style={{ borderColor: "green", outline: "green" }}
              />
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                value={this.state.password}
                onChange={this.handleChange}
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                style={{ backgroundColor: "green", color: "white" }}
              >
                Submit
              </Button>
            </form>
          </div>
        </Container>
      </Layout>
    );
  }
}
