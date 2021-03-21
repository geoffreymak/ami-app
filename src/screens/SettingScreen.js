import React, { useState } from "react";
import { StyleSheet } from "react-native";

import { Appbar, List, Switch, useTheme, Surface } from "react-native-paper";

import { useGlobalPrefereces } from "../contexts/GlobalState";

import ColorsDialog from "../components/ColorsDialog";
import SizeDialog from "../components/SizeDialog";

const SettingScreen = (props) => {
  const { navigation, route } = props;
  const [openColorDialog, setOpenColorDialog] = useState(false);
  const [openSizeDialog, setOpenSizeDialog] = useState(false);
  const { dark, colors } = useTheme();
  const { toggleTheme } = useGlobalPrefereces();

  return (
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Paramètres" />
      </Appbar.Header>

      <Surface
        style={[styles.surface, { backgroundColor: colors.background2 }]}
      >
        <List.Section>
          <List.Subheader>Theme</List.Subheader>
          <List.Item
            title="Mode Sombre"
            description="Permet de réduire la fatigue des yeux"
            onPress={toggleTheme}
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={(props) => (
              <Switch value={dark} onValueChange={toggleTheme} />
            )}
          />

          <List.Item
            title="Couleur Principale"
            description="Couleur principale de l'application (uniquement en mode claire)"
            onPress={() => setOpenColorDialog(true)}
            left={(props) => <List.Icon {...props} icon="palette-outline" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Preference</List.Subheader>
          <List.Item
            title="Taille de Police"
            description="La taille de police de paroles"
            onPress={() => setOpenSizeDialog(true)}
            left={(props) => <List.Icon {...props} icon="format-size" />}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>A propos</List.Subheader>
          <List.Item
            title="A propos"
            description="A propos de l'application"
            onPress={() => navigation.navigate("About")}
            left={(props) => (
              <List.Icon {...props} icon="information-outline" />
            )}
          />
        </List.Section>
      </Surface>

      <ColorsDialog
        visible={openColorDialog}
        onDismiss={() => setOpenColorDialog(false)}
      />

      <SizeDialog
        visible={openSizeDialog}
        onDismiss={() => setOpenSizeDialog(false)}
      />
    </>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    // paddingVertical: 20,
  },
  paragraph: {
    textAlign: "center",
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
});
