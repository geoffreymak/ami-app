import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
//import { useTabBar } from "../contexts/TabBarProvider";
import Tab from "../Tab";
import * as S from "./styles";
const { width } = Dimensions.get("screen");
import { Divider } from "react-native-paper";

const TabBar = ({ state, navigation }) => {
  const [selected, setSelected] = useState("Home");
  const { routes } = state;
  console.log(state);
  const isSelected = (currentTab) => currentTab === selected;

  const handlePress = (activeTab, index) => {
    if (state.index !== index) {
      setSelected(activeTab);
      navigation.navigate(activeTab);
    }
  };

  return (
    <>
      <S.Wrapper>
        <Divider />
        <S.Container>
          {routes.map((route, index) => (
            <Tab
              tab={route}
              icon={route.params.icon}
              onPress={() => handlePress(route.name, index)}
              selected={isSelected(route.name)}
              key={route.key}
            />
          ))}
        </S.Container>
      </S.Wrapper>
    </>
  );
};

export default TabBar;
