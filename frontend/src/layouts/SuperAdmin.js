import React from "react";
import { useLocation, Route, Switch } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Sidebar from "../components/Sidebar/Sidebar.js";

import routes from "routes.js";

import sidebarImage from "assets/img/sidebar-3.jpg";
import "../assets/scss/lbd/_admin.scss";

function SuperAdmin() {
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  const location = useLocation();
  const mainPanel = React.useRef(null);
  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/super-admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            render={(props) => <prop.component {...props} />}
            key={key}
          />
        );
      } else {
        return null;
      }
    });
  };
  React.useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.scrollingElement.scrollTop = 0;
    mainPanel.current.scrollTop = 0;
    if (
      window.innerWidth < 993 &&
      document.documentElement.className.indexOf("nav-open") !== -1
    ) {
      document.documentElement.classList.toggle("nav-open");
      var element = document.getElementById("bodyClick");
      element.parentNode.removeChild(element);
    }
  }, [location]);
  return (
    <div className="d-flex" style={{height: '100vh'}}>
      <Sidebar color={color} image={hasImage ? image : ""} routes={routes} />
      <div ref={mainPanel} className="content-container flex-grow-1">
        <AdminNavbar />
        <div className="content">
          <Switch>{getRoutes(routes)}</Switch>
        </div>
      </div>
    </div>
  );
}

export default SuperAdmin;
