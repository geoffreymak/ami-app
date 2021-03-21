import styled from 'styled-components/native';

import {Button as PaperButtom, Headline} from 'react-native-paper';
export const Wrapper = styled.View`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Top = styled.ImageBackground`
  width: 100%;
  background-color: ${({theme}) => theme.colors.primary};
  flex: 1;
  border-bottom-left-radius: 30px;
  border-bottom-right-radius: 30px;
  justify-content: center;
  align-items: center;
  overflow: hidden;
`;

export const LogoContainer = styled.View`
  padding: 8px;
  border-radius: 8px;
`;
export const Bottom = styled.ImageBackground`
  width: 100%;
  flex: 1;
  justify-content: space-between;
  align-items: center;
  padding: 25px;
  background-color: transparent;
`;

export const Container = styled.View`
  width: 100%;
  flex: 1;
`;

export const LogoTitle = styled(Headline)`
  text-align: center;
  color: white;
  margin-top: 40px;
  font-size: 30px;
`;

export const FormContainer = styled.View`
  width: 100%;
  padding-top: 20px;
`;

export const ButtonContainer = styled.View`
  width: 100%;
`;

export const InputContainer = styled.View`
  margin: 0px 0;
`;

export const Button = styled(PaperButtom)`
  border-radius: 50px;
`;
