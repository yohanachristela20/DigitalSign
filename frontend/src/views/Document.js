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

  // console.log("Selected category: ", selectedCategory);
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

  // console.log("filtered documents: ", filteredDocuments);

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

  // console.log("filteredDocsStatus: ", filteredDocsStatus);

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


  // const downloadDoc = async (id_dokumen, ref, logSigns = []) => {
  //   try {
  //     const pdfUrl = `http://localhost:5000/pdf-document/${id_dokumen}`;
  //     const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

  //     const pdfDoc = await PDFDocument.load(existingPdfBytes);
  //     const pages = pdfDoc.getPages();

  //     for (let i = 0; i < logSigns.length; i++) {
  //       const sign = logSigns[i];
  //       if (sign?.is_submitted && sign?.sign_base64) {
  //         let cleanBase64 = sign.sign_base64.replace(/^data:image\/\w+;base64,/, "");

  //         const pngImage = await pdfDoc.embedPng(cleanBase64);

  //         const { width, height } = pages[0].getSize();
  //         const signWidth = 120;
  //         const signHeight = 60;

  //         const x = width - signWidth - 40;
  //         const y = 40 + (i * 80); 

  //         pages[0].drawImage(pngImage, {
  //           x,
  //           y,
  //           width: signWidth,
  //           height: signHeight,
  //         });
  //       }
  //     }

  //     const pdfBytes = await pdfDoc.save();
  //     const blob = new Blob([pdfBytes], { type: "application/pdf" });

  //     const a = window.document.createElement("a");
  //     a.href = URL.createObjectURL(blob);
  //     a.download = `${id_dokumen}.pdf`;
  //     window.document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(blob);
  //   } catch (error) {
  //     console.error("Downloading error:", error.message);
  //   }
  // };


  //last benar
  // const downloadDoc = async (id_dokumen, ref, logSigns = []) => {
  //   try {
  //     const pdfUrl = `http://localhost:5000/pdf-document/${id_dokumen}`;
  //     const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

  //     const pdfDoc = await PDFDocument.load(existingPdfBytes);
  //     const pages = pdfDoc.getPages();

  //     for (let i = 0; i < logSigns.length; i++) {
  //       const sign = logSigns[i];
  //       console.log("ID Dokumen:", id_dokumen, "ID Signers:", sign.id_signers, "ID Item:", sign.id_item);

  //       if (sign?.is_submitted && sign?.sign_base64) {
  //         const fieldRes = await axios.get(
  //           `http://localhost:5000/axis-field/${id_dokumen}/${sign.id_signers}/${sign.id_item}`
  //         );

  //         const fieldData = fieldRes.data?.[0]?.ItemField;
  //         if (!fieldData) continue;

  //         let { x_axis, y_axis, width, height} = fieldData;
  //         console.log("x_axis:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height);

  //         let cleanBase64 = sign.sign_base64.replace(/^data:image\/\w+;base64,/, "");
  //         // const uint8Array = Uint8Array.from(atob(cleanBase64), c => c.charCodeAt(0));
  //         const pngImage = await pdfDoc.embedPng(cleanBase64);

  //         const { height: pageHeight } = pages[0].getSize();
  //         // const x = Number(x_axis);
  //         // const y = pageHeight - Number(y_axis) - Number(height);

  //         // const { width, height } = pages[0].getSize();
  

  //         // const page = pages[0];
  //         // const x = Number(x_axis) || 0;
  //         // const y = pageHeight - Number(y_axis) - Number(height); 

  //         // pages[0].drawImage(pngImage, {
  //         //   x,
  //         //   y,
  //         //   width: Number(width),
  //         //   height: Number(height),
  //         // });

  //         const x = x_axis - Number(x_axis);
  //         const y = y_axis - Number(y_axis); 

  //         pages[0].drawImage(pngImage, {
  //           x,
  //           y,
  //           width: Number(height),
  //           height: Number(width),
  //         });
  //       }
  //     }

  //     const pdfBytes = await pdfDoc.save();
  //     const blob = new Blob([pdfBytes], { type: "application/pdf" });

  //     const a = window.document.createElement("a");
  //     a.href = URL.createObjectURL(blob);
  //     a.download = `${id_dokumen}.pdf`;
  //     window.document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(blob);
  //   } catch (error) {
  //     console.error("Downloading error:", error.message);
  //   }
  // };


  // const downloadDoc = async (id_dokumen, ref, logSigns = []) => {
  //   try {
  //     const pdfUrl = `http://localhost:5000/pdf-document/${id_dokumen}`;
  //     const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

  //     const pdfDoc = await PDFDocument.load(existingPdfBytes);
  //     const pages = pdfDoc.getPages();
  //     const firstPage = pages[0];
  //     const { height: pageHeight } = firstPage.getSize();

  //     for (let i = 0; i < logSigns.length; i++) {
  //       const sign = logSigns[i];
  //       console.log("ID Dokumen:", id_dokumen, "ID Signers:", sign.id_signers, "ID Item:", sign.id_item);

  //       if (sign?.is_submitted && sign?.sign_base64) {
  //         const fieldRes = await axios.get(
  //           `http://localhost:5000/axis-field/${id_dokumen}/${sign.id_signers}/${sign.id_item}`
  //         );

  //         const fieldData = fieldRes.data.filter(item => item.ItemField);
  //         if (!fieldData.length) continue;
          
  //         const urutanMapping = {};
  //         const submittedMapping = {};
  //         const delegateMapping = {};
  //         const allStatus = [];
  //         const localSignatureFields = [];


  //         for (let idx = 0; idx < fieldData.length; idx++) {
  //             const item = fieldData[idx];
  //             const{
  //                 x_axis, 
  //                 y_axis, 
  //                 width, 
  //                 height, 
  //                 jenis_item, 
  //                 id_item: fieldItemId,
  //             } = item.ItemField;

  //             const status = item.status || "Pending";
  //             const urutan = item.urutan;
  //             const is_submitted = item.is_submitted;

  //             if (!urutanMapping[fieldItemId]) {
  //                 urutanMapping[fieldItemId] = urutan;
  //             }

  //             if (!submittedMapping[sign.id_signers]) {
  //                 submittedMapping[sign.id_signers] = is_submitted;
  //             }

  //             const fieldObj = {
  //                 id: `field-${sign.id_signers}-${idx}`,
  //                 x_axis,
  //                 y_axis,
  //                 width,
  //                 height, 
  //                 jenis_item,
  //                 pageScale: 1,
  //                 enableResizing: false,
  //                 disableDragging: true,
  //                 id_item: fieldItemId, 
  //                 status,
  //                 urutan, 
  //                 is_submitted, 
  //                 show,
  //                 editable,
  //                 id_signers: sign.id_signers, 
  //                 is_delegated,
  //                 delegated_signers,
  //                 // token
  //             }; 

  //             allStatus.push({id_item: fieldItemId, status});

  //             // if (jenis_item === "Signpad") {
  //             //     localSignatureFields.push(fieldObj);
  //             // } else if (jenis_item === "Initialpad") {
  //             //     localInitialFields.push(fieldObj);
  //             // } else if (jenis_item === "Date") {
  //             //     localDateFields.push(fieldObj);
  //             // }

  //             console.log("x_axis:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height);

  //             let cleanBase64 = sign.sign_base64.replace(/^data:image\/\w+;base64,/, "");
  //             const pngImage = await pdfDoc.embedPng(cleanBase64);

  //             // const x = Number(x_axis);
  //             // const y = pageHeight - Number(y_axis);

            

  //             pages[0].drawImage(pngImage, {
  //               x : Number(x_axis),
  //               y: Number(y_axis),
  //               width: Number(height),
  //               height: Number(width),
  //             });

  //             console.log(
  //               `Drawing sign for item ${fieldItemId} => x:${x_axis}, y:${y_axis}, w:${width}, h:${height}`
  //             );
  //         }

  //         // let { x_axis, y_axis, width, height } = fieldData;
          
  //       }
  //     }

  //     const pdfBytes = await pdfDoc.save();
  //     const blob = new Blob([pdfBytes], { type: "application/pdf" });

  //     const a = window.document.createElement("a");
  //     a.href = URL.createObjectURL(blob);
  //     a.download = `${id_dokumen}.pdf`;
  //     window.document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     window.URL.revokeObjectURL(a.href);
  //   } catch (error) {
  //     console.error("Downloading error:", error.message);
  //   }
  // };


  const downloadDoc = async (id_dokumen, ref, logSigns = []) => { 
    try {
      const pdfUrl = `http://localhost:5000/pdf-document/${id_dokumen}`;
      const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());

      const pdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = pdfDoc.getPages();

      for (let i = 0; i < logSigns.length; i++) {
        const sign = logSigns[i];
        if (sign?.is_submitted && sign?.sign_base64) {
          const fieldRes = await axios.get(
            `http://localhost:5000/axis-field/${id_dokumen}/${sign.id_signers}/${sign.id_item}`
          );
          const fieldData = fieldRes.data.filter(item => item.ItemField);
          if (!fieldData.length) continue;

          let cleanBase64 = sign.sign_base64.startsWith("data:image")
          ? sign.sign_base64.replace(/^data:image\/\w+;base64,/, "")
          : sign.sign_base64;

          console.log("cleanBase64:", cleanBase64);
          const pngImage = await pdfDoc.embedPng(cleanBase64);

          for (let idx = 0; idx < fieldData.length; idx++) {
            const item = fieldData[idx];
            const { 
              x_axis, 
              y_axis, 
              width, 
              height, 
              id_item: fieldItemId 
            } = item.ItemField;

            const page = pages[0];
            const { height: pageHeight } = page.getSize();

            const w = Number(width) || 0;
            const h = (Number(height)/2) || 0;
            // const x = pageHeight - Number(x_axis) - ( w - h) || 0;
            // const y = pageHeight - Number(y_axis) - ( w - h ) || 0;

            const x = pageHeight - ((Number(x_axis) - w)/ 2);
            const y = pageHeight - (Number(y_axis) - (h/2));

            // const x = pageHeight - ((Number(x_axis) + (h+w)/2)*2);
            // const y = pageHeight - (Number(y_axis) - (h/2));

            pages[0].drawImage(pngImage, {
              x,
              y,
              width: w,
              height: h,
            });

            console.log(
              `Drawing sign for item ${fieldItemId} => x:${x}, y:${y}, w:${w}, h:${h}`
            );
          }
        }
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });

      const a = window.document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${id_dokumen}.pdf`;
      window.document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(a.href);
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
                        onClick={async(e) => {
                          e.preventDefault();
                          const ref = getRef(document.id_dokumen); 
                          const status = getStatusById(document.id_dokumen);
                          const logSigns = document.LogSigns || [];
                          const allSubmitted = logSigns.length > 0 && logSigns.every(sign => sign?.is_submitted === true && !!sign?.sign_base64);

                          if (status === "Completed" && allSubmitted) {
                            await downloadDoc(document.id_dokumen, ref, document.LogSigns);
                          } else {
                            await plainDoc(document.id_dokumen);
                          }
                        }}
                        className="text-success btn-action"
                      />
                    </button>

                    <div
                      ref={getRef(document.id_dokumen)}
                      style={{
                        position: "absolute",
                        // left: `${sign.x_axis}`,
                        // top: y_axis,
                        // width: "800px",
                        background: "#fff",
                        visibility: "hidden",
                        zIndex: -1
                      }}
                    >
                      <PDFCanvas pdfUrl={`http://localhost:5000/pdf-document/${document.id_dokumen}`} />

                      {document.LogSigns?.map((sign) => {
                        if (!sign.is_submitted || !sign.sign_base64) return null;
                        return (
                          <img
                            key={sign.id_logsign}
                            src={
                              sign.sign_base64.startsWith("data:image")
                                ? sign.sign_base64
                                : `data:image/png;base64,${sign.sign_base64}`
                            }
                            alt="Signature"
                            style={{
                              position: "absolute",
                              left: `${sign.x_axis}px`,   
                              top: `${sign.y_axis}px`,
                              width: `${sign.width}px`,
                              height: `${sign.height}px`,
                              pointerEvents: "none",
                            }}
                          />
                        );
                      })}


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

