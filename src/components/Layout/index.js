import React from "react";

import * as S from "./styles";

export default function Layout({ bg, children, ...rest }) {
  return (
    <S.Container {...rest} bg={bg}>
      {children}
    </S.Container>
  );
}
