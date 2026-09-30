// import React from "react";
// import ReactDOM from "react-dom/client";
// import App from "./App";
// import "./index.css";
// import keycloak from "./auth/keycloak";
// import { CartProvider } from "./context/CartContext";
// import { WishlistProvider } from "./context/WishlistContext";

// keycloak
//   .init({
//     onLoad: "check-sso",
//     checkLoginIframe: false,
//   })
//   .then((authenticated) => {
//     console.log("Authenticated:", authenticated);

//     if (authenticated) {
//       console.log("KEYCLOAK TOKEN:", keycloak.token);
//     }

//     ReactDOM.createRoot(document.getElementById("root")!).render(
//       <React.StrictMode>
//         <CartProvider>
//           <WishlistProvider>
//             <App />
//           </WishlistProvider>
//         </CartProvider>
//       </React.StrictMode>
//     );
//   })
//   .catch((error) => {
//     console.error("Keycloak initialization failed:", error);
//   });

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import keycloak from "./auth/keycloak";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";

keycloak
  .init({
    onLoad: "check-sso",
    checkLoginIframe: false,
  })
  .then((authenticated) => {
    console.log("Authenticated:", authenticated);

    if (authenticated) {
      console.log("KEYCLOAK TOKEN:", keycloak.token);
    }

    ReactDOM.createRoot(
      document.getElementById("root")!
    ).render(
      <React.StrictMode>
        <CartProvider>
          <WishlistProvider>
            <App />
          </WishlistProvider>
        </CartProvider>
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error(
      "Keycloak initialization failed:",
      error
    );
  });