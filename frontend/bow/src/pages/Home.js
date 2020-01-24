import React, { Component } from "react";
import Layout from "../components/Layout";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import InputLabel from "@material-ui/core/InputLabel";
import FormControl from "@material-ui/core/FormControl";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";

const savingsData = [
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 100,
    title: "Misc"
  },
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 100,
    title: "Misc"
  },
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 100,
    title: "Misc"
  },
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 100,
    title: "Misc"
  }
];

const chequingData = [
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 300,
    title: "Misc"
  },
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 100,
    title: "Misc"
  },
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 200,
    title: "Misc"
  },
  {
    date: "2020-01-01T06:00:00.000Z",
    type: "Deposit",
    amount: 100,
    title: "Misc"
  }
];

const StyledFormControl = withStyles({
  root: {
    width: "200px",
    margin: "0 10px"
  }
})(FormControl);

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savings: [],
      chequing: [],
      transactionDate: "",
      transactionType: "",
      transactionAmount: 0,
      transactionAccount: "",
      transactionTitle: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentDidMount = async () => {
    // if (!localStorage.getItem("guugle-login-token")) {
    //   this.props.history.push("/login");
    //   return;
    // }
    // const link = "http://localhost:3001/list";
    // fetch(link, {
    //   method: "GET",
    //   headers: {
    //     Authorization: localStorage.getItem("guugle-login-token")
    //   }
    // }).then(res => {
    //   if (res.status === 200) {
    //     res.json().then(json => this.setState({ files: json }));
    //   } else {
    //     res.text().then(text => alert(text));
    //   }
    // });
    this.setState({
      savings: savingsData,
      chequing: chequingData
    });
  };

  handleSubmit() {
    const body = JSON.stringify({
      i_type: this.state.transactionType,
      acc: this.state.transactionAccount,
      amount: this.state.transactionAmount,
      title: this.state.transactionTitle
    });
    console.log("body", body);
  }

  renderTable(account) {
    if (this.state[account].length === 0) {
      return <div>You have no transactions</div>;
    } else {
      console.log("length", this.state[account].length);
      const items = this.state[account].map(row => {
        return (
          <TableRow key={row.type}>
            <TableCell component="th" scope="row">
              {row.type}
            </TableCell>
            <TableCell align="right">{row.amount}</TableCell>
            <TableCell align="right">{row.title}</TableCell>
            <TableCell align="right">{row.date}</TableCell>
          </TableRow>
        );
      });

      return (
        <TableContainer>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell>Type</TableCell>
                <TableCell align="right">Amount ($)</TableCell>
                <TableCell align="right">Title</TableCell>
                <TableCell align="right">Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>{items}</TableBody>
          </Table>
        </TableContainer>
      );
    }
    return <p>error</p>;
  }

  transactionForm() {
    return (
      <form noValidate autoComplete="off">
        <TextField
          id="transaction-title"
          label="Title"
          type="text"
          value={this.state.transactionTitle}
          onChange={e => {
            this.setState({ transactionTitle: e.target.value });
          }}
        />

        <StyledFormControl size="medium">
          <InputLabel>Type</InputLabel>
          <Select
            id="transaction-type"
            size="medium"
            value={this.state.transactionType}
            onChange={e => {
              this.setState({ transactionType: e.target.value });
            }}
          >
            <MenuItem value="Withdrawal">Withdrawal</MenuItem>
            <MenuItem value="Deposit">Deposit</MenuItem>
          </Select>
        </StyledFormControl>
        <StyledFormControl size="medium">
          <InputLabel>Account</InputLabel>
          <Select
            size="medium"
            id="transaction-account"
            value={this.state.transactionAccount}
            onChange={e => {
              this.setState({ transactionAccount: e.target.value });
            }}
          >
            <MenuItem value="s">Savings</MenuItem>
            <MenuItem value="c">Chequing</MenuItem>
          </Select>
        </StyledFormControl>
        <TextField
          id="transaction-amount"
          label="Amount"
          type="number"
          value={this.state.transactionAmount}
          onChange={e => {
            this.setState({ transactionAmount: e.target.value });
          }}
          inputProps={{ min: "0" }}
        />
        <Button onClick={this.handleSubmit} variant="contained" color="primary">
          Submit
        </Button>
      </form>
    );
  }

  render() {
    return (
      <Layout>
        <h3>Transactions</h3>
        <h4>Savings</h4>
        {this.renderTable("savings")}
        <h4>Chequing</h4>
        {this.renderTable("chequing")}
        <h4>Add Transaction</h4>
        {this.transactionForm()}
      </Layout>
    );
  }
}
