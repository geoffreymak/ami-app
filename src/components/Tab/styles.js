import styled from "styled-components/native";
import { IconButton as PaperButton } from "react-native-paper";

export const Container = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: 5px;
`;

export const Button = styled(PaperButton)`
  ${({ selected, theme }) => selected && `color: ${theme.colors.primary}`}
`;
