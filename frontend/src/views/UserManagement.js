import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt, FaTrashRestore, FaUserLock, FaSortUp, FaSortDown} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddUser from "components/ModalForm/AddUser.js";
import EditUser from "components/ModalForm/EditUser.js";
import ImportUser from "components/ModalForm/ImportUser.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import cardBeranda from "../assets/img/dashboard3.png";
import "../assets/scss/lbd/_table-header.scss";
import { stopInactivityTimer } from "views/Heartbeat";
import { useLocation, useHistory } from "react-router-dom";
import { CDBTable, CDBTableHeader, CDBTableBody, CDBContainer, CDBBtn, CDBBtnGrp } from 'cdbreact';

// react-bootstrap components
import {Button, Container, Row, Col, Card, Table, Spinner, Badge} from "react-bootstrap";

function UserManagement() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [employee, setEmployee] = useState([]); 
  const [user_active, setUserActive] = useState();
  const [selectedEmployee, setselectedEmployee] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", divisi: ""}); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const history = useHistory();

  const [sortBy, setSortBy] = useState("id_karyawan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const filteredEmployee = employee.filter((employee) =>
    (employee.id_karyawan && String(employee.id_karyawan).toLowerCase().includes(searchQuery)) ||
    (employee.nama && String(employee.nama).toLowerCase().includes(searchQuery)) ||
    (employee.email && String(employee.email).toLowerCase().includes(searchQuery)) ||
    (employee.job_title && String(employee.job_title).toLowerCase().includes(searchQuery)) ||
    (employee.role && String(employee.role).toLowerCase().includes(searchQuery)) ||
    (employee.user_active && String(employee.user_active).toLowerCase().includes(searchQuery)) //search berdasarkan boolean
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

  const sortedEmployee = filteredEmployee.sort((a, b) => {
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
  const currentItems = sortedEmployee.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  }

  const token = localStorage.getItem("token");

  useEffect(()=> {
    getEmployee();
    fetchEmployeeData();
  }, []); 

  const getEmployee = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/employee", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setEmployee(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };
  

  const deleteUser = async(id_user) =>{
    try {
      await axios.delete(`http://localhost:5000/user/${id_user}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("User successfully deleted!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      getEmployee(); 
    } catch (error) {
      console.log(error.message); 
    }
  };

  const fetchEmployeeData = async () => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("email");
    if (!token || !email) return;

    try {
      const response = await axios.get(
        `http://localhost:5000/user-details/${email}`,
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
        // console.log("User data fetched:", response.data);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };


  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getEmployee();
    toast.success("New user successfully created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getEmployee();
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
    getEmployee();
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
    doc.text("Master User", 12, 20);

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

        await axios.put(`http://localhost:5000/user/${id_user}`, {
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
        getEmployee();    
    } catch (error) {
        const errorMessage = error.response?.data?.message || error.message;
        // console.log(error.message);
        toast.error('Failed to update password.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
          });
    }

  };

  const deleteSession = async (id_user, user_active) => {
    try {
        await axios.post(`http://localhost:5000/logout-user/${id_user}`, {
            id_user,
            user_active
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        toast.success("User session was successfully deleted.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
        getEmployee();

    } catch (error) {
        console.log(error.message);
        toast.error('Failed to delete user session.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
          });
    }
  };
  
  
  return (
    <>
      <Container fluid>
        <Row>
          <AddUser showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

          <EditUser
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
              user={selectedEmployee}
              onSuccess={handleEditSuccess}
          />

          {/* <ImportUser showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} /> */}

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>

          <Container>
            <Button
              type="button"
              className="btn btn-fill btn-success pull-right mb-3 mr-3"
              onClick={() => setShowAddModal(true)}>
              <i class="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
              Add User
            </Button>

            {/* <Button
              className="btn-fill pull-right mb-3 mr-3"
              type="button"
              variant="info"
              onClick={handleImportButtonClick}>
              <FaFileImport style={{ marginRight: '8px' }} />
              Import
            </Button> */}

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
                <th onClick={() => handleSort("id_user")}>Employee Id {sortBy==="id_karyawan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("nama")}>Name {sortBy==="nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("email")}>Email {sortBy==="email" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("job_title")}>Job Title {sortBy==="job_title" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("role")}>Role {sortBy==="role" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0">Status</th>
                <th className="border-0">Action</th>
              </tr>
            </CDBTableHeader>
            <CDBTableBody>
              {currentItems.map((employee, index) => (
                <tr key={employee.id_karyawan}>
                  <td className="text-center">{employee.id_karyawan}</td>
                  <td className="text-center">{employee.nama}</td>
                  <td className="text-center">{employee.email}</td>
                  <td className="text-center">{employee.job_title}</td>
                  <td className="text-center">{employee.role}</td>
                  <td className="text-center">
                      {employee.user_active === true ? (
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
                        setselectedEmployee(employee);
                      }}
                      className="btn-edit"
                  />
                  <button
                    style={{background:"transparent", border:"none"}} 
                    disabled={employee.user_active === true}
                    >
                    <FaTrashAlt 
                      type="button"
                      onClick={() => deleteUser(employee.id_employee)}
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
                    totalItemsCount={filteredEmployee.length}
                    pageRangeDisplayed={5}
                    onChange={handlePageChange}
                    itemClass="page-item"
                    linkClass="page-link"
              />
            </div>
          </Col>
        </Row>
      </Container>
    </>
  );
}

export default UserManagement;

