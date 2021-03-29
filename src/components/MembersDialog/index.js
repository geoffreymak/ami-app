import React, {useState, useEffect, useMemo} from 'react';

import {FlatList, Dimensions, SectionList} from 'react-native';
import {
  Dialog,
  Portal,
  Button,
  RadioButton,
  Searchbar,
  useTheme,
  List,
  Avatar,
  Text,
} from 'react-native-paper';

import getAdminFromMember from '../../utils/admins/getAdminFromMember';

const MembersDialog = ({
  visible,
  onDismiss,
  members,
  admin,
  admins,
  navigation,
  dialogType,
  setMemberUpdate,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const theme = useTheme();
  const onChangeSearch = (query) => setSearchQuery(query);

  const cleanedMembers = useMemo(() => {
    let cleanedMembers = members;
    if (!!members && searchQuery.trim() !== '') {
      cleanedMembers = members.filter((member) =>
        member.nom.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    if (!!admins && !!admin && admin.attribut !== 'A3') {
      cleanedMembers = admins.map((admin) => {
        const member = cleanedMembers?.filter(
          (member) => member.code_admin === admin.code,
        );
        return {title: admin, data: member};
      });
    }
    console.log('cleanedMembers', cleanedMembers);
    return cleanedMembers;
  }, [searchQuery, members, admin, admins]);

  const onMemberClick = (member) => {
    if (!member) return;

    if (dialogType === 'select') {
      onDismiss(member, true);
      return;
    }
    if (dialogType === 'update') {
      setMemberUpdate(member);
      navigation.navigate('Members');
    } else {
      navigation.navigate('Transaction', {member});
    }
    onDismiss();
  };

  const renderItem = ({item}) => (
    <List.Item
      onPress={() => {
        onMemberClick(item);
      }}
      titleStyle={{textTransform: 'uppercase'}}
      title={item?.nom}
      description={item?.telephone}
      left={(props) => (
        <Avatar.Icon
          style={{marginTop: 10, marginRight: 10}}
          size={40}
          icon="account"
        />
      )}
    />
  );

  const renderSectionHeader = ({section: {title, data}}) => (
    <List.Subheader
      style={{
        backgroundColor: theme.colors.background2,
        color: theme.colors.primary,
      }}>
      {`${title?.nom} (${data?.length})`}
    </List.Subheader>
  );

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={onDismiss}
        style={{maxHeight: '100%'}}>
        <Dialog.Title style={{color: theme.colors.primary}}>
          Choisir un membres
        </Dialog.Title>
        {/* <Dialog.Content> */}
        <Dialog.ScrollArea
          style={{
            paddingHorizontal: 10,
            paddingTop: 10,
            backgroundColor: theme.colors.background2,
          }}>
          <Searchbar
            placeholder="Search"
            onChangeText={onChangeSearch}
            value={searchQuery}
          />
          {admin && admin.attribut === 'A3' ? (
            <FlatList
              data={cleanedMembers}
              renderItem={renderItem}
              keyExtractor={(item) => item.code}
            />
          ) : (
            <SectionList
              sections={cleanedMembers}
              stickySectionHeadersEnabled
              keyExtractor={(item, index) => item.code}
              renderItem={renderItem}
              renderSectionHeader={renderSectionHeader}
            />
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

export default MembersDialog;
