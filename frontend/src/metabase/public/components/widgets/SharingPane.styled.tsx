import styled from "@emotion/styled";
import { space } from "metabase/styled-components/theme";

interface Props {
  enableMouseEvents?: boolean;
}
export const Description = styled.p<Props>`
  line-height: 1.5;
  ${({ enableMouseEvents }) => enableMouseEvents && "pointer-events: initial"};

  &:not(:last-of-type) {
    margin-bottom: ${space(2)};
  }
`;
