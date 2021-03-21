import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, ScrollView, Dimensions} from 'react-native';
import {
  HelperText,
  TextInput,
  Avatar,
  useTheme,
  Card,
  IconButton,
  List,
  Colors,
  FAB,
  Chip,
} from 'react-native-paper';
/* import color from 'color'; */
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
//import  Autocomplete  from  "react-native-textinput-material-autocomplete"

import useSnackbar from '../../utils/hooks/useSnackbar';
import getFormatedNumber from '../../utils/formating/getFormatedNumber';

import Layout from '../Layout';
import * as S from './styles';

const windowHeight = Dimensions.get('window').height;
const defaultValues = {
  nom: '',
  adresse: '',
  telephone: '',
  mise: '',
  activite: '',
};

const defaultErrorValues = {
  nom: false,
  adresse: false,
  telephone: false,
  mise: false,
  activite: false,
};

export default function MembersForm({
  navigation,
  onAdd,
  onUpdate,
  addingState,
  updatedMember,
  removeMemberUpdate,
}) {
  const [values, setValues] = useState(defaultValues);
  const [error, setError] = useState(defaultErrorValues);
  const {loading, success} = addingState;
  const admin = useSelector((state) => state.admin.data);
  const members = useSelector((state) => state.members.data);

  const {showSnackbar, checkConnection} = useSnackbar();
  const handleReset = () => {
    setValues(defaultValues);
    setError(defaultErrorValues);
    removeMemberUpdate();
  };

  useFocusEffect(
    useCallback(() => {
      // Do something when the screen is focused
      return () => {
        handleReset();
      };
    }, []),
  );

  useEffect(() => {
    if (!!updatedMember) {
      setValues({
        nom: updatedMember.nom,
        adresse: updatedMember.adresse,
        telephone: updatedMember.telephone,
        mise: updatedMember.mise.toString(),
        activite: updatedMember.activite,
      });
    }
  }, [updatedMember]);

  useEffect(() => {
    if (success) {
      handleReset();
      showSnackbar('Operation effectuée avec succées !');
    }
  }, [success]);

  const handleAddOrUpdate = useCallback(() => {
    if (!checkConnection()) {
      return;
    }
    let hasEmptyField = false;
    let errorValues = defaultErrorValues;
    for (const field in values) {
      if (Object.hasOwnProperty.call(values, field)) {
        const value = values[field];
        if (!value) {
          hasEmptyField = true;
          errorValues = {...errorValues, [field]: 'Renseigner ce champ !'};
        }

        if (field === 'mise' && !parseFloat(value)) {
          hasEmptyField = true;
          errorValues = {...errorValues, mise: 'La mise est incorrect !'};
        }
      }
    }
    setError(errorValues);
    if (!hasEmptyField && !!admin) {
      if (!updatedMember) {
        const data = {
          ...values,
          isBlocked: false,
          mise: parseFloat(values.mise),
          code_admin: admin.code,
          isSuper: admin.attribut === 'A1',
        };
        onAdd(data);
      } else {
        const data = {
          ...values,
          mise: parseFloat(values.mise),
          code_admin_update: admin.code,
        };
        onUpdate(updatedMember, data);
      }
    }
  }, [values, admin, updatedMember, checkConnection]);

  const onChangeText = (field) => (text) => {
    setValues({...values, [field]: text});
  };

  const theme = useTheme();
  return (
    <>
      <ScrollView style={{flex: 1}}>
        <Layout>
          <S.Wrapper>
            <S.FormContainer>
              {success && !!members && !!members[0] && (
                <S.Card>
                  <S.Subheading>Membre precedent</S.Subheading>
                  <Card style={{marginBottom: 20}}>
                    <List.Item
                      onPress={() =>
                        navigation.navigate('Transaction', {member: members[0]})
                      }
                      title={members[0]?.nom}
                      style={{margin: 0, padding: 0}}
                      left={(props) => (
                        <Avatar.Icon
                          size={25}
                          icon="account"
                          style={{marginTop: 15, marginLeft: 10}}
                        />
                      )}
                      right={(props) => (
                        <IconButton
                          icon="bank-transfer"
                          style={{marginTop: 10}}
                          color={Colors.green700}
                          onPress={() => {}}
                        />
                      )}
                    />
                  </Card>
                </S.Card>
              )}

              <S.Card>
                <S.Subheading>Informations Personnel</S.Subheading>

                <S.InputContainer>
                  <TextInput
                    error={!!error.nom}
                    mode="flat"
                    dense
                    placeholder="Ex GEOFFREY MAKIANGANI"
                    label="Nom"
                    value={values.nom}
                    onChangeText={onChangeText('nom')}
                  />
                  <HelperText type="error" visible={!!error.nom}>
                    {error.nom}
                  </HelperText>
                </S.InputContainer>
                <S.InputContainer>
                  <TextInput
                    mode="flat"
                    dense
                    error={!!error.telephone}
                    label="Téléphone"
                    placeholder="Ex +243 82 335 872 1"
                    value={values.telephone}
                    keyboardType="phone-pad"
                    onChangeText={onChangeText('telephone')}
                  />
                  <HelperText type="error" visible={!!error.telephone}>
                    {error.telephone}
                  </HelperText>
                </S.InputContainer>
              </S.Card>

              <S.Card>
                <S.InputContainer>
                  <S.Subheading>Informations sur l'adresse</S.Subheading>

                  <TextInput
                    mode="flat"
                    dense
                    style={{backgroundColor: '#fff'}}
                    error={!!error.adresse}
                    label="Adresse"
                    placeholder="Ex 143 KIMWENZA MONT-NGAFULA"
                    multiline
                    numberOfLines={5}
                    value={values.adresse}
                    onChangeText={onChangeText('adresse')}
                  />
                  <HelperText type="error" visible={!!error.adresse}>
                    {error.adresse}
                  </HelperText>
                </S.InputContainer>
              </S.Card>

              <S.Card>
                <S.InputContainer>
                  <S.Subheading>Autre Informations</S.Subheading>

                  <TextInput
                    mode="flat"
                    dense
                    style={{backgroundColor: '#fff'}}
                    error={!!error.activite}
                    label="Activité"
                    placeholder="Ex INFORMATICIEN"
                    value={values.activite}
                    onChangeText={onChangeText('activite')}
                  />
                  <HelperText type="error" visible={!!error.activite}>
                    {error.activite}
                  </HelperText>
                </S.InputContainer>

                <S.InputContainer>
                  <TextInput
                    mode="flat"
                    dense
                    style={{backgroundColor: '#fff'}}
                    error={!!error.mise}
                    label="Mise"
                    value={
                      !!values.mise
                        ? getFormatedNumber(values.mise, true)
                        : null
                    }
                    keyboardType="numeric"
                    onChangeText={onChangeText('mise')}
                  />
                  <HelperText type="error" visible={!!error.mise}>
                    {error.mise}
                  </HelperText>
                </S.InputContainer>
              </S.Card>
            </S.FormContainer>

            <S.ButtonContainer></S.ButtonContainer>
          </S.Wrapper>
        </Layout>
      </ScrollView>
      <FAB
        icon="close"
        loading={loading}
        onPress={handleReset}
        disabled={loading}
        color={Colors.white}
        style={[styles.fab, {marginRight: 90, backgroundColor: Colors.pink500}]}
      />

      <FAB
        icon={!!updatedMember ? 'content-save-edit' : 'content-save'}
        loading={loading}
        disabled={loading}
        color={Colors.white}
        style={[styles.fab, {backgroundColor: Colors.green600}]}
        onPress={handleAddOrUpdate}
      />
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
