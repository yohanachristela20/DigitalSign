import React, { Component } from "react";
import { useLocation, Route, Switch } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Footer from "components/Footer/Footer";
import Side from "../components/Sidebar/Sidebar.js";
import ToolbarFields from "../components/Sidebar/ToolbarFields.js";
import UploadDocument from "views/UploadDocument.js";
import routes from "routes.js";
import sidebarImage from "assets/img/sidebar-3.jpg";

function Admin() {
  const [image, setImage] = React.useState(sidebarImage);
  const [color, setColor] = React.useState("black");
  const [hasImage, setHasImage] = React.useState(true);
  const location = useLocation();
  const mainPanel = React.useRef(null);

  const token = localStorage.getItem("token");
  const [stepStepper, setStepStepper] = React.useState(parseInt(localStorage.getItem("steps")) || 1);
  const isUploadDocumentPage = location.pathname === "/admin/upload-document";

  // console.log("TOKEN:", token);
  console.log("stepStepper from upload doc:", stepStepper);  

  const getRoutes = (routes) => {
    return routes.map((prop, key) => {
      if (prop.layout === "/admin") {
        return (
          <Route
            path={prop.layout + prop.path}
            render={(props) => <prop.component {...props} />}
            key={key}
          />
        );
      } 
        return null;
    });
  };

  React.useEffect(() => {
    if (isUploadDocumentPage) {
      const interval = setInterval(() => {
        const currentStep = parseInt(localStorage.getItem("steps")) || 1;
        setStepStepper(currentStep);
      }, 500);
      return() => clearInterval(interval);
    }
  }, [isUploadDocumentPage]);

  React.useEffect(() => {
  document.documentElement.scrollTop = 0;
  document.scrollingElement.scrollTop = 0;
  if (mainPanel.current) mainPanel.current.scrollTop = 0;

  if (
    window.innerWidth < 993 &&
    document.documentElement.className.includes("nav-open")
  ) {
    document.documentElement.classList.toggle("nav-open");
    const element = document.getElementById("bodyClick");
    if (element) element.parentNode.removeChild(element);
  }
}, [location]);


  // return (
  //   <div className="main w-100">
  //     {isUploadDocumentPage? (
  //         // <Side color={color} image={hasImage ? image : ""} routes={routes}/>
  //         <ToolbarFields color={color} image={hasImage ? image : ""} routes={routes}/>  
  //       ) : (
  //         <Side color={color} image={hasImage ? image : ""} routes={routes}/>
  //         // <ToolbarFields color={color} image={hasImage ? image : ""} routes={routes}/>  
  //       )}
  //     <div ref={mainPanel} className="w-100">
  //       <AdminNavbar />
  //       <div className="content">
  //         <Switch>{getRoutes(routes)}</Switch>
  //       </div>
  //       {/* <Footer /> */}
  //     </div>
  //   </div>
  // );

return (
  <div className="main w-100">
    { token && isUploadDocumentPage && stepStepper === 3 ? (
      <ToolbarFields color={color} image={hasImage ? image : ""} routes={routes}/>  
    ) : (
      <Side color={color} image={hasImage ? image : ""} routes={routes}/>
    )}
    
    <div ref={mainPanel} className="w-100">
      <AdminNavbar />
      <div className="content">
        <Switch>
          {routes.map((prop, key) => {
            if (prop.layout === "/admin") {
              if (prop.path === "/upload-document") {
                return (
                  <Route
                    key={key}
                    path="/admin/upload-document"
                    render={(props) => (
                      <UploadDocument {...props} steps={stepStepper} setSteps={() => {}} 
                      />
                      
                    )}
                  />
                );
              }
              return (
                <Route
                  key={key}
                  path={prop.layout + prop.path}
                  render={(props) => <prop.component {...props} />}
                />
              );
            }
            return null;
          })}
        </Switch>
      </div>
    </div>
  </div>
);



}

export default Admin;
