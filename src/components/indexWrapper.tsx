import React from "react";
import { Section, Container } from "react-bulma-components";

interface Props {
  children: React.ReactNode;
}

const IndexWrapper = ({ children }: Props): React.ReactElement => (
  <Section className="pt-0">
    <Container
      className="has-text-centered"
      style={{
        minWidth: "75vw",
        borderRadius: ".25rem",
      }}
    >
      {children}
    </Container>
  </Section>
);

export default IndexWrapper;
