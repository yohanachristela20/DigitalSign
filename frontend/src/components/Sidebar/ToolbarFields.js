import React, { useEffect, useState } from "react";
import { useLocation, NavLink } from "react-router-dom";
import { Nav } from "react-bootstrap";
import "../../assets/scss/lbd/_toolbar-fields.scss";
import FolderTree from "components/Folders/FolderTree.js";
import axios from "axios";
import { Button, Form, Row, Col } from "react-bootstrap";
import {
  CDBSidebar,
  CDBSidebarContent,
} from 'cdbreact';
import ResizableDragable from "components/ResizeDraggable/rnd";
import { useSignature } from "components/Provider/SignatureContext.js";

function ToolbarFields ({ color, routes}) {
  const role = localStorage.getItem("role");
  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [category, setCategory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailCategory, setDetailCategory] = useState("");
  const [kategori, setKategori] = useState("");
  const [id_kategoridok, setIdKategoriDok] = useState("");
  const [id_signers, setIdSigners] = useState("");
  const [signersDoc, setSignersDoc] = useState([]);
  const selectedSigner = location?.state?.selectedSigner || null;
  
  const token = localStorage.getItem("token");
  const [dokumenUploaded, setDokumenUploaded] = React.useState(localStorage.getItem("id_dokumen") || "No document"); 
  const identitycolor = ['#f06292', '#f44336', '#f48fb1','#ec407a', '#e91e63', '#ce93d8', '#ba68c8', '#ab47bc', '#9c27b0', '#b39ddb', '#9575cd', '#7e57c2', '#673AB7']; 

  // const [x_axis, setXAxis] = useState(0);
  // const [y_axis, setYAxis] = useState(0);
  // const [width, setWidth] = useState(50);
  // const [height, setHeight] = useState(50);
  // const [pageScale, setPageScale] = useState(1);
  const {setSignatures} = useSignature();

  console.log("TOKEN from Toolbar: ", token);
  console.log("Document Uploaded in Toolbar:", dokumenUploaded);

  const handleAddSignature = () => {
    setSignatures(prev => [
      ...prev, 
      {
        id: Date.now(),
        x_axis: 0,
        y_axis: 0,
        width: 150,
        height: 200,
      }
    ]);
  };

  const toggleMenu = (key) => {
    setOpenMenus((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };


  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = signersDoc.find(opt => opt.value === id_signers);

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

  // useEffect(() => {
  //   if (dokumenUploaded && dokumenUploaded !== "No document") {
  //     getSignersDoc(dokumenUploaded);
  //   }
  // }, [dokumenUploaded]);

  // const getCategory = async () =>{
  //   try {
  //     const response = await axios.get("http://localhost:5000/category", {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //     },
  //     });
  //     // console.log("response.data:", response.data);
  //     setCategory(response.data);
  //   } catch (error) {
  //     console.error("Error fetching data:", error.message); 
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const categoryDoc = async() => {
      try {
          const response = await axios.get('http://localhost:5000/category', {
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
        const response = await axios.get('http://localhost:5000/signer', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        // if (!response.ok) {
        //     throw new Error("Signer not found.");
        // }

        const data = response.data;

        const mapped = Array.isArray(data) ? data.map((item, index) => ({
          value: item.id_signers,
          label: item.Penandatangan?.nama || `Signer ${index + 1}`,
          color: identitycolor[index % identitycolor.length]
        })) : [];

        setSignersDoc(mapped);
    } catch (error) {
        console.error("Error fetching PDF:", error);
    }
  } 

  useEffect(() => {
    categoryDoc();
    // getCategory();
    getSignersDoc();
  }, []);

  console.log("Signer Doc:", signersDoc);

  const handleCategoryChange = (event) => {
      setIdKategoriDok(event.target.value);
  }

  const handleSignersChange = (event) => {
      setIdSigners(event.target.value);
  }

  const folders = [
    {
      name: 'My Documents',
      children: Array.isArray(signersDoc)? 
        signersDoc.map((item) => ({
        name: item.id_signers})) : [],
    },
  ];

  // console.log("folders: ", folders);

  const activeRoute = (routeName) => location.pathname.includes(routeName);

  const filteredRoutes = routes.filter(
    (route) => !["/screening-karyawan", "/login", "/surat-pernyataan", "/document", "/preview-doc"].includes(route.path)
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

  // useEffect(() => {
  //   setXAxis(x_axis);
  //   setYAxis(y_axis);
  //   setWidth(width);
  //   setHeight(height);
  // });

  // const handleAxisChange = ({x_axis, y_axis, width, height}) => {
  //   setXAxis(x_axis);
  //   setYAxis(y_axis);
  //   setWidth(width);
  //   setHeight(height);
  // };

  // console.log("x_axis:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height);


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
              src={require("assets/img/company_logo4.png")}
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
          {/* <Form>
            <Row>
              <Col md="12">
                <Form.Group>
                  <Form.Select 
                    className="form-control"
                    value={id_signers}
                    onChange={handleSignersChange}
                  >
                  {signersDoc.map(option => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                  ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form> */}

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
            {/* <span>&#9662;</span> */}
          </div>

          {isOpen && (
            <div className="custom-options">
              {signersDoc.map((option, index) => (
                  <div
                    key={option.value}
                    className="custom-option"
                    onClick={() => handleSelect(option.value)}
                  >
                  <div className="identity-color" style={{ backgroundColor: identitycolor[index % identitycolor.length] || '#f06292' }} 
                  />
                  {option.label}
                </div>
              ))}
            </div>
          )}

          </div>
        </ul>

        <a style={{fontSize:'15px'}}><strong>Signature Fields</strong></a>
        <ul className="items">
          <Button
            type="button"
            className="btn mb-3 bg-transparent mt-2"
            style={{width:"190px", border:"1px solid #eed4dd"}}
            onClick={""}>
            <i class="fa fa-upload" style={{ marginRight: '8px' }}></i>
              Upload Document
          </Button>

          <Button
            type="button"
            className="btn mb-3 bg-transparent mt-2"
            style={{width:"190px", border:"1px solid #eed4dd"}}
            onClick={handleAddSignature}>
            <i class="fa fa-upload" style={{ marginRight: '8px' }}></i>
              Signature
          </Button>

          {/* {showSignature && (
            <ResizableDragable 
              x_axis={x_axis}
              y_axis={y_axis}
              width={width}
              height={height}
              scale={pageScale}
              onChange={handleAxisChange}
            /> 
          )} */}

         
        </ul>
      </CDBSidebarContent>
      {/* <hr /> */}
      {/* {!isSidebarCollapsed && role === "Admin" && <FolderTree folders={folders} />} */}
    </div>
  );
};

export default ToolbarFields;