import React from "react";

import { createDrawerNavigator } from "@react-navigation/drawer";

import SettingScreen from "../screens/SettingScreen";
import AboutScreen from "../screens/AboutScreen";
import HomeScreen from "../screens/HomeScreen";
import MembersScreen from "../screens/MembersScreen";
import AdminScreen from "../screens/AdminScreen";
import TransactionScreen from "../screens/TransactionScreen";
import AccountScreen from "../screens/AccountScreen";
import ReportScreen from "../screens/ReportScreen";

import DrawerContent from "../components/DrawerContent";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator drawerContent={(props) => <DrawerContent {...props} />}>
      <Drawer.Screen
        name="Home"
        options={{
          headerShown: false,
        }}
        component={HomeScreen}
      />

      <Drawer.Screen
        name="Report"
        options={{
          headerShown: false,
        }}
        component={ReportScreen}
      />

      <Drawer.Screen
        name="Account"
        options={{
          headerShown: false,
        }}
        component={AccountScreen}
      />

      <Drawer.Screen
        name="Members"
        options={{
          headerShown: false,
        }}
        component={MembersScreen}
      />

      <Drawer.Screen
        name="Admin"
        options={{
          headerShown: false,
        }}
        component={AdminScreen}
      />

      <Drawer.Screen
        name="Setting"
        options={{
          headerShown: false,
        }}
        component={SettingScreen}
      />

      <Drawer.Screen
        name="About"
        options={{
          headerShown: false,
        }}
        component={AboutScreen}
      />

      <Drawer.Screen
        name="Transaction"
        options={{
          headerShown: false,
        }}
        component={TransactionScreen}
      />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
