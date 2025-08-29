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
function Document() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [document, setDocument] = useState([]); 
  const [user_active, setUserActive] = useState();
  const [selectedDocument, setSelectedDocument] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");
  const [karyawanData, setkaryawanData] = useState({id_user: "", email: "", role: "", user_active: ""}); 
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const history = useHistory();
  const [id_dokumen, setIdKaryawan] = useState("");
  const [sortBy, setSortBy] = useState("id_dokumen");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");
  const [showAddDoc, setShowAddDoc] = React.useState(false);
  const selectedCategory = location.state?.selectedCategory;
  const selectedDocuments = location.state?.selectedDocument;
//   const [documentList, setDocumentList] = useState([]);

  const [documentStatus, setDocumentStatus] = useState([]);

  const token = localStorage.getItem("token");

  const getDocument = async (selectedCategory) =>{
    try {
      const url = selectedCategory 
      ? `http://localhost:5000/document/category/${selectedCategory}`
      : `http://localhost:5000/document`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setDocument(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

   const getDocumentStatus = async () =>{
    try {
      const url = `http://localhost:5000/document-status`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setDocumentStatus(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDocument(selectedCategory);
    getDocumentStatus();
  }, [selectedCategory]);

  console.log("Selected category: ", selectedCategory);
  // console.log("Selected document: ", selectedDocuments);

  const getStatusById = (id) => {
    const statusObj = documentStatus.find(ds => ds.id_dokumen === id);
    return statusObj ? statusObj.status : "-";
  };

  const filteredDocuments = selectedCategory
    ? document.filter(doc => doc.id_kategoridok === selectedCategory)
    : document;

  console.log("filtered documents: ", filteredDocuments);

  const filteredDocument = document.filter((document) =>
    (document.id_dokumen && String(document.id_dokumen).toLowerCase().includes(searchQuery)) ||
    (document.nama_dokumen && String(document.nama_dokumen).toLowerCase().includes(searchQuery)) ||
    (document.id_kategoridok && String(document.id_kategoridok).toLowerCase().includes(searchQuery)) ||
    (document.organisasi && String(document.organisasi).toLowerCase().includes(searchQuery)) ||
    (document?.Kategori?.kategori && String(document.kategori).toLowerCase().includes(searchQuery))
  );

  const filteredDocsStatus = selectedDocuments
    ? documentStatus.filter(doc => doc.id_dokumen === selectedDocuments)
    : documentStatus;

  console.log("filteredDocsStatus: ", filteredDocsStatus);

  const filteredDocStatus = documentStatus.filter((documentStatus) =>
    (documentStatus.id_dokumen && String(documentStatus.id_dokumen).toLowerCase().includes(searchQuery)) ||
    (documentStatus.status && String(documentStatus.status).toLowerCase().includes(searchQuery))
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

  const sortedDocument = filteredDocument.sort((a, b) => {
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
  const currentItems = sortedDocument.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber); 
  }


  const deleteDocument = async(id_dokumen) =>{
    try {
      await axios.delete(`http://localhost:5000/document/${id_dokumen}` , {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("Employee was deleted successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      getDocument(); 
      window.location.reload();
    } catch (error) {
      console.log(error.message); 
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getDocument();
    // fetchEmployeeData();
    toast.success("New document has been created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  
  const handleAddDocSuccess = () => {
    // getDocument();
    // fetchEmployeeData();
    toast.success("New document has been uploaded!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
    getDocument();
    window.location.reload();
  };

  const handleEditSuccess = () => {
    getDocument();
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
    getDocument();
    toast.success("User successfully imported!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  const downloadCSV = (data) => {
    const header = ["id_dokumen", "nama_dokumen", "id_kategoridok", "organisasi", "sign_base64"];
    const rows = data.map((item) => [
      item.id_dokumen,
      item.nama_dokumen,
      item.id_kategoridok,
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
    link.setAttribute("download", "master_karyawan.csv");
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
      item.id_dokumen,
      item.nama_dokumen,
      item.id_kategoridok,
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

  const handleUpload = () => {
    history.push("/admin/upload-document");
  }
  
  return (
    <>
      <Container fluid>
        <Row>
          <AddKaryawan showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />
          <AddDocument showAddDoc={showAddDoc} setShowAddDoc={setShowAddDoc} onSuccess={handleAddDocSuccess}/>
          <EditKaryawan
              showEditModal={showEditModal}
              setShowEditModal={setShowEditModal}
              document={selectedDocument}
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
            {/* <Button
              type="button"
              className="btn btn-fill btn-success pull-right mb-3 mr-3"
              onClick={() => setShowAddModal(true)}>
              <i class="fa fa-plus-circle" style={{ marginRight: '8px' }}></i>
               New Employee
            </Button> */}

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
              onClick={() => downloadCSV(document)}>
              <FaFileCsv style={{ marginRight: '8px' }} />
              Export to CSV
            </Button>

            <Button
              className="btn-fill pull-right mb-3"
              type="button"
              variant="info"
              onClick={() => downloadPDF(document)}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Export to PDF
            </Button>
          </Container>          
          <Col md="12">
          <CDBTable hover  className="mt-4">
            <CDBTableHeader>
              <tr>
                <th onClick={() => handleSort("id_dokumen")}>Document ID {sortBy==="id_dokumen" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("nama_dokumen")}>Document Name {sortBy==="nama_dokumen" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" onClick={() => handleSort("id_kategoridok")}>Category {sortBy==="id_kategoridok" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0">Status</th>
                <th className="border-0" onClick={() => handleSort("createdAt")}>Uploaded {sortBy==="createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0">Action</th>
              </tr>
            </CDBTableHeader>
            <CDBTableBody>
              {currentItems.map((document, index) => (
                <tr key={document.id_dokumen}>
                  <td className="text-center">{document.id_dokumen}</td>
                  <td className="text-center">{document.nama_dokumen}</td>
                  <td className="text-center">{document?.Kategori?.kategori || 'N/A'}</td>
                  <td className="text-center">{getStatusById(document.id_dokumen) == "Pending"? <Badge pill bg="secondary">{getStatusById(document.id_dokumen)}</Badge> : getStatusById(document.id_dokumen) == "Completed" ? <Badge pill bg="success">{getStatusById(document.id_dokumen)}</Badge> : <Badge pill bg="danger">{getStatusById(document.id_dokumen)}</Badge> }</td>
                  <td className="text-center">{new Date(document.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                  <td className="text-center">
                  <button
                    style={{background:"transparent", border:"none"}} 
                    disabled={document.user_active === true}
                    >
                    <FaTrashAlt 
                      type="button"
                      onClick={() => deleteDocument(document.id_dokumen)}
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
                    totalItemsCount={filteredDocument.length}
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

export default Document;

