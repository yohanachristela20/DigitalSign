import React, { useEffect, useState, useRef } from "react";
import {FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaRegEdit, FaTrashAlt, FaTrashRestore, FaUserLock, FaSortUp, FaSortDown, FaMailBulk, FaPaperPlane, FaDownload} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddKaryawan from "components/ModalForm/AddKaryawan.js";
import EditKaryawan from "components/ModalForm/EditKaryawan.js";
import AddDocument from "components/ModalForm/AddDocument.js";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
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
  const [documentDeadline, setDocumentDeadline] = useState([]);

  const pdfRefs = useRef({});

  const token = localStorage.getItem("token");

  const today = new Date();
  // today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const todayDate = today.getDate().toString().padStart(2, '0');
  const formattedDate = `${currentYear}-${currentMonth}-${todayDate}`;

  const pdfContainerRef = useRef(null);

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

  const getRef = (id) => {
    if (!pdfRefs.current[id]) {
      pdfRefs.current[id] = React.createRef();
    }
    return pdfRefs.current[id];
  }

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

  const getDocumentDeadline = async () =>{
    try {
      const url = `http://localhost:5000/document-deadline`;

      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setDocumentDeadline(response.data);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDocument(selectedCategory);
    getDocumentStatus();
    getDocumentDeadline();
  }, [selectedCategory]);

  console.log("Selected category: ", selectedCategory);
  // console.log("Selected document: ", selectedDocuments);

  const getStatusById = (id) => {
    const statusObj = documentStatus.find(ds => ds.id_dokumen === id);
    return statusObj ? statusObj.status : "-";
  };

  const getDeadlineById = (id) => {
    const deadlineObj = documentDeadline.find(ds => ds.id_dokumen === id);
    return deadlineObj ? deadlineObj.deadline : "-";
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

  const sendReminder = async(id_dokumen) =>{
    try {
      await axios.post('http://localhost:5000/send-reminder', {id_dokumen}, {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      }); 
      toast.success("Reminder email has been sent!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      getDocument(); 
      // window.location.reload();
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
    if (!Array.isArray(data)) {
      console.error("Data is not an array:", data);
      return;
    }

    const header = [
      "id_dokumen",
      "nama_dokumen",
      "kategori",
      "status",
      "deadline",
      "createdAt",
    ];

    const rows = data.map((item) => [
      item.id_dokumen,
      item.nama_dokumen,
      item?.Kategori?.kategori || "N/A",
      getStatusById(item.id_dokumen),
      getDeadlineById(item.id_dokumen),
      new Date(item.createdAt)
        .toLocaleString("en-GB", { timeZone: "Asia/Jakarta" })
        .replace(/\//g, "-")
        .replace(",", ""),
    ]);

    const csvContent = [header, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = window.document.createElement("a");
    a.href = url;
    a.download = "documents.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };


  const downloadPDF = (data) => {
    const doc = new jsPDF({ orientation: 'landscape' });
  
    doc.setFontSize(12); 
    doc.text("Documents Data", 12, 20);

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
  
    const headers = [["Document ID", "File Name", "Category", "Status", "Deadline", "Uploaded"]];
  
    const rows = data.map((item) => [
      item.id_dokumen,
      item.nama_dokumen,
      item?.Kategori?.kategori || 'N/A',
      getStatusById(item.id_dokumen),
      getDeadlineById(item.id_dokumen),
      new Date(item.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', ''),
    ]);

    const marginTop = 15; 
  
    doc.autoTable({
      startY: 20 + marginTop, 
      head: headers,
      body: rows,
      styles: { fontSize: 12 },
      headStyles: { fillColor: [3, 177, 252] }, 
    });
  
    doc.save("documents.pdf");
  };

  const plainDoc = async (id_dokumen) => {
    try {
      const res = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Failed to fetch PDF for download.");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${id_dokumen}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Downloading error:", error.message);
    }
  };


  // const downloadDoc = async (id_dokumen, ref, sign_base64) => {
  //   console.log("SIGN BASE64:", sign_base64);
  //   try {
  //     if (!ref?.current) throw new Error("PDF container not found.");

  //     const canvas = await html2canvas(ref.current, { scale: 2 });
  //     const imgData = canvas.toDataURL("image/png");

  //     const orientation = canvas.width > canvas.height ? "landscape" : "portrait";

  //     const pdf = new jsPDF({
  //       orientation,
  //       unit: "px",
  //       format: [canvas.width, canvas.height],
  //     });

  //     pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

  //     if (document.LogSigns?.[0]?.sign_base64 && typeof document.LogSigns?.[0]?.sign_base64 === "string") {
  //       const cleanBase64 = document.LogSigns?.[0]?.sign_base64.replace(/\s/g, "");

  //       const finalBase64 = cleanBase64.startsWith("data:image")
  //         ? cleanBase64
  //         : `data:image/png;base64,${cleanBase64}`;

  //       try {
  //         const signWidth = 120;
  //         const signHeight = 60;
  //         const x = canvas.width - signWidth - 40;
  //         const y = canvas.height - signHeight - 40;

  //         pdf.addImage(finalBase64, "PNG", x, y, signWidth, signHeight);
  //       } catch (err) {
  //         console.error("Error adding signature:", err.message);
  //       }
  //     }

      
  //     pdf.save(`${id_dokumen}.pdf`);
  //   } catch (error) {
  //     console.error("Downloading error:", error.message);
  //   }
  // };


  const downloadDoc = async (id_dokumen, ref, logSigns = []) => {
  try {
    if (!ref?.current) throw new Error("PDF container not found.");

    const canvas = await html2canvas(ref.current, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    const orientation = canvas.width > canvas.height ? "landscape" : "portrait";

    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [canvas.width, canvas.height],
    });

    pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);

    if (Array.isArray(logSigns) && logSigns.length > 0) {
      logSigns.forEach((sign, index) => {
        if (sign?.sign_base64 && typeof sign.sign_base64 === "string") {
          const cleanBase64 = sign.sign_base64.replace(/\s/g, "");
          const finalBase64 = cleanBase64.startsWith("data:image")
            ? cleanBase64
            : `data:image/png;base64,${cleanBase64}`;

          try {
            const signWidth = 120;
            const signHeight = 60;
            const x = canvas.width - signWidth - 40;
            const y = canvas.height - signHeight - (index + 1) * 80;

            pdf.addImage(finalBase64, "PNG", x, y, signWidth, signHeight);
          } catch (err) {
            console.error("Error adding signature:", err.message);
          }
        }
      });
    }

    pdf.save(`${id_dokumen}.pdf`);
  } catch (error) {
    console.error("Downloading error:", error.message);
  }
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
                <th className="border-0">Deadline</th>
                <th className="border-0" onClick={() => handleSort("createdAt")}>Uploaded {sortBy==="createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                <th className="border-0" colSpan={3}>Action</th>
              </tr>
            </CDBTableHeader>
            <CDBTableBody>
              {currentItems.map((document, index) => (
                <tr key={document.id_dokumen}>
                  <td className="text-center">{document.id_dokumen}</td>
                  <td className="text-center">{document.nama_dokumen}</td>
                  <td className="text-center">{document?.Kategori?.kategori || 'N/A'}</td>
                  <td className="text-center">{getStatusById(document.id_dokumen) == "Pending"? <Badge pill bg="secondary">{getStatusById(document.id_dokumen)}</Badge> : getStatusById(document.id_dokumen) == "Completed" ? <Badge pill bg="success">{getStatusById(document.id_dokumen)}</Badge> : <Badge pill bg="danger">{getStatusById(document.id_dokumen)}</Badge>}</td>
                  <td className="text-center">{getDeadlineById(document.id_dokumen) !== '0000-00-00' ? getDeadlineById(document.id_dokumen) : '-'}</td>
                  <td className="text-center">{new Date(document.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                  <td className="text-center px-0">
                  <button
                    style={{background:"transparent", border:"none"}} 
                    disabled={document.user_active === true}
                    >
                    <FaTrashAlt 
                      type="button"
                      onClick={() => deleteDocument(document.id_dokumen)}
                      className="text-danger btn-action"
                    />
                  </button>
                  </td>
                  <td className="text-center px-0">
                    <button
                    style={{background:"transparent", border:"none"}} 
                    disabled={document.user_active === true}
                    >
                    <FaPaperPlane 
                      type="button"
                      onClick={() => sendReminder(document.id_dokumen)}
                      className="text-primary btn-action"
                      hidden={getStatusById(document.id_dokumen) !== "Pending" || formattedDate > getDeadlineById(document.id_dokumen)}
                    />
                  </button>
                  </td>
                  {/* <td className="text-center px-0">
                    <button
                      style={{background:"transparent", border:"none"}} 
                      disabled={document.user_active === true}
                      >
                      <FaDownload 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          if (getStatusById(document.id_dokumen) === "Completed") {
                            downloadDoc(document.id_dokumen, pdfContainerRef, document.sign_base64);
                          } else {
                            plainDoc(document.id_dokumen);
                          }
                        }}
                        className="text-success btn-action"
                        // hidden={getStatusById(document.id_dokumen) !== "Pending" || formattedDate > getDeadlineById(document.id_dokumen)}
                      />
                    </button>
                  </td> */}
                  <td className="text-center px-0">
                    <button
                      style={{ background: "transparent", border: "none" }}
                      disabled={document.user_active === true}
                    >
                      <FaDownload
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          const ref = getRef(document.id_dokumen); 
                          if (getStatusById(document.id_dokumen) === "Completed") {
                            downloadDoc(id_dokumen, pdfContainerRef, document.LogSigns || []);
                          } else {
                            plainDoc(document.id_dokumen);
                          }
                        }}
                        className="text-success btn-action"
                      />
                    </button>

                    <div
                      ref={getRef(document.id_dokumen)}
                      style={{ display: "none" }}
                    >
                      <h3>{document.nama_dokumen}</h3>
                      <p>Category: {document?.Kategori?.kategori}</p>
                    </div>
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

