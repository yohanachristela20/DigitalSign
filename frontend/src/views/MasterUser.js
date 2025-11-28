import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFilePdf, FaRegEdit, FaTrashAlt, FaUserLock, FaSortUp, FaSortDown, FaExclamationTriangle} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddUser from "components/ModalForm/AddUser.js";
import EditUser from "components/ModalForm/EditUser.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import { CDBTable, CDBTableHeader, CDBTableBody, CDBBtn, CDBBtnGrp } from 'cdbreact';

import {Button, Container, Row, Col, Badge, Modal} from "react-bootstrap";

function MasterUser() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [user, setUser] = useState([]); 
  const [selectedUser, setSelectedUser] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [deletedUser, setDeletedUser] = useState(null);
  const [showModal, setShowModal] = useState(false); 
    

  const [sortBy, setSortBy] = useState("id_user");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const filteredUser = user.filter((user) =>
    (user.id_user && String(user.id_user).toLowerCase().includes(searchQuery)) ||
    (user.email && String(user.email).toLowerCase().includes(searchQuery)) ||
    (user.role && String(user.role).toLowerCase().includes(searchQuery)) ||
    (user.user_active && String(user.user_active).toLowerCase().includes(searchQuery)) //search berdasarkan boolean
  );

  
  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      setSortOrderDibayar(sortOrderDibayar === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
      setSortOrderDibayar("asc");
    }
  }

  const sortedUser = filteredUser.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0; 
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0; 
    }

  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedUser.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  }

  const token = localStorage.getItem("token");

  useEffect(()=> {
    getUser();
    fetchUserData();
  }, []); 

  const getUser = async () =>{
    try {
      const response = await axios.get("http://10.70.10.20:5000/user", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setUser(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };
  

  const deleteUser = async() =>{
    try {
      await axios.delete(`http://10.70.10.20:5000/user/${deletedUser}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("User was deleted successfully.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      getUser(); 
      window.location.reload();
    } catch (error) {
      console.log(error.message); 
    }
  };

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!token || !email) return;

    try {
      const response = await axios.get(
        `http://10.70.10.20:5000/user-details/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getUser();
    toast.success("New user successfully created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getUser();
    toast.success("User successfully updated!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleImportButtonClick = () => {
    setShowImportModal(true);
  }

  const handleImportSuccess = () => {
    getUser();
    toast.success("User successfully imported!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const downloadCSV = (data) => {
    const header = ["id_user", "email", "role"];
    const rows = data.map((item) => [
      item.id_user,
      item.email,
      item.role
    ]);
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "master_user.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Users Data", 12, 20);

    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('en-EN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
  
    doc.setFontSize(12); 
    doc.text(`Exported date: ${formattedDate}`, 12, 30);
  
    const headers = [["ID User", "Email", "Role"]];
  
    const rows = data.map((item) => [
      item.id_user,
      item.email,
      item.role,
    ]);

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: rows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });
  
    doc.save("master_user.pdf");
  };

  const setPassword = async(id_user) => {
    try {

        await axios.put(`http://10.70.10.20:5000/user/${id_user}`, {
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        toast.success("Password successfully updated!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
        getUser();    
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        toast.error('Failed to update password.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
          });
    }

  };

  const handleDeleteUser = (id_user) => {
    setDeletedUser(id_user);
    setShowModal(true);
  };

  
  
  return (
    <>
      <Container>
        <Row>
          <AddUser showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

          <EditUser
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
              user={selectedUser}
              onSuccess={handleEditSuccess}
          />

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>

          <Container>
            <Button
              type="button"
              className="btn btn-fill btn-success pull-right mb-3 mr-3"
              onClick={() => setShowAddModal(true)}>
              <i class="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
              Add User
            </Button>

            <Button
              className="btn-fill pull-right mb-3 mr-3"
              type="button"
              variant="primary"
              onClick={() => downloadCSV(user)}>
              <FaFileCsv style={{ marginRight: '8px' }} />
              Export to CSV
            </Button>

            <Button
              className="btn-fill pull-right mb-3"
              type="button"
              variant="primary"
              onClick={() => downloadPDF(user)}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Export to PDF
            </Button>
          </Container>          
          <Col md="12">
          <CDBTable hover  className="mt-4">
            <CDBTableHeader>
              <tr>
                <th onClick={() => handleSort("id_user")}>User Id {sortBy==="id_user" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("username")}>Email {sortBy==="email" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("role")}>Role {sortBy==="role" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0">Status</th>
                <th className="border-0">Action</th>
              </tr>
            </CDBTableHeader>
            <CDBTableBody>
              {currentItems.map((user, index) => (
                <tr key={user.id_user}>
                  <td className="text-center">{user.id_user}</td>
                  <td className="text-center">{user.email}</td>
                  <td className="text-center">{user.role}</td>
                  <td className="text-center">
                      {user.user_active === true ? (
                        <Badge pill bg="success p-2" style={{ color: 'white'}} >
                          Active
                        </Badge >
                        ) : (
                        <Badge pill bg="secondary p-2" style={{ color: 'white'}} >
                          Not Active
                        </Badge >
                      )}
                    </td>
                  <td className="text-center">
                  <FaRegEdit
                      type="button"
                      onClick={() => {
                        setShowEditModal(true);
                        setSelectedUser(user);
                      }}
                      className="btn-edit"
                  />
                  <FaUserLock 
                    type="button"
                    onClick={() => {
                      setPassword(user.id_user)
                    }}
                    className="btn-set"
                  />
                  <button
                    style={{background:"transparent", border:"none"}} 
                    disabled={user.user_active === true}
                    >
                    <FaTrashAlt 
                      type="button"
                      onClick={() => handleDeleteUser(user.id_user)}
                      className="btn-del"
                    />
                  </button>
                  </td>
                </tr>
              ))}
            </CDBTableBody>
          </CDBTable>
            
            <div className="pagination-container">
              <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={filteredUser.length}
                    pageRangeDisplayed={5}
                    onChange={handlePageChange}
                    itemClass="page-item"
                    linkClass="page-link"
              />
            </div>
          </Col>
        </Row>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} dialogClassName="modal-warning">
        <Modal.Header style={{borderBottom: "none"}}>
          <FaExclamationTriangle style={{ width:"100%", height:"60px", position: "relative", textAlign:"center", marginTop:"20px"}} color="#ffca57ff"/>
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
        <Modal.Body style={{ width:"100%", height:"60px", position: "relative", textAlign:"center"}} >Are you sure you want to delete this user?</Modal.Body>
        <Modal.Footer className="mb-2" textAlign="center" style={{ justifyContent: "center", borderTop: "none" }}>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="mx-3">
            Cancel
          </Button>
          <Button variant="danger" onClick={() => deleteUser(user.id_user)} className="mx-3">
            Delete
          </Button> 
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default MasterUser;

