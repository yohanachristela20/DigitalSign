import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt, FaTrashRestore, FaUserLock, FaSortUp, FaSortDown} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddKaryawan from "components/ModalForm/AddKaryawan.js";
import EditKaryawan from "components/ModalForm/EditKaryawan.js";
import AddDocument from "components/ModalForm/AddDocument.js";
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
function EmployeeManagement() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [employee, setEmployee] = useState([]); 
  const [user_active, setUserActive] = useState();
  const [selectedEmployee, setselectedEmployee] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [karyawanData, setkaryawanData] = useState({id_user: "", email: "", role: "", user_active: ""}); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const history = useHistory();
  const [id_karyawan, setIdKaryawan] = useState("");

  const [sortBy, setSortBy] = useState("id_karyawan");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const [showAddDoc, setShowAddDoc] = React.useState(false);

  const filteredEmployee = employee.filter((employee) =>
    (employee.id_karyawan && String(employee.id_karyawan).toLowerCase().includes(searchQuery)) ||
    (employee.nama && String(employee.nama).toLowerCase().includes(searchQuery)) ||
    (employee.email && String(employee.email).toLowerCase().includes(searchQuery)) ||
    (employee.job_title && String(employee.job_title).toLowerCase().includes(searchQuery)) ||
    (employee.organisasi && String(employee.organisasi).toLowerCase().includes(searchQuery)) 
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
    // fetchEmployeeData();
  }, []); 
  
  const getEmployee = async () =>{
    try {
      const response = await axios.get("http://localhost:5000/employee-details", {
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

  const deleteEmployee = async(id_karyawan) =>{
    try {
      await axios.delete(`http://localhost:5000/employee/${id_karyawan}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("Employee was deleted successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      getEmployee(); 
    } catch (error) {
      console.log(error.message); 
    }
  };

  // const fetchEmployeeData = async () => {
  //   const token = localStorage.getItem("token");
  //   const email = localStorage.getItem("email");
  //   // if (!token || !email) return;

  //   try {
  //     const response = await axios.get(
  //       `http://localhost:5000/karyawan-details/${email}`,
  //       {
  //         headers: { Authorization: `Bearer ${token}` },
  //       }
  //     );

  //     if (response.data) {
  //       setkaryawanData({
  //         id_user: response.data.id_user,
  //         email: response.data.email,
  //         role: response.data.role,
  //         // user_active: response.data.user_active
  //       });
  //     }
  //   } catch (error) {
  //     console.error("Error fetching user data:", error);
  //   }
  // };



  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getEmployee();
    // fetchEmployeeData();
    toast.success("New employee has been created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  
  const handleAddDocSuccess = () => {
    // getEmployee();
    // fetchEmployeeData();
    toast.success("New document has been uploaded!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getEmployee();
    toast.success("Employee was updated successfully!", {
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

  const handleUpload = () => {
    history.push("/admin/upload-document");
  }

  const downloadCSV = (data) => {
    const header = ["id_karyawan", "nama", "job_title", "organisasi", "sign_base64"];
    const rows = data.map((item) => [
      item.id_karyawan,
      item.nama,
      item.job_title,
      item.organisasi,
      item.sign_base64
    ]);
  
    const csvContent = [header, ...rows]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "employees.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Employees Data", 12, 20);

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
  
    const headers = [["Employee ID", "Name", "Job Title", "Organization"]];
  
    const rows = data.map((item) => [
      item.id_karyawan,
      item.nama,
      item.job_title,
      item.organisasi
    ]);

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: rows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });
  
    doc.save("master_karyawan.pdf");
  };


  
  return (
    <>
      <Container fluid>
        <Row>
          <AddKaryawan showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />
          <AddDocument showAddDoc={showAddDoc} setShowAddDoc={setShowAddDoc} onSuccess={handleAddDocSuccess}/>
          <EditKaryawan
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
              employee={selectedEmployee}
              onSuccess={handleEditSuccess}
          />

          {/* <ImportUser showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} /> */}

          <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>
          <Button
              type="button"
              className="btn btn-fill btn-primary mb-3"
              style={{width:"190px"}}
              onClick={handleUpload}>
              <i class="fa fa-upload" style={{ marginRight: '8px' }}></i>
                Upload Document
            </Button>
          <Container>
            
            <Button
              type="button"
              className="btn btn-fill btn-success pull-right mb-3 mr-3"
              onClick={() => setShowAddModal(true)}>
              <i class="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
               New Employee
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
              variant="info"
              onClick={() => downloadCSV(employee)}>
              <FaFileCsv style={{ marginRight: '8px' }} />
              Export to CSV
            </Button>

            <Button
              className="btn-fill pull-right mb-3"
              type="button"
              variant="info"
              onClick={() => downloadPDF(employee)}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Export to PDF
            </Button>
          </Container>          
          <Col md="12">
          <CDBTable hover  className="mt-4">
            <CDBTableHeader>
              <tr>
                <th onClick={() => handleSort("id_karyawan")}>Employee Id {sortBy==="id_karyawan" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("nama")}>Name {sortBy==="nama" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                {/* <th className="border-0" onClick={() => handleSort("email")}>Email {sortBy==="email" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th> */}
                <th className="border-0" onClick={() => handleSort("job_title")}>Job Title {sortBy==="job_title" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("organisasi")}>Organization {sortBy==="organisasi" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                {/* <th className="border-0" onClick={() => handleSort("role")}>Role {sortBy==="role" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th> */}
                <th className="border-0">Registered</th>
                <th className="border-0">Last Updated</th>
                <th className="border-0">Action</th>
              </tr>
            </CDBTableHeader>
            <CDBTableBody>
              {currentItems.map((employee, index) => (
                <tr key={employee.id_karyawan}>
                  <td className="text-center">{employee.id_karyawan}</td>
                  <td className="text-center">{employee.nama}</td>
                  {/* <td className="text-center">{employee.email}</td> */}
                  <td className="text-center">{employee.job_title}</td>
                  <td className="text-center">{employee.organisasi}</td>
                  <td className="text-center">{new Date(employee.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                  <td className="text-center">{new Date(employee.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                  {/* <td className="text-center">{employee.role}</td>
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
                  </td> */}
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
                      onClick={() => deleteEmployee(employee.id_karyawan)}
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

export default EmployeeManagement;

