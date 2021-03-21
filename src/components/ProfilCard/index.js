import React, {useState} from 'react';
import {Dimensions} from 'react-native';
import {
  Avatar,
  Card,
  useTheme,
  Headline,
  Divider,
  Caption,
  List,
  Button,
} from 'react-native-paper';
import {connect} from 'react-redux';

import AccountDialog from '../AccountDialog';

import getAdminAttribut from '../../utils/admins/getAdminAttribut';
import {
  updateAdmin,
  resetLoading,
  setAdminData,
} from '../../redux/actions/adminActions';

import * as S from './styles';

const avatarSize = Dimensions.get('window').width / 2 - 50;
const ProfilCard = ({admin, addingState, updateAdmin, resetLoading}) => {
  const [openDialog, setOpenDialog] = useState(false);
  const theme = useTheme();
  return (
    <S.Container>
      <Card>
        <S.AvatarContainer>
          <S.AvatarSubContainer>
            <Avatar.Icon onPress={() => {}} size={avatarSize} icon="account" />
          </S.AvatarSubContainer>
        </S.AvatarContainer>

        <S.HeadlineContainer>
          <Headline>{admin.username}</Headline>
          <Caption>{getAdminAttribut(admin.attribut)}</Caption>
        </S.HeadlineContainer>

        <Divider />

        <S.InfoContainer>
          <List.Item
            onPress={() => {}}
            title="Nom"
            description={admin.nom}
            left={(props) => (
              <List.Icon
                {...props}
                color={theme.colors.primary}
                icon="account"
              />
            )}
          />

          <List.Item
            onPress={() => {}}
            title="Téléphone"
            description={admin.telephone}
            left={(props) => (
              <List.Icon {...props} color={theme.colors.primary} icon="phone" />
            )}
          />

          <List.Item
            onPress={() => {}}
            title="Nom d'utilisateur"
            description={admin.username}
            left={(props) => (
              <List.Icon
                {...props}
                color={theme.colors.primary}
                icon="account-box"
              />
            )}
          />
        </S.InfoContainer>

        <Divider />
        <Card.Actions style={{justifyContent: 'center'}}>
          <Button onPress={() => setOpenDialog(true)} mode="outlined">
            Modifier mon compte
          </Button>
        </Card.Actions>
      </Card>

      <AccountDialog
        visible={openDialog}
        onDismiss={() => setOpenDialog(false)}
        addingState={addingState}
        updateAdmin={updateAdmin}
        resetLoading={resetLoading}
      />
    </S.Container>
  );
};

const mapStateToProps = (state) => ({
  admin: state.admin.data,
  addingState: state.admin.adding,
});

export default connect(mapStateToProps, {
  updateAdmin,
  resetLoading,
})(ProfilCard);
