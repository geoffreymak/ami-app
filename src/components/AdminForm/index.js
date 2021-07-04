import React, {useState, useEffect, useCallback} from 'react';
import {StyleSheet, ScrollView, Dimensions, View} from 'react-native';
import {
  HelperText,
  TextInput,
  Headline,
  useTheme,
  RadioButton,
  Colors,
  FAB,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';

import useSnackbar from '../../utils/hooks/useSnackbar';

import Layout from '../Layout';
import ConfirmDialog from '../ConfirmDialog';

import * as S from './styles';

const windowHeight = Dimensions.get('window').height;
const defaultValues = {
  nom: '',
  telephone: '',
  username: '',
  password: '',
};

const defaultErrorValues = {
  nom: false,
  telephone: false,
  username: false,
  password: false,
};

export default function AdminForm({
  navigation,
  onAdd,
  onUpdate,
  addingState,
  onDelete,
  removeAdminUpdate,
}) {
  const [values, setValues] = useState(defaultValues);
  const [attribut, setAttribut] = useState('A3');
  const [visible, setVisible] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [error, setError] = useState(defaultErrorValues);
  const {loading, success, error: addingError} = addingState;
  const {data: admin, updatedAdmin} = useSelector((state) => state.admin);
  const theme = useTheme();
  const {showSnackbar, checkConnection} = useSnackbar();

  const handleReset = () => {
    setValues(defaultValues);
    setError(defaultErrorValues);
    setAttribut('A3');
    removeAdminUpdate();
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
    if (!!updatedAdmin) {
      setValues({
        nom: updatedAdmin.nom,
        telephone: updatedAdmin.telephone,
        username: updatedAdmin.username,
        password: updatedAdmin.password,
      });
      setAttribut(updatedAdmin.attribut);
    }
  }, [updatedAdmin]);

  useEffect(() => {
    if (success) {
      handleReset();
      showSnackbar('Operation effectuée avec succées !');
    }
  }, [success]);

  const onConfirmDeleteResponse = useCallback(
    (response) => {
      setDeleteConfirm(false);
      if (response === true && !!updatedAdmin) {
        onDelete(updatedAdmin);
      }
    },
    [updatedAdmin],
  );

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
          errorValues = {...errorValues, [field]: true};
        }
      }
    }
    setError(errorValues);

    if (!hasEmptyField && !!admin) {
      if (!updatedAdmin) {
        const data = {
          ...values,
          code_admin: admin.code,
          attribut,
        };
        onAdd(data);
      } else {
        onUpdate(updatedAdmin, values);
      }
    }
  }, [values, attribut, admin, updatedAdmin, checkConnection]);

  const onChangeText = (field) => (text) => {
    setValues({...values, [field]: text});
  };

  return (
    <>
      <ScrollView style={{flex: 1}}>
        <Layout>
          <S.Wrapper>
            <S.FormContainer>
              <S.Card>
                <S.Subheading>Informations Personnel</S.Subheading>

                <S.InputContainer>
                  <TextInput
                    error={error.nom}
                    mode="flat"
                    dense
                    label="Nom"
                    value={values.nom}
                    onChangeText={onChangeText('nom')}
                  />
                  <HelperText type="error" visible={error.nom}>
                    Renseigner ce champ !
                  </HelperText>
                </S.InputContainer>

                <S.InputContainer>
                  <TextInput
                    mode="flat"
                    dense
                    error={error.telephone}
                    label="Téléphone"
                    value={values.telephone}
                    keyboardType="numeric"
                    onChangeText={onChangeText('telephone')}
                  />
                  <HelperText type="error" visible={error.telephone}>
                    Renseigner ce champ !
                  </HelperText>
                </S.InputContainer>
              </S.Card>

              <S.Card>
                <S.Subheading>Informations Confidentiel</S.Subheading>
                <S.InputContainer>
                  <TextInput
                    mode="flat"
                    dense
                    error={
                      error.username || (!!addingError && addingError.username)
                    }
                    label="Nom d'utilisateur"
                    value={values.username}
                    onChangeText={onChangeText('username')}
                  />
                  <HelperText type="error" visible={error.username}>
                    {(addingError && addingError.username) ||
                      'Renseigner ce champ !'}
                  </HelperText>
                </S.InputContainer>

                <S.InputContainer>
                  <TextInput
                    mode="flat"
                    dense
                    error={error.password}
                    secureTextEntry={!visible}
                    right={
                      <TextInput.Icon
                        icon={!visible ? 'eye-outline' : 'eye-off-outline'}
                        onPress={() => setVisible(!visible)}
                      />
                    }
                    label="Mot de passe"
                    value={values.password}
                    onChangeText={onChangeText('password')}
                  />
                  <HelperText type="error" visible={error.password}>
                    Renseigner ce champ !
                  </HelperText>
                </S.InputContainer>

                <S.InputContainer>
                  <View style={{marginBottom: 10}}>
                    <RadioButton.Group
                      onValueChange={(attribut) => setAttribut(attribut)}
                      value={attribut}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <S.Subheading style={{marginTop: 5}}>
                            Collecteur
                          </S.Subheading>
                          <RadioButton
                            disabled={!!updatedAdmin}
                            value="A3"
                            color={theme.colors.primary}
                          />
                        </View>
                        <View
                          style={{
                            flexDirection: 'row',
                          }}>
                          <S.Subheading style={{marginTop: 5}}>
                            Superviseur
                          </S.Subheading>
                          <RadioButton
                            disabled={!!updatedAdmin || admin.attribut !== 'A1'}
                            value="A2"
                            color={theme.colors.primary}
                          />
                        </View>
                      </View>
                    </RadioButton.Group>
                  </View>
                </S.InputContainer>
              </S.Card>
            </S.FormContainer>

            <S.ButtonContainer></S.ButtonContainer>
          </S.Wrapper>
        </Layout>
      </ScrollView>
      {!updatedAdmin ? (
        <FAB
          icon="close"
          loading={loading}
          onPress={handleReset}
          disabled={loading}
          color={Colors.white}
          style={[
            styles.fab,
            {marginRight: 90, backgroundColor: Colors.pink500},
          ]}
        />
      ) : (
        <FAB
          icon="delete"
          loading={loading}
          onPress={() => setDeleteConfirm(true)}
          disabled={loading}
          color={Colors.white}
          style={[
            styles.fab,
            {marginRight: 90, backgroundColor: Colors.pink500},
          ]}
        />
      )}

      <FAB
        icon={!!updatedAdmin ? 'content-save-edit' : 'content-save'}
        loading={loading}
        disabled={loading}
        color={Colors.white}
        style={[styles.fab, {backgroundColor: Colors.green600}]}
        onPress={handleAddOrUpdate}
      />

      <ConfirmDialog
        visible={deleteConfirm}
        onDismiss={onConfirmDeleteResponse}
        title="Confirmation"
        message="Etes vous sûr de vouloir supprimer cet administrateur ?"
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
