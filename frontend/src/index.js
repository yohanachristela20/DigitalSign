import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";

import { BrowserRouter, Route, Router, Switch, Redirect } from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "./assets/css/animate.min.css";
import "./assets/scss/light-bootstrap-dashboard-react.scss?v=2.0.0";
import "./assets/css/demo.css";
import "@fortawesome/fontawesome-free/css/all.min.css";

import AdminLayout from "layouts/Admin.js";
import KaryawanLayout from "layouts/Karyawan.js";
import SuperAdminLayout from "layouts/SuperAdmin.js"; 
import Login from "views/Login.js";
import PrivateRoute from "components/PrivateRoute/PrivateRoute.js";

import { PlafondProvider } from "components/Provider/PlafondContext.js";
import { SignatureProvider } from "components/Provider/SignatureContext.js";
import { InitialProvider } from "components/Provider/InitialContext.js";
import { DateProvider } from "components/Provider/DateContext.js";
import Document from "views/Document.js";

import ReceiveDocument from "views/ReceiveDocument.js"; 

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Heartbeat from "views/Heartbeat.js";

const DisableBackButton = () => {
  useEffect(() => {
    // Mencegah kembali ke halaman sebelumnya
    const preventBack = () => {
      // history.pushState(null, null, location.href);
      window.history.forward();
    };

    preventBack(); 

  }, []);

  return null;
};

const root = ReactDOM.createRoot(document.getElementById("root"));

root.render(
  <PlafondProvider>
    <SignatureProvider>
    <InitialProvider>
    <DateProvider>
      <DisableBackButton />
        <BrowserRouter>
        <DisableBackButton />
        <ToastContainer />
          <Switch>
            <Route path="/login"  
            exact
                render={(props) => (
                  <Login
                    {...props}
                    onLoginSuccess={() => {
                      const lastRoute = localStorage.getItem("lastRoute"); 
                      localStorage.removeItem("lastRoute");
                      console.log("Last route: ", lastRoute);
                      props.history.push(lastRoute);
                    }}
                  />
                )} /> 

            <PrivateRoute path="/karyawan" roles={["Karyawan"]} render={(props) =>
              (
                <>
                <KaryawanLayout {...props} />
                <Heartbeat />
                </>
              )} />
            <PrivateRoute path="/admin" roles={["Admin"]} render={(props) => (
              <>
                <AdminLayout {...props} />
                <Heartbeat />
              </>
            ) } />
            <PrivateRoute path="/super-admin" roles={["Super Admin"]} render={(props) => (
              <>
                <SuperAdminLayout {...props} />
                <Heartbeat />
              </>
            )} />

            <Route path="/document" element={<Document />} />
            <Route path="/user/envelope" component={ReceiveDocument} />
            {/* <Route path="/user/envelope" /> */}
            <Redirect from="/" to="/login" />

          </Switch>
        </BrowserRouter>
    </DateProvider>
    </InitialProvider>
    </SignatureProvider>
  </PlafondProvider>
);
