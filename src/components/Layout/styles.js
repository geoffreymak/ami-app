import styled from 'styled-components/native';

import {Surface, Colors} from 'react-native-paper';

export const Container = styled(Surface)`
  flex: 1;
  padding: 20px;
  background-color: transparent;
  ${({bg}) => bg && `background-color: ${Colors.grey100}`};
`;
