import React from "react";
import styled from "styled-components";

const LayoutDiv = styled.div`
  margin: 5em;
  padding: 1em 0;
`;

export default function Layout(props) {
  return <LayoutDiv>{props.children}</LayoutDiv>;
}
