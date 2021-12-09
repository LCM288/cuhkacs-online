import React from "react";
import { Hero, Heading } from "react-bulma-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench } from "@fortawesome/free-solid-svg-icons";

const ConstructionSite = (): React.ReactElement => {
  return (
    <Hero size="fullheight" color="warning">
      <Hero.Body>
        <Heading style={{ margin: "auto" }}>
          This site is under construction <FontAwesomeIcon icon={faWrench} />
        </Heading>
      </Hero.Body>
    </Hero>
  );
};

export default ConstructionSite;
