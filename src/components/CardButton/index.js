import React from 'react';
import {View, Dimensions} from 'react-native';
import {
  Card,
  Headline,
  Avatar,
  Button,
  TouchableRipple,
  Colors,
  Subheading,
  Paragraph,
  useTheme,
} from 'react-native-paper';
import color from 'color';

const buttonSize = Dimensions.get('window').width / 2 - 30;

const CardButton = (props) => {
  const {title, icon, onPress, background, iconBackground, style} = props;
  const theme = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor:
            color(Colors.grey800).alpha(0.825).string() || Colors.orange200,
          borderRadius: 25,
        },
        style,
      ]}>
      <TouchableRipple
        onPress={onPress}
        style={{flex: 1, backgroundColor: 'transparent'}}>
        <View
          style={{
            flexDirection: 'column',
            alignItems: 'center',
            flex: 1,
            justifyContent: 'space-between',
            paddingHorizontal: 10,
            paddingVertical: 30,
          }}>
          <Avatar.Icon
            icon={icon}
            backgroundColor={background || Colors.orange300}
          />
          <Subheading style={{color: background}}>{title}</Subheading>
        </View>
      </TouchableRipple>
    </View>
  );
};

export default CardButton;
