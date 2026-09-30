import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: "http://localhost:9098",
  realm: "micro-services",
  clientId: "neoshop",
});

export default keycloak;