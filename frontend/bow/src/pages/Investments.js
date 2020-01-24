import React, { Component } from "react";
import Layout from "../components/Layout";
import Typography from "@material-ui/core/Typography";
import { renderTable } from "./Home";
import Button from "@material-ui/core/Button";
import ButtonGroup from "@material-ui/core/ButtonGroup";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import CircularProgress from "@material-ui/core/CircularProgress";
import styled from "styled-components";

import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";

import moment from "moment";

const StyledRow = styled.tr`
  border: 3px solid grey;
  border-radius: 3px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  margin: 10px 0;
`;
const StyledCell = styled.td`
  border-left: 1px solid black;
  border-right: 1px solid black;
  padding: 10px;
  width: 100px;
`;

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

    const link = "http://localhost:3000/update_stocks";
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
        this.props.history.push("/");
      }
    });
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
      <TableRow key={name}>
        <TableCell component="th" scope="row">
          {name}
        </TableCell>
        <TableCell align="right">{price}</TableCell>
        <TableCell align="right">{count}</TableCell>
        <TableCell align="right">{price * count}</TableCell>
      </TableRow>
    );
  }

  render() {
    console.log("data", this.state.data.stocks);
    const sum = this.state.data.stocks.reduce(function(total, el) {
      return total + el.count * el.price;
    }, 0);
    console.log(sum);
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
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left">Name</TableCell>
                <TableCell align="right">Price($)</TableCell>
                <TableCell align="right">Count</TableCell>
                <TableCell align="right">Sum($)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.data.stocks.map(el =>
                this.stockRow(el.name, el.price, el.count)
              )}
              <TableRow key="sum">
                <TableCell component="th" scope="row"></TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right"></TableCell>
                <TableCell align="right">{sum}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <CircularProgress color="green"></CircularProgress>
        )}

        <Typography variant="h5" align="left">
          Current Portfolio Value: ${sum}
        </Typography>
        <Typography variant="h5" align="left">
          Transaction History
        </Typography>
        {renderTable(this.state.data, "investments")}
      </Layout>
    );
  }
}