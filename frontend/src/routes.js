import EmployeeManagement from "views/EmployeeManagement.js";
import MasterUser from "views/MasterUser.js";
import Document from "views/Document.js";
import UploadDocument from "views/UploadDocument.js";

import ReceiveDocument from "views/ReceiveDocument.js";
import DocumentSent from "views/DocumentSent.js";

import Login from "views/Login.js";
import PreviewDocument from "views/PreviewDocument";

import Trash from "views/Trash.js";

const dashboardRoutes = [
  // ADMIN
  {
    path: "/all-document",
    name: "All Document",
    icon: "folder",
    component: Document,
    layout: "/admin"
  },
  {
    path: "/upload-document",
    name: "Upload Document",
    icon: "file",
    component: UploadDocument,
    layout: "/admin"
  },
  {
    path: "/trash",
    name: "Trash",
    icon: "trash",
    component: Trash,
    layout: "/admin"
  },
  {
    path: "/preview-doc",
    name: "Preview Document",
    icon: "file",
    component: PreviewDocument,
    layout: "/admin",
  },
  {
    path: "/document-sent", 
    name: "Document Sent", 
    component: DocumentSent,
    layout: "/admin",
  },

  {
    path: "/envelope",
    name: "Receive Document",
    component: ReceiveDocument,
    layout: "/user"
  },
  


  //LOGIN PAGE
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-single-02",
    component: Login,
    layout: "/"
  },


  // SUPER ADMIN
  {
    path: "/employee-management",
    name: "Employee Management",
    icon: "users",
    component: EmployeeManagement,
    layout: "/super-admin"
  },
  {
    path: "/master-user",
    name: "Master User",
    icon: "users",
    component: MasterUser,
    layout: "/super-admin"
  },


  {
    path: "/document",
    name: "Document",
    icon: "nc-icon nc-circle-09",
    component: Document,
    layout: "/admin"
  },

  
];

export default dashboardRoutes;
