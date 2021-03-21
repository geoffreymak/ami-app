import styled from "styled-components/native";
import { Dimensions } from "react-native";
import { Card as PaperCard } from "react-native-paper";

const windowWidth = Dimensions.get("window").width;
const avatarSize = Dimensions.get("window").width / 2 - 20;
export const Container = styled.View`
  padding-top: 100px;
  flex: 1;
`;

export const AvatarContainer = styled.View`
  justify-content: center;
  align-items: center;

  position: relative;
`;

export const AvatarSubContainer = styled.View`
  position: absolute;
`;

export const HeadlineContainer = styled.View`
  padding: 80px 0 20px 0;
  width: 100%;
  justify-content: center;
  align-items: center;
`;

export const InfoContainer = styled.View``;
