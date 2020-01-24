import React, { Component } from "react";
import Layout from "../components/Layout";

const savingsData = [
  [
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
  ]
];

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      savings: savingsData,
      checking: []
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
      savings: savingsData
    });
  };

  renderTable(account) {
    if (this.state[account].length === 0) {
      return <div>You have no transactions</div>;
    } else {
      const items = this.state[account].map(el => {
        return <p>hello</p>;
      });
    }
    return <p>error</p>;
  }

  render() {
    console.log("savings", this.state.savings);
    return (
      <Layout>
        <h3>Transactions</h3>
        {this.renderTable("savings")}
      </Layout>
    );
  }
}
