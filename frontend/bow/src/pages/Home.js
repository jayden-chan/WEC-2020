import React, { Component } from "react";
import Layout from "../components/Layout";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

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

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savings: [],
      chequing: []
    };
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
          <Table>
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

  render() {
    console.log("savings", this.state.savings);
    return (
      <Layout>
        <h3>Transactions</h3>
        <h4>Savings</h4>
        {this.renderTable("savings")}
        <h4>Chequing</h4>
        {this.renderTable("chequing")}
      </Layout>
    );
  }
}
