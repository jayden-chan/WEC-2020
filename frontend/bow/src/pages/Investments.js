import React, { Component } from "react";
import Layout from "../components/Layout";
import Typography from "@material-ui/core/Typography";
import { renderTable } from "./Home";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";

import moment from "moment";

export default class Investments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        stocks: [
          { name: "macys", count: 5, price: 5 },
          { name: "costco", count: 67, price: 3 }
        ],
        investments: [
          {
            date: "2020-01-04T06:00:00.000Z",
            type: "Deposit",
            amount: 60,
            title: "Misc"
          },
          {
            date: "2020-01-04T06:00:00.000Z",
            type: "Withdrawal",
            amount: 50,
            title: "Misc"
          }
        ]
      },
      date: moment()
    };
  }

  componentDidMount = async () => {
    if (!localStorage.getItem("bow-login-token")) {
      this.props.history.push("/login");
      return;
    }

    const link = "http://localhost:3000/date";
    // fetch(link, {
    //   method: "POST",
    //   headers: {
    //     Authorization: localStorage.getItem("bow-login-token")
    //   },
    //   body: {
    //     date: this.state.date.format("YYYY-MM-DD")
    //   }
    // }).then(res => {
    //   if (res.status === 200) {
    //     res.json().then(json => this.setState({ data: json }));
    //   } else {
    //     res.text().then(text => alert(text));
    //   }
    // });
  };

  dayAdd() {
    this.setState(state => ({
      date: state.date.add(1, "days")
    }));
    const link = "http://localhost:3000/date";

    fetch(link, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("bow-login-token")
      },
      body: {
        date: this.state.date.format("YYYY-MM-DD")
      }
    }).then(res => {
      if (res.status === 200) {
        res.json().then(json => this.setState({ data: json }));
      } else {
        res.text().then(text => alert(text));
      }
    });
  }
  daySubtract() {
    this.setState(state => ({
      date: state.date.subtract(1, "days")
    }));
    const link = "http://localhost:3000/date";

    fetch(link, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("bow-login-token")
      },
      body: {
        date: this.state.date.format("YYYY-MM-DD")
      }
    }).then(res => {
      if (res.status === 200) {
        res.json().then(json => this.setState({ data: json }));
      } else {
        res.text().then(text => alert(text));
      }
    });
  }

  stockRow(name, price, count) {
    return (
      <div
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between"
        }}
      >
        <div
          style={{
            border: "1px solid black",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            style={{
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            {name}
          </div>
        </div>
        <div>
          <Paper>${price}</Paper>
        </div>
        <div>
          <Paper>{count}</Paper>
        </div>
        <div>
          <Paper>${price * count}</Paper>
        </div>
      </div>
    );
  }

  render() {
    console.log("data", this.state.data.stocks);
    return (
      <Layout>
        <Typography variant="h4" align="left">
          Investments
        </Typography>
        <Typography variant="h5" align="left">
          Date: {this.state.date.format("dddd, MMMM Do YYYY")}
        </Typography>
        <ButtonGroup
          color="primary"
          style={{ float: "left" }}
          aria-label="outlined primary button group"
        >
          <Button onClick={() => this.dayAdd()}>+</Button>
          <Button disabled onClick={() => this.daySubtract()}>
            -
          </Button>
        </ButtonGroup>
        <br></br>
        <br></br>
        <br></br>
        <br></br>
        {this.state.data ? (
          <Grid container spacing={1}>
            {this.state.data.stocks.map(el => (
              <Grid container item xs={12} spacing={1}>
                {this.stockRow(el.name, el.price, el.count)}
              </Grid>
            ))}
            <Grid container item xs={12} spacing={1}>
              <Grid item xs={3}>
                <Paper></Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper></Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper></Paper>
              </Grid>
              <Grid item xs={3}>
                <Paper>hello</Paper>
              </Grid>
            </Grid>
          </Grid>
        ) : (
          <CircularProgress color="green"></CircularProgress>
        )}

        <Typography variant="h5" align="left">
          Current Portfolio Value: $100,000,000
        </Typography>
        <Typography variant="h5" align="left">
          Transaction History
        </Typography>
        {renderTable(this.state.data, "investments")}
      </Layout>
    );
  }
}
