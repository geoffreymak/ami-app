import React, {useEffect, useState, memo, useCallback} from 'react';
import {Dimensions, View, ImageBackground} from 'react-native';

import {connect} from 'react-redux';
import {getMembers, setMemberUpdate} from '../redux/actions/membersActions';
import {getAdmins} from '../redux/actions/adminActions';
import {logoutAdmin} from '../redux/actions/loginActions';
import {getSettins} from '../redux/actions/settingActions';

import {Appbar, FAB, useTheme, Colors} from 'react-native-paper';

import Layout from '../components/Layout';
import MembersDialog from '../components/MembersDialog';
import ReportDialog from '../components/ReportDialog';
import Table from '../components/Table';
import MainMenu from '../components/MainMenu';

const ITEM_PER_PAGE = 4;
const windowHeight = Dimensions.get('window').height;
const HomeScreen = memo((props) => {
  const {
    navigation,
    members,
    admin,
    admins,
    getMembers,
    getAdmins,
    setMemberUpdate,
    logoutAdmin,
    getSettins,
    loginState,
  } = props;

  useEffect(() => {
    if (!!admin && !!loginState.success) {
      getSettins();
      getMembers(admin);
      getAdmins(admin);
    }
  }, [admin]);

  const theme = useTheme();
  const [state, setState] = useState({open: false});
  const [openMembersDialog, setOpenMembersDialog] = useState(false);
  const [openReportDialog, setOpenReportDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const onStateChange = ({open}) => setState({open});

  const onOpenMemberDialog = (dialogType = 'transaction') => {
    setDialogType(dialogType);
    setOpenMembersDialog(true);
  };

  const onOpenReportDialog = () => {
    setOpenReportDialog(true);
  };

  const getFabActions = useCallback(() => {
    if (admin && admin.attribut === 'A1') {
      return [
        {
          icon: 'account-plus',
          label: 'Ajout des Administrateurs',
          style: {backgroundColor: Colors.teal500},
          onPress: () => navigation.navigate('Admin', {adminType: 'collector'}),
        },

        {
          icon: 'account-multiple-plus',
          label: 'Ajout des Membres',
          style: {backgroundColor: Colors.green600},
          onPress: () => navigation.navigate('Members'),
        },
        {
          icon: 'bank-transfer',
          label: 'Transactions',
          style: {backgroundColor: Colors.red500},
          onPress: onOpenMemberDialog,
        },
      ];
    }
    return [
      {
        icon: 'account-multiple-plus',
        label: 'Ajout des membres',
        style: {backgroundColor: Colors.green600},
        onPress: () => navigation.navigate('Members'),
      },
      {
        icon: 'bank-transfer',
        label: 'Transactions',
        style: {backgroundColor: Colors.red500},
        onPress: onOpenMemberDialog,
      },
    ];
  }, [admin]);

  const {open} = state;

  return (
    <>
      <Appbar.Header>
        <Appbar.Action icon="menu" onPress={() => navigation.toggleDrawer()} />
        <Appbar.Content title="Accueil" />
        <Appbar.Action icon={'exit-to-app'} onPress={logoutAdmin} />
      </Appbar.Header>
      <ImageBackground
        source={require('../assets/images/jason-leung-SAYzxuS1O3M-unsplash.jpg')}
        blurRadius={5}
        style={{
          flex: 1,
          resizeMode: 'cover',
          justifyContent: 'center',
        }}>
        <View style={{flex: 1, height: windowHeight}}>
          <MainMenu
            navigation={navigation}
            onOpenMemberDialog={onOpenMemberDialog}
            onOpenReportDialog={onOpenReportDialog}
          />
        </View>
      </ImageBackground>
      <FAB.Group
        fabStyle={{backgroundColor: theme.colors.primary}}
        color="#fff"
        open={open}
        icon={open ? 'close' : 'plus'}
        actions={getFabActions()}
        onStateChange={onStateChange}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
      />

      <MembersDialog
        visible={openMembersDialog}
        dialogType={dialogType}
        setMemberUpdate={setMemberUpdate}
        onDismiss={() => setOpenMembersDialog(false)}
        members={members}
        admin={admin}
        admins={admins}
        navigation={navigation}
      />

      <ReportDialog
        visible={openReportDialog}
        onDismiss={() => setOpenReportDialog(false)}
        navigation={navigation}
        members={members}
        admins={admins}
      />
    </>
  );
});

const mapStateToProps = (state) => ({
  loginState: state.login,
  admin: state.admin.data,
  admins: state.admin.list,
  members: state.members.data,
});

export default connect(mapStateToProps, {
  getMembers,
  getAdmins,
  logoutAdmin,
  setMemberUpdate,
  getSettins,
})(HomeScreen);
