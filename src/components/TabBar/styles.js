import styled from "styled-components/native";
import { Dimensions } from "react-native";
const { width } = Dimensions.get("screen");

import { Card } from "react-native-paper";
export const Wrapper = styled.View`
  position: absolute;
  bottom: 0;
  width: ${width};
  align-items: center;
  justify-content: center;
`;

export const Container = styled(Card.Content)`
  flex-direction: row;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.surface};
  width: ${width};

  padding: 5px 15px;
`;

//background-color: ${({ theme }) => theme.colors.primary};
