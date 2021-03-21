import React, { useState, useEffect } from "react";

import { Button, Dialog, Portal, RadioButton } from "react-native-paper";

import { ScrollView } from "react-native";

import { useGlobalPrefereces } from "../../contexts/GlobalState";

import { sizes } from "../../utils/themes";

const SizeDialog = ({ visible, onDismiss }) => {
  const { fontSize, changeFonSize } = useGlobalPrefereces();
  const [value, setValue] = useState(fontSize);

  useEffect(() => {
    setValue(fontSize);
  }, [fontSize]);

  const onValueChange = (value) => {
    changeFonSize(value);
  };
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Taille de Police</Dialog.Title>
        <Dialog.ScrollArea style={{ paddingHorizontal: 10 }}>
          <ScrollView>
            <RadioButton.Group onValueChange={onValueChange} value={value}>
              {sizes.map((s, i) => (
                <RadioButton.Item
                  key={i}
                  label={s.name}
                  labelStyle={{
                    fontSize: s.size,
                    textTransform: "capitalize",
                  }}
                  value={s.size}
                />
              ))}
            </RadioButton.Group>
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={onDismiss}>ok</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default SizeDialog;
