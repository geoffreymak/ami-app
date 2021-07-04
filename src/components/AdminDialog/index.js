import React, {useState, useEffect} from 'react';

import {FlatList, View} from 'react-native';
import {
  Dialog,
  Portal,
  Button,
  Searchbar,
  useTheme,
  Paragraph,
  List,
  Avatar,
  Colors,
  ActivityIndicator,
} from 'react-native-paper';

import {useSelector} from 'react-redux';
import getAttribut from '../../utils/admins/getAdminAttribut';

const AdminDialog = ({
  visible,
  onDismiss,
  dialogType,
  setAdminUpdate,
  navigation,
}) => {
  const [cleanedAdmins, setCleanedAdmins] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  // const admin = useSelector((state) => state.admin.data);
  const admins = useSelector((state) => state.admin.list);
  const theme = useTheme();
  const onChangeSearch = (query) => setSearchQuery(query);

  const onItemPress = (item) => {
    if (dialogType === 'select') {
      onDismiss(item, true);
      return;
    }
    setAdminUpdate(item);
    onDismiss();
    navigation.navigate('Admin');
  };

  useEffect(() => {
    if (!!admins && searchQuery.trim() !== '') {
      const cleanedAdmins = admins.filter((admin) =>
        admin.nom.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      setCleanedAdmins(cleanedAdmins);
      return;
    }
    const cleanedAdmins = admins?.length ? admins : null;
    setCleanedAdmins(cleanedAdmins);
  }, [searchQuery, admins]);

  const renderItem = ({item}) => (
    <List.Item
      onPress={() => onItemPress(item)}
      title={item?.nom}
      titleStyle={{textTransform: 'uppercase'}}
      description={getAttribut(item?.attribut)}
      left={(props) => (
        <Avatar.Icon
          size={45}
          icon={
            item?.attribut === 'A1'
              ? 'shield-account'
              : item?.attribut === 'A2'
              ? 'account-supervisor'
              : 'account'
          }
          backgroundColor={
            item?.attribut === 'A1'
              ? Colors.blue500
              : item?.attribut === 'A2'
              ? Colors.red500
              : Colors.green500
          }
          style={{
            borderRadius: 25,
            marginTop: 10,
            marginRight: 10,
          }}
        />
      )}
    />
  );

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={{flex: 1}}>
        <Dialog.Title style={{color: theme.colors.primary}}>
          Choisir un Administrateur
        </Dialog.Title>
        {/* <Dialog.Content> */}
        <Dialog.ScrollArea
          style={{
            paddingHorizontal: 10,
            paddingTop: 10,
            backgroundColor: theme.colors.background2,
          }}>
          <Searchbar
            placeholder="Recherche"
            onChangeText={onChangeSearch}
            value={searchQuery}
          />
          {!!cleanedAdmins ? (
            cleanedAdmins.length ? (
              <FlatList
                data={cleanedAdmins}
                renderItem={renderItem}
                keyExtractor={(item, idx) => `${item.code}-${idx}`}
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Paragraph>Aucun Administrateur</Paragraph>
              </View>
            )
          ) : (
            <View
              style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
              <ActivityIndicator animating={true} color={Colors.green500} />
            </View>
          )}
        </Dialog.ScrollArea>
        {/* </Dialog.Content> */}

        <Dialog.Actions>
          <Button onPress={onDismiss}>ok</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default AdminDialog;
