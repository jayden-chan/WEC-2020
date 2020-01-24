import React from "react";
import styled from "styled-components";

const LayoutDiv = styled.div`
  margin-top: 5em;
  margin-bottom: 5em;
`;

export default function Layout(props) {
  return <LayoutDiv>{props.children}</LayoutDiv>;
}
