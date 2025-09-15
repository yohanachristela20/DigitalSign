import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import "../../assets/scss/lbd/_sidebar-and-main-panel.scss";
import FolderTree from "components/Folders/FolderTree.js";
import axios from "axios";

import {
  CDBSidebar,
  CDBSidebarContent,
} from 'cdbreact';


const Sidebar = ({ color, routes }) => {
  const role = localStorage.getItem("role");
  const location = useLocation();
  const currentPath = location.pathname;

  const sidebarWidth = currentPath === "/admin/upload-document" || currentPath === "/admin/trash" || currentPath === "/admin/document-sent"
  ? "250px" 
  : "370px";

  const [openMenus, setOpenMenus] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [detailCategory, setDetailCategory] = useState("");
  const [kategori, setKategori] = useState("");
  
  const token = localStorage.getItem("token");

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCategory = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/category", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      // console.log("response.data:", response.data);
      setCategory(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    getCategory();
  }, []);


const folders = [
  {
    name: 'My Documents',
    children: Array.isArray(category)? 
      category.map((item) => ({
      name: item.kategori})) : [],
  },
];

  // console.log("folders: ", folders);

  const activeRoute = (routeName) => location.pathname.includes(routeName);

  const filteredRoutes = routes.filter(
    (route) => !["/screening-karyawan", "/login", "/surat-pernyataan", "/document", "/preview-doc", "/document-sent"].includes(route.path)
  );

  const roleFilteredRoutes = filteredRoutes.filter((route) => {
    if (role === "Admin") return route.layout === "/admin";
    if (role === "Karyawan") return route.layout === "/karyawan";
    if (role === "Super Admin") return route.layout === "/super-admin";

    return false;
  });

  const renderMenuItems = (routes, parentKey = "") => {
    return routes.map((route, idx) => {
      const key = parentKey + idx;
      const fullPath = route.layout + route.path;
      const isActive = activeRoute(fullPath);
      const hasChildren = route.children && route.children.length > 0;
      const isOpen = openMenus[key];

      return (
        <li key={key} className={`items-menu ${hasChildren ? 'has-children' : ''} ${isActive ? 'active' : ''}`}>
          <div className="menu-title" onClick={() => hasChildren ? toggleMenu(key) : null}>
            <i className={`fas fa-${route.icon}`} style={{ marginRight: 10 }} />
            {hasChildren ? (
              <span style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                {route.name}
                <i className={`fas fa-chevron-${isOpen ? "down" : "right"} mt-1`} />
              </span>
            ) : (
              <NavLink to={fullPath} className="nav-link" activeClassName="active">
                {route.name}
              </NavLink>
            )}
          </div>

          {hasChildren && isOpen && (
            <ul className="submenu-items">
              {renderMenuItems(route.children, key + "-")}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <div className="sidebar" style={{
      width: sidebarWidth,
      transition: "width 0.3s",
    }}>
      <CDBSidebarContent>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <label className="toggle-button">
            <input
              type="checkbox"
              checked={isSidebarCollapsed}
              onChange={(e) => setIsSidebarCollapsed(e.target.checked)}
            />
            <img
              src={require("assets/img/logo4.png")}
              alt="sidebar-logo"
              style={{ width: '30px' }}
              className="img-items"
            />
          </label>
          <h6 className="ms-3 mt-2">Campina Sign</h6>
        </div>
        <hr />
        <ul className="items">
          {renderMenuItems(roleFilteredRoutes)}
        </ul>
      </CDBSidebarContent>
      <hr />
      {!isSidebarCollapsed && role === "Admin" && <FolderTree folders={folders} />}
    </div>
  );
};

export default Sidebar;

