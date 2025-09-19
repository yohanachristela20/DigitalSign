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
import PDFCanvas from "components/Canvas/canvas.js";
import { PDFDocument } from "pdf-lib";
import { getProgress } from "../../src/utils/progress.js";

import {Button, Container, Row, Col, Card, Table, Spinner, Badge} from "react-bootstrap";
import { saveAs } from "file-saver";
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
  const [is_deleted, setIsDeleted] = useState(false);
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

  const [show, setShow] = useState("");
  const [editable, setEditable] = useState("");
  const [is_delegated, setIsDelegated] = useState("");
  const [delegated_signers, setDelegatedSigners] = useState("");

  const today = new Date();
  // today.setHours(0, 0, 0, 0);
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const todayDate = today.getDate().toString().padStart(2, '0');
  const formattedDate = `${currentYear}-${currentMonth}-${todayDate}`;

  const pdfContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const {progress, status} = getProgress(document);

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
      setDocument(response.data || []);
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


  const filteredDocument = document.filter((doc) =>
  {
     const status = getStatusById(doc.id_dokumen);

   return (
    (doc.id_dokumen && String(doc.id_dokumen).includes(searchQuery)) ||
    (doc.nama_dokumen && String(doc.nama_dokumen).toLowerCase().includes(searchQuery)) ||
    (status && status.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doc.deadline && String(doc.deadline).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doc.updatedAt && String(doc.updatedAt).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doc.createdAt && String(doc.createdAt).toLowerCase().includes(searchQuery.toLowerCase())) ||
    (doc?.Kategori?.kategori && doc.Kategori.kategori.toLowerCase().includes(searchQuery.toLowerCase()))
   );
  });

  const filteredDocsStatus = selectedDocuments
    ? documentStatus.filter(doc => doc.id_dokumen === selectedDocuments)
    : documentStatus;


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
      await axios.patch(`http://localhost:5000/temporary-del/${id_dokumen}`,
      {is_deleted: true},
      {
        headers: {Authorization: `Bearer ${token}`}
      }
      ); 
      toast.success("Document was deleted successfully!", {
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
    } catch (error) {
      console.log(error.message); 
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getDocument();
    toast.success("New document has been created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  
  const handleAddDocSuccess = () => {
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


  const downloadDoc = async (id_dokumen, ref, logSigns) => { 
  try {
    const pdfUrl = `http://localhost:5000/pdf-document/${id_dokumen}`;
    const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);

    const pages = pdfDoc.getPages();
    const scale = 1.5;
   
    for (const sign of logSigns) {
      if (sign.status === "Completed" && sign.is_submitted) {
        const axisRes = await fetch(
          `http://localhost:5000/axis-field/${id_dokumen}/${sign.id_signers}/${sign.id_item}`
        ).then(res => res.json());

        const field = axisRes[0]?.ItemField;
        if (!field) continue;

        let { x_axis, y_axis, width, height, jenis_item, page } = field;

        x_axis = jenis_item === "Date" ? Number(x_axis) / scale + 40 : Number(x_axis) / scale;
        y_axis = jenis_item === "Initialpad" ? Number(y_axis) / scale - 5 : jenis_item === "Signpad" ? Number(y_axis) / scale + 25 :jenis_item === "Date" ? Number(y_axis) / scale - 50 : Number(y_axis) / scale ;
        
        width = Number(height) / scale;
        height = Number(width) / scale - 20;

        const targetPageIndex = Number(page) - 1;  
        if (targetPageIndex < 0 || targetPageIndex >= pages.length) {
          console.warn("Invalid page number:", page);
          continue;
        }

        const pdfPage = pages[targetPageIndex];
        const pageHeight = pdfPage.getHeight();
        const yPos = pageHeight - y_axis - height + 10;

        if (jenis_item === "Initialpad" || jenis_item === "Signpad") {
          let base64Url = sign.sign_base64;
          if (!base64Url.startsWith("data:image")) {
            base64Url = `data:image/png;base64,${base64Url}`;
          }
          const pngImage = await pdfDoc.embedPng(base64Url);
          pdfPage.drawImage(pngImage, {
            x: x_axis,
            y: yPos,
            width,
            height,
          });
        } else {
          const date = new Date(sign.tgl_tt);
          console.log("DATE:", sign.tgl_tt);
          const day = String(date.getDate()).padStart(2, "0");
          const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sept","Oct","Nov","Dec"];
          const month = monthNames[date.getMonth()];
          const year = date.getFullYear();
          const currentDate = `${day} ${month} ${year}`;

          pdfPage.drawText(currentDate, {
            x: x_axis,
            y: yPos,
            size: 9,
          });
        }
      }
    }

    const signedBytes = await pdfDoc.save();
    const blob = new Blob([signedBytes], { type: "application/pdf" });

    saveAs(blob, `signed_${id_dokumen}.pdf`);

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
              {currentItems
              .filter(document => !document.is_deleted)
              .map((document, index) => (
                <tr key={document.id_dokumen}>
                  <td className="text-center">{document.id_dokumen}</td>
                  <td className="text-center">
                    <p>{document.nama_dokumen}</p>
                    <p className="signer-font">To: {document.LogSigns.map((log) => log.Signerr?.nama).join(", ")}</p>
                  </td>
                  <td className="text-center">{document?.Kategori?.kategori || 'N/A'}</td>
                  <td className="text-center">
                    <p>
                      {getStatusById(document.id_dokumen) === "Decline" ? (
                        <Badge pill bg="danger">Decline</Badge>
                      ) : getStatusById(document.id_dokumen) === "Completed" &&
                        document.LogSigns.every((log) => log.is_submitted === true) ?
                      (
                        <Badge pill bg="success">Completed</Badge>
                      ) : (
                        <Badge pill bg="secondary">Pending</Badge>
                      )}
                    </p>
                    <p className="signer-font" hidden={getStatusById(document.id_dokumen) === "Completed" || getStatusById(document.id_dokumen) === "Decline" || document.LogSigns.every((log) => log.is_submitted === true)}>{getProgress(document)}</p>                      
                  </td>
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
                      hidden={getStatusById(document.id_dokumen) !== "Pending"}
                      // && formattedDate > getDeadlineById(document.id_dokumen)
                    />
                  </button>
                  </td>
                  <td className="text-center px-0">
                    <button
                      style={{ background: "transparent", border: "none" }}
                      disabled={document.user_active === true}
                    >
                      <FaDownload
                        type="button"
                        onClick={async(e) => {
                          e.preventDefault();
                          const ref = getRef(document.id_dokumen); 
                          const status = getStatusById(document.id_dokumen);
                          const logSigns = document.LogSigns || [];
                          const allSubmitted = logSigns.length > 0 && logSigns.every(sign => sign?.is_submitted === true);

                          if (status === "Completed" && allSubmitted) {
                            await downloadDoc(document.id_dokumen, ref, document.LogSigns);
                          } else {
                            await plainDoc(document.id_dokumen);
                          }
                        }}
                        className="text-success btn-action"
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

