// w/ positioning field when clicked

import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import "../../assets/scss/lbd/_toolbar-fields.scss";
import axios from "axios";
import { Button} from "react-bootstrap";
import {
  CDBSidebarContent,
} from 'cdbreact';
import { toast } from "react-toastify";

function ToolbarFields ({ color, routes}) {
  const role = localStorage.getItem("role");
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [category, setCategory] = useState([]);
  const [id_karyawan, setIdKaryawan] = useState("");
  const [signersDoc, setSignersDoc] = useState([]);
  const token = localStorage.getItem("token");
  const [dokumenUploaded, setDokumenUploaded] = React.useState(localStorage.getItem("id_dokumen") || "No document"); 
  const identitycolor = ['#f06292', '#f44336', '#ec407a', '#e91e63', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#9575cd', '#7e57c2', '#673AB7']; 
  const signersCount = signersDoc.length;

  let [signatureClicked, setSignatureClicked] = useState(false);
  let [initialClicked, setInitialClicked] = useState(false);
  let [dateFieldClicked, setDateFieldClicked] = useState(false);

  const [signersWithSignature, setSignersWithSignature] = useState([]);

  const updateClickedFields = (field) => {
    const existing = JSON.parse(localStorage.getItem("clickedFields")) || [];
    if (!existing.includes(field)) {
      existing.push(field);
      localStorage.setItem("clickedFields", JSON.stringify(existing));
    }
  };

  const handleAddSignature = () => {
    if (!signersWithSignature.includes(id_karyawan)) {
      setSignersWithSignature(prev => [...prev, id_karyawan]);
    }

    if (!id_karyawan) {
      toast.error("Please choose signer first.");
      return;
    }

    setSignatureClicked(true);
    localStorage.setItem("signatureClicked", true);
    localStorage.setItem("currentSigner", id_karyawan);
    localStorage.setItem("currentTool", "Signpad");
    updateClickedFields("Signpad");
    window.dispatchEvent(new Event("localStorageUpdated"));
  };

  const handleAddInitials = () => {
    if (!signersWithSignature.includes(id_karyawan)) {
      setSignersWithSignature(prev => [...prev, id_karyawan]);
    }

    if (!id_karyawan) {
      toast.error("Please choose signer first.");
      return;
    }

    setInitialClicked(true);
    localStorage.setItem("initialClicked", true);
    localStorage.setItem("currentSigner", id_karyawan);
    localStorage.setItem("currentTool", "Initialpad");
    updateClickedFields("Initialpad");
    window.dispatchEvent(new Event("localStorageUpdated"));
  };

  const handleAddDate = () => {
    if (!signersWithSignature.includes(id_karyawan)) {
      setSignersWithSignature(prev => [...prev, id_karyawan]);
    }

    if (!id_karyawan) {
      toast.error("Please choose signer first.");
      return;
    }

    setDateFieldClicked(true);
    localStorage.setItem("dateFieldClicked", true);
    localStorage.setItem("currentSigner", id_karyawan);
    localStorage.setItem("currentTool", "Date");
    updateClickedFields("Date");
    window.dispatchEvent(new Event("localStorageUpdated"));
  };

  const handleCopyFields = () => {
    const currentTool = localStorage.getItem("currentTool");
    const currentSigner = localStorage.getItem("currentSigner");

    if (!currentTool || !currentSigner) {
      toast.error("Please choose signer and field type first.");
      return;
    }

    const signatures = JSON.parse(localStorage.getItem("signatures")) || [];
    const initials = JSON.parse(localStorage.getItem("initials")) || [];
    const dates = JSON.parse(localStorage.getItem("dateField")) || [];

    let selectedFieldArray = [];
    if (currentTool === "Signpad") selectedFieldArray = signatures;
    else if (currentTool === "Initialpad") selectedFieldArray = initials;
    else if (currentTool === "Date") selectedFieldArray = dates;

    if (selectedFieldArray.length === 0) {
      toast.error("No field selected to copy.");
      return;
    }

    const selectedField = selectedFieldArray[selectedFieldArray.length - 1];
    if (!selectedField) return;

    localStorage.setItem(
      "copyToAllPagesField",
      JSON.stringify({
        x_axis: selectedField.x_axis, 
        y_axis: selectedField.y_axis, 
        width: selectedField.width,
        height: selectedField.height,
        jenis_item: selectedField.jenis_item, 
        id_karyawan: selectedField.id_karyawan, 
        page: selectedField.page,
      })
    );

    window.dispatchEvent(new Event("copyToAllPages"));
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const [isOpen, setIsOpen] = useState(false);
  const [freeSelection, setFreeSelection] = useState(localStorage.getItem("freeSignerSelection") === "true");

  const selectedOption = signersDoc.find(opt => opt.value === id_karyawan);

  const handleSelect = (value) => {
    handleSignersChange({ target: { value } });
    setIsOpen(false);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      const currentDoc = localStorage.getItem("id_dokumen") || "Document doesn't exist.";
      setDokumenUploaded(currentDoc);
    }, 500);
    return() => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setFreeSelection(localStorage.getItem("freeSignerSelection") === "true");
    };
    window.addEventListener("freeSignerSelectionChange", handleStorageChange);
    return () => window.removeEventListener("freeSignerSelectionChange", handleStorageChange);
  }, []);

    const handleSignerClick = (option, index) => {
    if (!freeSelection && index > 0) {
      const previousSigner = signersDoc[index - 1].value;
      if (!signersWithSignature.includes(previousSigner)) {
        alert("Previous signer should be set first.");
        return;
      }
    }

    handleSelect(option.value);
  };

  const categoryDoc = async() => {
      try {
          const response = await axios.get('http://10.70.10.20:5000/category', {
              headers: {
                  Authorization: `Bearer ${token}`,
              }
          });
          const newCategory = response.data.map(item => ({
              value: item.id_kategoridok,
              label: item.kategori,
          }));
          setCategory(newCategory);
      } catch (error) {
          console.error("Error fetching data:", error.message); 
      }
  }

  const getSignersDoc = async() => {
    try {
        const response = await axios.get('http://10.70.10.20:5000/signer', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        const data = response.data;

        const mapped = Array.isArray(data) ? data.map((item, index) => ({
          value: item.id_karyawan,
          label: item.Penandatangan?.nama || `Signer ${index + 1}`,
          color: identitycolor[index % identitycolor.length]
        })) : [];

        setSignersDoc(mapped);
    } catch (error) {
        console.error("Error fetching PDF:", error);
    }
  }; 

  useEffect(() => {
    categoryDoc();
    getSignersDoc();
  }, []);

  useEffect(() => {
    localStorage.setItem("signers", JSON.stringify(signersDoc));
    localStorage.setItem("signersCount", signersCount.toString());
    localStorage.setItem("selectedOption", JSON.stringify(selectedOption));

    window.dispatchEvent(new Event("localStorageUpdated"));
  }, [signersDoc, signersCount, selectedOption]);

  const handleSignersChange = (event) => {
      setIdKaryawan(event.target.value);
  }

  const activeRoute = (routeName) => location.pathname.includes(routeName);

  const filteredRoutes = routes.filter(
    (route) => !["/screening-karyawan", "/login", "/surat-pernyataan", "/document", "/preview-doc"].includes(route.path)
  );


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
    <div className="sidebar" style={{backgroundColor:"#ffa7a5"}}>
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

        <a style={{fontSize:'15px'}}><strong>Signers</strong></a>
        <ul className="items">
          <div className="custom-select-wrapper">
          <div
            className="custom-select"
            onClick={() => setIsOpen(prev => !prev)}
          >
            <div className="selected-option">
              <div
                className="identity-color"
                style={{ backgroundColor: selectedOption?.color || '' }}
              />
              {selectedOption?.label || "Choose Signer" }
            </div>
          </div>

          {isOpen && (
            <div className="custom-options">
              {signersDoc.map((option, index) => {
                let isDisabled = index > 0 && !signersWithSignature.includes(signersDoc[index - 1].value);
                if (freeSelection) isDisabled = false;

                return (
                  <div
                    key={option.value}
                    className={`custom-option ${isDisabled ? 'disabled' : ''}`}
                    onClick={() => {
                      if (!isDisabled) handleSignerClick(option, index);
                    }}
                    style={{ opacity: isDisabled ? 0.5 : 1, pointerEvents: isDisabled ? 'none' : 'auto' }}
                  >
                    <div
                      className="identity-color"
                      style={{
                        backgroundColor: identitycolor[index % identitycolor.length] || '#f06292',
                      }}
                    />
                    {option.label}
                  </div>
                );
              })}

            </div>
          )}

          </div>
        </ul>

        <a style={{fontSize:'15px'}}><strong>Signature Fields</strong></a>
        <ul className="items">
          <Button
            type="button"
            className="btn mb-3 bg-transparent mt-2"
            style={{width:"230px", border:"1px solid #eed4dd"}}
            onClick={handleAddSignature}>
            <i class="fa fa-signature" style={{ marginRight: '8px' }}></i>
              Signature
          </Button>
          <Button
            type="button"
            className="btn mb-3 bg-transparent mt-2"
            style={{width:"230px", border:"1px solid #eed4dd"}}
            onClick={handleAddInitials}>
            <i class="fa fa-font" style={{ marginRight: '8px' }}></i>
              Initial
          </Button>
          <Button
            type="button"
            className="btn mb-3 bg-transparent mt-2"
            style={{width:"230px", border:"1px solid #eed4dd"}}
            onClick={handleAddDate}>
            <i class="fa fa-calendar" style={{ marginRight: '8px' }}></i>
              Date Signed
          </Button>
        </ul>
        <br />

        <Button 
          type="button"
          className="btn mb-3 bg-transparent mt-2"
          style={{width:"230px", border:"1px solid #eed4dd"}}
          onClick={handleCopyFields}
        >
          <i class="fa fa-signature" style={{marginRight: '8px'}}></i>
          Copy to all pages
        </Button>
      </CDBSidebarContent>
    </div>
  );
};

export default ToolbarFields;

