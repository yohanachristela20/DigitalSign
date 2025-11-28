import React, { useEffect, useState } from "react";
import { useLocation, useHistory } from "react-router-dom";
import { Navbar, Container, Nav, Dropdown, Button, Modal } from "react-bootstrap";
import routes from "routes.js";
import UbahPassword from "components/ModalForm/UbahPassword.js";
import "../../assets/scss/lbd/_usernavbar.scss";
import axios from "axios";
import { stopInactivityTimer } from "views/Heartbeat";
import io from "socket.io-client";

const socket = io("http://10.70.10.20:5000");

function UserHeader() {
  const location = useLocation();
  const history = useHistory();
  const [showModal, setShowModal] = useState(false); 
  const [showUbahPassword, setShowUbahPassword] = useState(false);
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const [hidden, setHidden] = useState(false); 

  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
    const email = localStorage.getItem("email");
      if (!token || !email) return;

      try {
        const response = await axios.get(`http://10.70.10.20:5000/user-details/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data) {
          setUserData({
            id_karyawan: response.data.id_karyawan,
            nama: response.data.nama,
            organisasi: response.data.organisasi,
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  });

  useEffect(() => {  
    if (role !== "Admin") {
      return; 
    }
  
    const handleNotifAdmin = (data) => {
      setNotifications((prev) => [...prev, data]);
      setHidden(false); 
    };
  
    socket.on("newPinjaman", handleNotifAdmin);
  
    return () => {
      socket.off("newPinjaman", handleNotifAdmin);
    };
  }, [socket, role]);
  


  useEffect(() => {
  
    if (role !== "Finance") {
      return; 
    }
  
    const handlePinjaman = (data) => {
      setNotifications((prev) => [...prev, data]);
      setHidden(false); 
    };
  
    socket.on("pinjaman", handlePinjaman);
  
    return () => {
      socket.off("pinjaman", handlePinjaman);
    };
  }, [socket, role]);
  
  const mobileSidebarToggle = (e) => {
    e.preventDefault();
    document.documentElement.classList.toggle("nav-open");
    var node = document.createElement("div");
    node.id = "bodyClick";
    node.onclick = function () {
      this.parentElement.removeChild(this);
      document.documentElement.classList.toggle("nav-open");
    };
    document.body.appendChild(node);
  };

  const handleLogout = () => {
    stopInactivityTimer();
    axios.post("http://10.70.10.20:5000/logout", {}, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    }).finally(() => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      history.push("/login");
      window.location.reload();
    });
  };

  return (
    <>
    <Navbar className="bg-navbar" expand="lg">
      <Container fluid>
        <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
          <Button
            variant="dark"
            className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
            onClick={mobileSidebarToggle}
          >
            <i className="fas fa-ellipsis-v"></i>
          </Button>
          <Navbar.Brand
            onClick={(e) => e.preventDefault()}
          >
            <img
              src={require("../../assets/img/logo2.png")}
              alt="sidebar-logo"
              style={{ width: '30px' }}
              className="img-items mr-2"
            />
            <span className="fs-5">Campina Sign</span>
          </Navbar.Brand>
        </div>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto" style={{marginRight:'50px'}}>
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle
                aria-expanded={false}
                as={Nav.Link}
                id="navbarDropdownMenuLink"
                variant="default"
                className="mr-3 mt-2"
              >
              <span className="fs-6">Actions</span>
              </Dropdown.Toggle>
              <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink" style={{ width: '200px' }}>
                <Dropdown.Item
                  onClick={(e) => e.preventDefault()}
                >
                Decline
                </Dropdown.Item>
                <div className="divider"></div>
                <Dropdown.Item
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    
                    setShowUbahPassword(true); 
                  }}
                >
                  Document Info
                </Dropdown.Item>
                <div className="divider"></div>
                
                <Dropdown.Item
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true); 
                  }}
                >Audit Trail
                </Dropdown.Item>
                <div className="divider"></div>
                <Dropdown.Item
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowModal(true); 
                  }}
                >Download
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            <Button
              className="submit-btn w-100 mt-3 fs-6"
              type="submit"
            >
              Submit
            </Button>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>

    <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-warning">
      <Modal.Header>
        <Modal.Title>Sign Out</Modal.Title>
          <button
            type="button"
            className="close"
            aria-label="Close"
            onClick={() => setShowModal(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            &times; {/* Simbol 'x' */}
          </button>
      </Modal.Header>
      <Modal.Body >Are you sure to sign out?</Modal.Body>
      <Modal.Footer className="mb-4">
        <Button variant="danger" onClick={() => setShowModal(false)}>
          Cancel
        </Button>
        <Button variant="success" onClick={handleLogout}>
          Yes
        </Button> 
        
      </Modal.Footer>
    </Modal>
    <UbahPassword
        show={showUbahPassword}
        onHide={() => setShowUbahPassword(false)}
        onClick={handleLogout}
        onSubmit={(newPassword) => updatePassword(userData.id_karyawan, newPassword)}
    />
    </>
  );
}

export default UserHeader;
