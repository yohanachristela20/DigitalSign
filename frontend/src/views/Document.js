import React, { useEffect, useState, useRef } from "react";
import {FaFileCsv, FaFilePdf, FaTrashAlt, FaSortUp, FaSortDown, FaPaperPlane, FaDownload, FaSignInAlt, FaHourglassStart, FaClipboardCheck, FaSign, FaFileSignature} from 'react-icons/fa'; 
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
import "../assets/scss/lbd/_table-header.scss";
import "../assets/scss/lbd/_receivedoc.scss";
import { useLocation, useHistory } from "react-router-dom";
import { CDBTable, CDBTableHeader, CDBTableBody, CDBContainer, CDBBtn, CDBBtnGrp } from 'cdbreact';
import { PDFDocument } from "pdf-lib";
import { getProgress } from "../../src/utils/progress.js";
import {Button, Container, Row, Col, Card, Table, Spinner, Badge} from "react-bootstrap";
import { saveAs } from "file-saver";
import ReactLoading from "react-loading";

function Document() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
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
  const [jumlahNeedsToSign, setJumlahNeedsToSign] = useState([]);
  const [jumlahPending, setJumlahPending] = useState([]);
  const [jumlahCompleted, setJumlahCompleted] = useState([]);

  const [documentStatus, setDocumentStatus] = useState([]);
  const [documentDeadline, setDocumentDeadline] = useState([]);

  const pdfRefs = useRef({});

  const token = localStorage.getItem("token");

  // console.log("selectedCategory:", selectedCategory);

  const [show, setShow] = useState("");
  const [editable, setEditable] = useState("");
  const [is_delegated, setIsDelegated] = useState("");
  const [delegated_signers, setDelegatedSigners] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
  const todayDate = today.getDate().toString().padStart(2, '0');
  const formattedDate = `${currentYear}-${currentMonth}-${todayDate}`;
  const pdfContainerRef = useRef(null);
  const canvasRef = useRef(null);

  const {progress, status} = getProgress(document);
  const [signerData, setSignerData] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  

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

  // console.log("filteredDoc:", filteredDocument);

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
      setIsLoading(true);

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
    } finally {
      setIsLoading(false);
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

      const docItem = document.find(d => String(d.id_dokumen) === String(id_dokumen));
      const rawName = docItem?.nama_dokumen || `document_${id_dokumen}`;
      const safeName = String(rawName).trim().replace(/[/\\?%*:|"<>]/g, '-');

      const a = window.document.createElement("a");
      a.href = url;
      a.download = `${safeName}`;
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
      const scale = 1;
    
      for (const sign of logSigns) {
        if (sign.status === "Completed" && sign.is_submitted) {
          const axisRes = await fetch(
            `http://localhost:5000/axis-field/${id_dokumen}/${sign.id_signers}/${sign.id_item}`
          ).then(res => res.json());

          const field = axisRes[0]?.ItemField;
          if (!field) continue;

          let { x_axis, y_axis, width, height, jenis_item, page } = field;

          x_axis = jenis_item === "Date" ? Number(x_axis) / scale + 40 : Number(x_axis) / scale;
          y_axis = jenis_item === "Initialpad" ? Number(y_axis) / scale : jenis_item === "Signpad" ? Number(y_axis) / scale :jenis_item === "Date" ? Number(y_axis) / scale - 60 : Number(y_axis) / scale ;
          
          width = Number(height) / scale - 10;
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
          let signer = sign.Signerr?.nama;
          let tgl_tt = sign.tgl_tt;
          let arraytgltt = 
          Array.isArray(currentItems) 
          ? currentItems.filter(d => d.is_deleted !== true).length
          : (sign.tgl_tt ?? "");

          const docItem = document.find(d => String(d.id_dokumen) === String(id_dokumen));
          console.log("docItem:", docItem);
          const rawDate = sign.tgl_tt ?? docItem?.LogSigns?.tgl_tt;
          const parsedDate = new Date(rawDate);
          const safeDate = isNaN(parsedDate.getTime()) ? new Date() : parsedDate;
          const timestamp = safeDate.toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '');


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

          // const timestamp2 = new Date(tgl_tt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '');
          const watermark = `Signed by ${signer} Date: ${timestamp}`;

          const marginBottom = 65;
          const marginRight = 90;

          pdfPage.drawText(watermark, {
          x: x_axis + marginRight,
          y: yPos + marginBottom,
          size: 8,
          maxWidth: 50,
          lineHeight: 12,
          })

          } else {
            const date = new Date(sign.tgl_tt);
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

      const docItem = document.find(d => String(d.id_dokumen) === String(id_dokumen));
      const rawName = docItem?.nama_dokumen || `document_${id_dokumen}`;
      const safeName = String(rawName).trim().replace(/[/\\?%*:|"<>]/g, '-');

      saveAs(blob, `${safeName}`);

    } catch (error) {
      console.error("Downloading error:", error.message);
    }
  };

  // useEffect(() => {
  //   const fetchSummaryData = async() => {
  //     try {
  //       const [resJumlahNeedsToSign, resJumlahPending, resJumlahCompleted] = await Promise.all([
  //         axios.get("http://localhost:5000/count-needsToSign", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }), 
  //         axios.get("http://localhost:5000/count-pendingDoc", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //         axios.get("http://localhost:5000/count-completed", {
  //           headers: { Authorization: `Bearer ${token}` },
  //         }),
  //       ]);

  //       setJumlahNeedsToSign(resJumlahNeedsToSign.data.jumlahNeedsToSign || 0);
  //       setJumlahPending(resJumlahPending.data.jumlahPending || 0);
  //       setJumlahCompleted(resJumlahCompleted.data.jumlahCompleted || 0);
  //     } catch (error) {
  //       console.error("Error fetching summary data:", error);
  //     }
  //   };

  //   fetchSummaryData();
  // });

  const getJumlahNeedsToSign = async(selectedCategory) => {
    try {
      const url = selectedCategory 
      ? `http://localhost:5000/count-needsToSign/${selectedCategory}`
      : `http://localhost:5000/count-needsToSign`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJumlahNeedsToSign(res.data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  const getJumlahPending = async(selectedCategory) => {
    try {
      const url = selectedCategory 
      ? `http://localhost:5000/count-pendingDoc/${selectedCategory}`
      : `http://localhost:5000/count-pendingDoc`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJumlahPending(res.data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  const getJumlahCompleted = async(selectedCategory) => {
    try {
      const url = selectedCategory 
      ? `http://localhost:5000/count-completed/${selectedCategory}`
      : `http://localhost:5000/count-completed`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJumlahCompleted(res.data || []);
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    }
  };

  // console.log("jumlahNeedsToSign:", jumlahNeedsToSign);

  useEffect(() => {
    getJumlahNeedsToSign(selectedCategory);
    getJumlahPending(selectedCategory);
    getJumlahCompleted(selectedCategory);

  }, [selectedCategory]);


  const handleUpload = () => {
    history.push("/admin/upload-document");
  }
  
  return (
    <>
      {isLoading === false ? (
        <Container>
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
            <Row>
              <Col lg="4" sm="6">
                  <Card className="card-stats">
                  <Card.Body>
                    <Row>
                      <Col xs="5">
                        <div className="icon-big icon-warning">
                          <FaFileSignature className="text-warning" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Needs to sign</p>
                        </div>
                      </Col>
                      <Col>
                      <div className="text-right">
                        {/* <Card.Title className="card-plafond"><h3 style={{fontWeight: 600}} className="mt-0">
                          {jumlahNeedsToSign?.jumlahNeedsToSign}
                          </h3>
                        </Card.Title> */}
                        <Card.Title className="card-plafond"><h3 style={{fontWeight: 600}} className="mt-0">
                          {/* {jumlahNeedsToSign?.jumlahNeedsToSign} */}
                          
                          {Array.isArray(currentItems) 
                            ? currentItems.filter(d => d.is_deleted !== true).length
                            : (jumlahNeedsToSign?.jumlahNeedsToSign ?? 0)
                          }
                          </h3>
                        </Card.Title>
                      </div>
                      </Col>
                    </Row>
                  </Card.Body>
                  <Card.Footer>
                    <hr></hr>
                    <div className="stats">
                      Needs to sign
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
              <Col lg="4" sm="6">
                <Card className="card-stats">
                  <Card.Body>
                    <Row>
                      <Col xs="5">
                        <div className="icon-big icon-warning">
                          <FaHourglassStart className="text-secondary" />
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Pending sign</p>
                        </div>
                      </Col>
                      <Col>
                        <div className="text-right">
                          <Card.Title className="card-plafond"><h3 style={{fontWeight: 600}} className="mt-0">
                            {/* {jumlahPending?.jumlahPending} */}
                            
                            {Array.isArray(currentItems) 
                              ? currentItems.filter(d => !d.is_deleted && getStatusById(d.id_dokumen) === "Pending").length
                              : (jumlahPending?.jumlahPending ?? 0)
                            }
                            </h3>
                            </Card.Title>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                  <Card.Footer>
                    <hr></hr>
                    <div className="stats">
                      Pending sign
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
              <Col lg="4" sm="6">
                <Card className="card-stats">
                  <Card.Body>
                    <Row>
                      <Col xs="5">
                        <div className="icon-big icon-warning">
                          <FaClipboardCheck className="text-success"/>
                        </div>
                      </Col>
                      <Col xs="7">
                        <div className="numbers">
                          <p className="card-category">Completed</p>
                        </div>
                      </Col>
                      <Col>
                        <div className="text-right">
                          <Card.Title className="card-plafond">
                            <h3 style={{fontWeight: 600}} className="mt-0">
                              {/* {jumlahCompleted?.jumlahCompleted} */}

                               {Array.isArray(currentItems) 
                                  ? currentItems.filter(d => !d.is_deleted && getStatusById(d.id_dokumen) === "Completed").length
                                  : (jumlahCompleted?.jumlahCompleted ?? 0)
                                }
                            </h3>
                            </Card.Title>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                  <Card.Footer>
                    <hr></hr>
                    <div className="stats">
                      Completed
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            </Row>  
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
                      {(() => {
                        const status = getStatusById(document.id_dokumen);
                        const allSubmitted = document.LogSigns.every((log) => log.is_submitted === true);

                        let badge;
                        if (status === "Decline") {
                          badge = <Badge pill bg="danger">Decline</Badge>;
                        } else if (status === "Completed" && allSubmitted) {
                          badge = <Badge pill bg="success">Completed</Badge>;
                        } else  {
                          badge = <Badge pill bg="secondary">Pending</Badge>;
                        }

                        return (
                          <>
                            <p>{badge}</p>
                            {!(status === "Completed" || status === "Decline" || allSubmitted) && (
                              <p className="signer-font">{getProgress(document)}</p>
                            )}
                          </>
                        );
                      })()}
                    </td>

                    <td className="text-center">{getDeadlineById(document.id_dokumen) !== '0000-00-00' ? getDeadlineById(document.id_dokumen) : '-'}</td>
                    <td className="text-center">{new Date(document.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                    
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
                      />
                    </button>
                    </td>
                    <td className="text-center px-0">
                      <button
                        style={{ background: "transparent", border: "none" }}
                        disabled={document.user_active === true}
                        hidden={getStatusById(document.id_dokumen) === "Decline"}

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
      ) : (
          <>
            <div className="d-flex flex-column flex-wrap align-items-center justify-content-center" style={{ height: '80vh'}}>
              <ReactLoading type="cylon" color="#fb8379" height={200} width={200} />
              <h3 style={{paddingTop:'50px'}}>Please Wait...</h3>
            </div>
          </>
      )}
    </>
  );
}

export default Document;

