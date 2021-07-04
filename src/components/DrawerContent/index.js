import React, {useState, useCallback} from 'react';
import {View, StyleSheet} from 'react-native';
import {
  useTheme,
  Avatar,
  Title,
  Caption,
  Drawer,
  Text,
  TouchableRipple,
  Switch,
  Divider,
  Paragraph,
} from 'react-native-paper';

import {useSelector} from 'react-redux';

import {DrawerContentScrollView} from '@react-navigation/drawer';

// import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import getAttribut from '../../utils/admins/getAdminAttribut';
import {APP_VERSION} from '../../utils/const';
import ColorsDialog from '../ColorsDialog';

export default function DrawerContent(props) {
  const paperTheme = useTheme();
  const admin = useSelector((state) => state.admin.data);
  const {toggleTheme} = useSelector((state) => state.settings);
  const [openColorDialog, setOpenColorDialog] = useState(false);

  return (
    <>
      <View style={{flex: 1, backgroundColor: paperTheme.colors.primary}}>
        <DrawerContentScrollView {...props}>
          <View style={styles.drawerContent}>
            <View style={styles.userInfoSection}>
              <View style={{flexDirection: 'row', marginTop: 15}}>
                <Avatar.Icon
                  style={{backgroundColor: '#fff'}}
                  icon="account-outline"
                  size={60}
                />
                <View style={{marginLeft: 15, flexDirection: 'column'}}>
                  <Title style={styles.title}>{!!admin && admin.nom}</Title>
                  <Caption style={styles.caption}>
                    {!!admin && getAttribut(admin.attribut)}
                  </Caption>
                </View>
              </View>
              {/*<View style={styles.row}>
                <View style={styles.section}>
                  <Paragraph style={[styles.paragraph, styles.caption]}>
                    80
                  </Paragraph>
                  <Caption style={styles.caption}>Membre actifs</Caption>
                </View>
                <View style={styles.section}>
                  <Paragraph style={[styles.paragraph, styles.caption]}>
                    100
                  </Paragraph>
                  <Caption style={styles.caption}>Membres</Caption>
                </View>
              </View>*/}
            </View>

            <Drawer.Section
              title="Menu"
              theme={{
                ...paperTheme,
                colors: {...paperTheme.colors, text: '#fff'},
              }}
              style={styles.drawerSection}>
              <Drawer.Item
                icon="home-outline"
                label="Accueil"
                theme={{
                  ...paperTheme,
                  colors: {...paperTheme.colors, text: '#fff'},
                }}
                onPress={() => props.navigation.navigate('Home')}
              />

              <Drawer.Item
                icon="account-circle-outline"
                label="Mon Compte"
                theme={{
                  ...paperTheme,
                  colors: {...paperTheme.colors, text: '#fff'},
                }}
                onPress={() => props.navigation.navigate('Account')}
              />
              <Drawer.Item
                theme={{
                  ...paperTheme,
                  colors: {...paperTheme.colors, text: '#fff'},
                }}
                icon="account-group-outline"
                label="Gestion Membres"
                onPress={() => props.navigation.navigate('Members')}
              />

              {!!admin && admin.attribut === 'A1' && (
                <Drawer.Item
                  theme={{
                    ...paperTheme,
                    colors: {...paperTheme.colors, text: '#fff'},
                  }}
                  icon="shield-account-outline"
                  label="Gestion Administrateurs"
                  onPress={() => {}}
                />
              )}

              {!!admin && (admin.attribut === 'A1' || admin.attribut === 'A2') && (
                <Drawer.Item
                  theme={{
                    ...paperTheme,
                    colors: {...paperTheme.colors, text: '#fff'},
                  }}
                  icon="file-document-outline"
                  label="Rapports"
                  onPress={() => {}}
                />
              )}
              <Drawer.Item
                theme={{
                  ...paperTheme,
                  colors: {...paperTheme.colors, text: '#fff'},
                }}
                icon="bank-transfer"
                label="Transactions"
                onPress={() => {}}
              />
              {admin?.attribut === 'A1' && (
                <Drawer.Item
                  theme={{
                    ...paperTheme,
                    colors: {...paperTheme.colors, text: '#fff'},
                  }}
                  icon="database"
                  label="Paramétres"
                  onPress={() => props.navigation.navigate('Setting')}
                />
              )}
            </Drawer.Section>
            <Drawer.Section
              title="Preferences"
              theme={{
                ...paperTheme,
                colors: {...paperTheme.colors, text: '#fff'},
              }}>
              <Drawer.Item
                theme={{
                  ...paperTheme,
                  colors: {...paperTheme.colors, text: '#fff'},
                }}
                icon="palette-outline"
                label="Couleur Principale"
                onPress={() => setOpenColorDialog(true)}
              />

              <TouchableRipple onPress={toggleTheme}>
                <View style={styles.preference}>
                  <Text style={{color: '#fff'}}>Mode Sombre</Text>
                  <View pointerEvents="none">
                    <Switch value={paperTheme.dark} />
                  </View>
                </View>
              </TouchableRipple>
            </Drawer.Section>
          </View>
        </DrawerContentScrollView>
        <Drawer.Section style={styles.bottomDrawerSection}>
          <Drawer.Item
            theme={{
              ...paperTheme,
              colors: {...paperTheme.colors, text: '#fff'},
            }}
            label={`Version ${APP_VERSION}`}
            onPress={() => props.navigation.navigate('About')}
          />
        </Drawer.Section>
      </View>
      <ColorsDialog
        visible={openColorDialog}
        onDismiss={() => setOpenColorDialog(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: 'bold',
    color: '#fff',
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
    color: '#eee',
  },
  row: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  paragraph: {
    fontWeight: 'bold',
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    marginBottom: -1,
    borderTopColor: '#f4f4f4',
    borderTopWidth: 1,
  },
  preference: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
