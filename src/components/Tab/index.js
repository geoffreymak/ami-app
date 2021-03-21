import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme, Caption } from "react-native-paper";

import * as S from "./styles";
const Tab = ({ color, tab, onPress, icon, selected }) => {
  const theme = useTheme();
  return (
    <TouchableOpacity onPress={onPress} rippleColor="rgba(0, 0, 0, 1)">
      <S.Container>
        <MaterialCommunityIcons
          name={`${icon}-outline`}
          size={22}
          color={selected ? theme.colors.primary : theme.colors.text}
        />
        <Caption
          style={{ color: selected ? theme.colors.primary : theme.colors.text }}
        >
          {tab.params.title || tab.name}
        </Caption>
      </S.Container>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
});

export default Tab;
