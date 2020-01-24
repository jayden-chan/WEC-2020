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
import Typography from "@material-ui/core/Typography";
import CircularProgress from "@material-ui/core/CircularProgress";

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

const data = {
  chequing: chequingData,
  savings: savingsData,
  investments: [],
  bobby: [
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
};

const StyledFormControl = withStyles({
  root: {
    width: "200px",
    margin: "10px 0"
  }
})(FormControl);

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      transactionDate: "",
      transactionType: "",
      transactionAmount: null,
      transactionAccount: "",
      transactionTitle: "",
      transferAmount: null
    };
    this.handleTransaction = this.handleTransaction.bind(this);
    this.handleTransfer = this.handleTransfer.bind(this);
  }

  componentDidMount = async () => {
    if (!localStorage.getItem("bow-login-token")) {
      this.props.history.push("/login");
      return;
    }

    const link = "http://localhost:3000/all";
    fetch(link, {
      method: "GET",
      headers: {
        Authorization: localStorage.getItem("bow-login-token")
      }
    }).then(res => {
      if (res.status === 200) {
        res.json().then(json => this.setState({ data: json }));
      } else {
        res.text().then(text => alert(text));
      }
    });

    this.setState({
      data: data
    });
  };

  handleTransaction() {
    const acc = this.state.transactionAccount;
    let link = "http://localhost:3000/";
    if (acc === "c" || acc === "s") {
      link += "karen";
    } else {
      link += "bobby";
    }

    const body = JSON.stringify({
      i_type: this.state.transactionType,
      acc: this.state.transactionAccount,
      amount: this.state.transactionAmount,
      title: this.state.transactionTitle
    });

    console.log(body);

    fetch(link, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("bow-login-token")
      },
      body: body
    }).then(res => {
      if (res.status === 200) {
        res.json().then(json => this.setState({ data: json }));
      } else {
        res.text().then(text => alert(text));
      }
    });
  }

  handleTransfer() {
    const body = JSON.stringify({
      amount: this.state.transferAmount
    });

    let link = "http://localhost:3000/transfer";

    fetch(link, {
      method: "POST",
      headers: {
        Authorization: localStorage.getItem("bow-login-token")
      },
      body
    }).then(res => {
      if (res.status === 200) {
        res.json().then(json => this.setState({ data: json }));
      } else {
        res.text().then(text => alert(text));
      }
    });
  }

  renderTable(account) {
    if (
      !this.state.data ||
      !this.state.data[account] ||
      Object.entries(this.state.data).length === 0
    ) {
      console.log("data is loading");
      return <CircularProgress color="green" />;
    }
    if (this.state.data[account].length === 0) {
      return <div>You have no transactions</div>;
    } else {
      console.log("length", this.state.data[account].length);
      const items = this.state.data[account].map((row, i) => {
        return (
          <TableRow key={i}>
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
  }

  transactionForm(isKaren) {
    return (
      <form noValidate autoComplete="off" style={{ textAlign: "left" }}>
        <TextField
          id="transaction-title"
          label="Title"
          type="text"
          value={this.state.transactionTitle}
          onChange={e => {
            this.setState({ transactionTitle: e.target.value });
          }}
        />
        <br></br>
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
        <br></br>
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
            {isKaren && <MenuItem value="s">Savings</MenuItem>}
            {isKaren && <MenuItem value="c">Chequing</MenuItem>}
            <MenuItem value="b">Bobby</MenuItem>
          </Select>
        </StyledFormControl>
        <br></br>
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
        <br></br>
        <Button
          onClick={this.handleTransaction}
          variant="contained"
          style={{
            backgroundColor: "green",
            color: "white",
            marginTop: "1em"
          }}
        >
          Submit
        </Button>
      </form>
    );
  }

  transferForm() {
    return (
      <form noValidate autoComplete="off" style={{ textAlign: "left" }}>
        <TextField
          id="transaction-title"
          label="Amount"
          type="number"
          value={this.state.transferAmount}
          inputProps={{ min: "0" }}
          onChange={e => {
            this.setState({ transferAmount: e.target.value });
          }}
        />
        <br></br>
        <Button
          onClick={this.handleTransfer}
          variant="contained"
          style={{
            backgroundColor: "green",
            color: "white",
            marginTop: "1em"
          }}
        >
          Submit
        </Button>
      </form>
    );
  }

  render() {
    const isKaren = "savings" in this.state.data;
    console.log("data", this.state.data);
    return (
      <Layout>
        <Typography variant="h4" align="left">
          Transactions
        </Typography>
        {isKaren && (
          <>
            <Typography variant="h5" align="left">
              Savings
            </Typography>
            {this.renderTable("savings")}
          </>
        )}
        {isKaren && (
          <>
            <Typography variant="h5" align="left">
              Chequing
            </Typography>
            {this.renderTable("chequing")}
          </>
        )}
        {isKaren && (
          <>
            <Typography variant="h5" align="left">
              Investments
            </Typography>
            {this.renderTable("investments")}
          </>
        )}
        <Typography variant="h5" align="left">
          Bobby's Account
        </Typography>
        {this.renderTable("bobby")}
        <Typography variant="h5" align="left">
          Add Transaction
        </Typography>
        {this.transactionForm()}
        {isKaren && (
          <>
            <Typography variant="h5" align="left">
              Transfer to Bobby
            </Typography>
            {this.transferForm()}
          </>
        )}
      </Layout>
    );
  }
}
