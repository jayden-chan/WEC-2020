import React, { Component } from "react";
import Layout from "../components/Layout";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      files: [],
      download: ""
    };
  }

  render() {
    return (
      <Layout>
        <h3>Transactions</h3>
      </Layout>
    );
  }
}
