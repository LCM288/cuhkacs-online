import React, { useReducer } from "react";
import { Hero, Heading, Icon } from "react-bulma-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWrench } from "@fortawesome/free-solid-svg-icons";
import App from "app";

const ConstructionSite = (): React.ReactElement => {
  const [count, increase] = useReducer((state) => state + 1, 0);
  if (count >= 20) {
    return <App />;
  }
  return (
    <Hero size="fullheight" color="warning">
      <Hero.Body>
        <Heading style={{ margin: "auto" }}>
          <div className="icon-text">
            This site is under construction
            <Icon className="ml-2" onClick={increase}>
              <FontAwesomeIcon icon={faWrench} />
            </Icon>
          </div>
        </Heading>
      </Hero.Body>
    </Hero>
  );
};

export default ConstructionSite;
