import React, {memo, useMemo, useState} from 'react';
import {StyleSheet, View, SectionList} from 'react-native';

import {
  Appbar,
  Surface,
  useTheme,
  List,
  Avatar,
  Searchbar,
  Badge,
  Colors,
} from 'react-native-paper';

import {connect} from 'react-redux';

import getFormatedNumber from '../utils/formating/getFormatedNumber';
import getFormatedDate from '../utils/formating/getFormatedDate';

const WaitingScreen = memo((props) => {
  const {navigation, route, admins, admin, members, waiting} = props;

  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const onChangeSearch = (query) => setSearchQuery(query);

  const cleanedWaitings = useMemo(() => {
    let cleanedWaitings = [];

    const getCleanedWaitings = (adm) => {
      const currentWaiting = waiting
        ?.filter((w) => w.code_admin === adm.code)
        .map((w) => {
          const member = members?.find((m) => m.compte === w.compte);
          return {member, waiting: w};
        });

      if (!!currentWaiting?.length) {
        cleanedWaitings = [
          ...cleanedWaitings,
          {title: adm, data: currentWaiting},
        ];
      }
    };

    if (admin?.attribut === 'A3') {
      getCleanedWaitings(admin);
    } else {
      admins.forEach(getCleanedWaitings);
    }

    if (!!cleanedWaitings?.length && searchQuery.trim() !== '') {
      cleanedWaitings = cleanedWaitings.map((v) => {
        return {
          ...v,
          data: v?.data?.filter(({member}) =>
            member?.nom.toLowerCase().includes(searchQuery.toLowerCase()),
          ),
        };
      });
    }

    return cleanedWaitings;
  }, [members, searchQuery, admins, waiting, admin]);

  const onMemberClick = (member) =>
    !!member && navigation.navigate('Transaction', {member});

  const renderItem = ({item}) => (
    <List.Item
      onPress={() => {
        onMemberClick(item?.member);
      }}
      titleStyle={{textTransform: 'uppercase'}}
      title={item?.member?.nom}
      description={`${getFormatedNumber(
        item?.waiting?.montant,
      )} | ${getFormatedDate(item?.waiting?.createdAt)}`}
      left={(props) => (
        <Avatar.Icon
          style={{marginTop: 10, marginRight: 10}}
          size={40}
          icon="account"
        />
      )}
      right={(props) => (
        <Badge
          {...props}
          size={15}
          style={{
            backgroundColor:
              item?.waiting?.statusCode === 'A'
                ? Colors.green500
                : item?.waiting?.statusCode === 'W'
                ? Colors.orange500
                : Colors.red500,
            marginBottom: 20,
          }}
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
    <>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Requêtes de retrait" />
      </Appbar.Header>

      <Surface
        style={[styles.surface, {backgroundColor: theme.colors.background2}]}>
        <Searchbar
          placeholder="Search"
          onChangeText={onChangeSearch}
          value={searchQuery}
        />
        <SectionList
          sections={cleanedWaitings}
          stickySectionHeadersEnabled
          keyExtractor={(item, index) => item?.waiting?.code}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
        />
      </Surface>
    </>
  );
});

const styles = StyleSheet.create({
  surface: {
    flex: 1,
    paddingVertical: 20,
    paddingHorizontal: 15,
  },
});

const mapStateToProps = (state) => ({
  loginState: state?.login,
  admin: state.admin?.data,
  admins: state.admin?.list,
  members: state.members?.data,
  waiting: state.transactions?.waiting,
});

export default connect(mapStateToProps, {})(WaitingScreen);
