import React, {useState, useEffect, useCallback} from 'react';
import {
  StyleSheet,
  ScrollView,
  Dimensions,
  View,
  TouchableHighlight,
} from 'react-native';
import {
  HelperText,
  TextInput,
  Headline,
  useTheme,
  Subheading,
  Dialog,
  Button,
  Colors,
  Divider,
  Checkbox,
} from 'react-native-paper';
import {useFocusEffect} from '@react-navigation/native';
import {useSelector} from 'react-redux';
import Layout from '../Layout';
import * as S from './styles';

import useSnackbar from '../../utils/hooks/useSnackbar';
const windowHeight = Dimensions.get('window').height;
const defaultValues = {
  nom: '',
  telephone: '',
  oldPassword: '',
  newPassword: '',
};

const defaultErrorValues = {
  nom: false,
  telephone: false,
  oldPassword: false,
  newPassword: false,
};

export default function AccountForm({
  onUpdate,
  addingState,
  onDismiss,
  resetLoading,
}) {
  const [values, setValues] = useState(defaultValues);
  const [checked, setChecked] = useState(false);
  const [oldPwdVisible, setOldPwdVisible] = useState(false);
  const [newPwdVisible, setNewPwdVisible] = useState(false);
  const [error, setError] = useState(defaultErrorValues);
  const {loading, success} = addingState;
  const admin = useSelector((state) => state.admin.data);
  const theme = useTheme();
  const {showSnackbar, checkConnection} = useSnackbar();

  const handleReset = () => {
    setValues(defaultValues);
    setError(defaultErrorValues);
    onDismiss();
  };

  useEffect(() => {
    if (success) {
      handleReset();
      resetLoading();
      showSnackbar('Votre compte a été modifier avec succé');
    }
  }, [success]);

  useEffect(() => {
    if (!!admin) {
      setValues({
        nom: admin.nom,
        telephone: admin.telephone,
        oldPassword: '',
        newPassword: '',
      });
    }
  }, [admin]);

  const handleUpdate = useCallback(() => {
    if (!checkConnection()) return;
    let hasEmptyField = false;
    let errorValues = defaultErrorValues;
    for (const field in values) {
      if (Object.hasOwnProperty.call(values, field)) {
        const value = values[field].trim();
        if (!checked) {
          if (!value && (field === 'nom' || field === 'telephone')) {
            hasEmptyField = true;
            errorValues = {...errorValues, [field]: 'Renseigner ce champ !'};
          }
        } else {
          if (!value) {
            hasEmptyField = true;
            errorValues = {...errorValues, [field]: 'Renseigner ce champ !'};
          }
        }
      }
    }
    setError(errorValues);

    if (!hasEmptyField && !!admin) {
      let data = {nom: values.nom, telephone: values.telephone};
      if (checked) {
        if (values.oldPassword === admin.password) {
          data = {
            ...data,
            password: values.newPassword,
          };
        } else {
          setError({
            ...errorValues,
            oldPassword: 'Votre mot de passe est incorrect !',
          });
          return;
        }
      }
      onUpdate(admin, data, true);
    }
  }, [values, admin, checked]);

  const onChangeText = (field) => (text) => {
    setValues({...values, [field]: text});
  };

  return (
    <>
      <Dialog.ScrollArea>
        <ScrollView style={{flex: 1}}>
          <S.Wrapper>
            <S.FormContainer>
              <S.InputContainer>
                <TextInput
                  dense
                  error={!!error.nom}
                  mode="flat"
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
                  value={values.telephone}
                  keyboardType="numeric"
                  onChangeText={onChangeText('telephone')}
                />
                <HelperText type="error" visible={!!error.telephone}>
                  {error.telephone}
                </HelperText>
              </S.InputContainer>

              <S.Separator />
              <TouchableHighlight
                style={{marginBottom: 15}}
                underlayColor={'transparent'}
                onPress={() => {
                  setChecked(!checked);
                }}>
                <View style={{flexDirection: 'row'}}>
                  <Subheading
                    style={{paddingTop: 2, color: theme.colors.primary}}>
                    Changer de mot de passe :
                  </Subheading>
                  <Checkbox status={checked ? 'checked' : 'unchecked'} />
                </View>
              </TouchableHighlight>
              <S.InputContainer>
                <TextInput
                  disabled={!checked}
                  mode="flat"
                  dense
                  secureTextEntry={!oldPwdVisible}
                  right={
                    <TextInput.Icon
                      disabled={!checked}
                      icon={!oldPwdVisible ? 'eye-outline' : 'eye-off-outline'}
                      onPress={() => setOldPwdVisible(!oldPwdVisible)}
                    />
                  }
                  error={!!error.oldPassword}
                  label="Ancien mot de passe"
                  value={values.oldPassword}
                  onChangeText={onChangeText('oldPassword')}
                />
                <HelperText type="error" visible={!!error.oldPassword}>
                  {error.oldPassword}
                </HelperText>
              </S.InputContainer>

              <S.InputContainer>
                <TextInput
                  disabled={!checked}
                  mode="flat"
                  dense
                  secureTextEntry={!newPwdVisible}
                  right={
                    <TextInput.Icon
                      disabled={!checked}
                      icon={!newPwdVisible ? 'eye-outline' : 'eye-off-outline'}
                      onPress={() => setNewPwdVisible(!newPwdVisible)}
                    />
                  }
                  error={!!error.newPassword}
                  label="Nouveau mot de passe"
                  value={values.newPassword}
                  onChangeText={onChangeText('newPassword')}
                />
                <HelperText type="error" visible={!!error.newPassword}>
                  {error.newPassword}
                </HelperText>
              </S.InputContainer>
            </S.FormContainer>

            <S.ButtonContainer></S.ButtonContainer>
          </S.Wrapper>
        </ScrollView>
      </Dialog.ScrollArea>

      <Dialog.Actions style={{justifyContent: 'flex-end'}}>
        <Button loading={loading} disabled={loading} onPress={onDismiss}>
          annuler
        </Button>
        <Button loading={loading} disabled={loading} onPress={handleUpdate}>
          confirmer
        </Button>
      </Dialog.Actions>
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
