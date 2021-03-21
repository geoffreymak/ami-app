import React, {useState, useMemo} from 'react';

import {connect} from 'react-redux';
import {View, FlatList, StyleSheet, Dimensions} from 'react-native';
import {Headline, useTheme, Colors} from 'react-native-paper';

import {setAdminUpdate} from '../../redux/actions/adminActions';
import CardButton from '../CardButton';
import ManageDialog from '../ManageDialog';
import AdminDialog from '../AdminDialog';
import MembersDialog from '../MembersDialog';

const numColumns = 2;

const formatData = (data, numColumns) => {
  const filtredData = data.filter(({visible}) => !!visible);
  const numberOfFullRows = Math.floor(filtredData.length / numColumns);
  let numberOfElementsLastRow =
    filtredData.length - numberOfFullRows * numColumns;
  let cleanedData = [...filtredData];
  while (
    numberOfElementsLastRow !== numColumns &&
    numberOfElementsLastRow !== 0
  ) {
    cleanedData = [
      ...cleanedData,
      {
        key: `blank-${numberOfElementsLastRow}`,
        empty: true,
      },
    ];
    numberOfElementsLastRow++;
  }

  return cleanedData;
};

const windowHeight = Dimensions.get('window').height;

const MainMenu = ({
  navigation,
  admin,
  admins,
  members,
  onOpenMemberDialog,
  openReportDialog,
  setAdminUpdate,
  onOpenReportDialog,
}) => {
  const [openAdminsDialog, setOpenAdminsDialog] = useState(false);
  const [openAdminManageDialog, setOpenAdminManageDialog] = useState(false);
  const [openMembersManageDialog, setOpenMembersManageDialog] = useState(false);
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const theme = useTheme();

  const buttonData = useMemo(
    () => [
      {
        title: 'Administrateurs',
        icon: 'shield-account-outline',
        onPress: () => setOpenAdminManageDialog(true),
        background: Colors.lightBlue800,
        iconBackground: Colors.purple200,
        visible: !!admin && admin.attribut !== 'A3',
      },
      {
        title: 'Membres',
        icon: 'account-group-outline',
        onPress: () => setOpenMembersManageDialog(true),
        background: Colors.orange800,
        iconBackground: Colors.green200,
        visible: true,
      },
      {
        title: 'Transactions',
        icon: 'bank-transfer',
        onPress: () => setOpenMembersDialog(true),
        background: Colors.greenA700,
        iconBackground: Colors.brown200,
        visible: true,
      },
      {
        title: 'Rapports',
        icon: 'file-document-outline',
        onPress: () => {
          onOpenReportDialog();
        },
        background: Colors.redA200,
        iconBackground: Colors.pink200,
        visible: true,
      },
      {
        title: 'Mon Compte',
        icon: 'account-circle-outline',
        onPress: async () => {
          navigation.navigate('Account');
        },
        background: Colors.teal500,
        iconBackground: Colors.pink200,
        visible: true,
      },
    ],
    [members, admin],
  );

  const renderItem = ({index, item: props}) => {
    if (props.empty === true) {
      console.log('main menu empty element');
      return <View style={[styles.item, styles.itemInvisible]} />;
    }

    if (!props.visible) {
      return;
    }

    return <CardButton {...props} style={styles.item} />;
  };

  return (
    <>
      {/* <Headline
        style={{
          marginLeft: 20,
          marginTop: 10,
          color: theme.colors.primary,
        }}>
        Menu
      </Headline>*/}

      <FlatList
        data={formatData(buttonData, numColumns)}
        style={styles.container}
        renderItem={renderItem}
        numColumns={numColumns}
        keyExtractor={(_, idx) => idx.toString()}
      />

      <AdminDialog
        visible={openAdminsDialog}
        onDismiss={() => setOpenAdminsDialog(false)}
        admins={admins}
        navigation={navigation}
        setAdminUpdate={setAdminUpdate}
      />

      <MembersDialog
        visible={openMembersDialog}
        onDismiss={() => setOpenMembersDialog(false)}
        members={members}
        admin={admin}
        admins={admins}
        navigation={navigation}
      />

      <ManageDialog
        visible={openAdminManageDialog}
        onDismiss={() => setOpenAdminManageDialog(false)}
        title="Gestion Administrateur"
        options={[
          {
            title: 'Ajouter un Administrateur',
            icon: 'account-plus',
            onPress: () => navigation.navigate('Admin', {admin}),
            visible: true,
          },
          {
            title: 'Modifier un Administrateur',
            icon: 'account-edit',
            onPress: () => setOpenAdminsDialog(true),
            visible: !!admin && admin.attribut === 'A1',
          },
        ]}
      />

      <ManageDialog
        visible={openMembersManageDialog}
        onDismiss={() => setOpenMembersManageDialog(false)}
        title="Gestion Membres"
        options={[
          {
            title: 'Ajouter un Membre',
            icon: 'account-multiple-plus',
            onPress: () => navigation.navigate('Members'),
            visible: true,
          },
          {
            title: 'Modifier un Membre',
            icon: 'account-edit',
            onPress: () => onOpenMemberDialog('update'),
            visible: admin.attribut !== 'A3',
          },
        ]}
      />
    </>
  );
};

const mapStateToProps = (state) => ({
  admin: state.admin.data,
  admins: state.admin.list,
  updatedAdmin: state.admin.updatedAdmin,
  members: state.members.data,
});

export default connect(mapStateToProps, {
  setAdminUpdate,
})(MainMenu);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 30,
  },
  item: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    margin: 5,
    height: Dimensions.get('window').width / numColumns, // approximate a square
  },
  itemInvisible: {
    backgroundColor: 'transparent',
  },
  itemText: {
    color: '#fff',
  },
});
