// Without positioning field (drag only)
// Tanpa set positioning Field
// import React, { useState, useEffect, useRef, useMemo } from "react";
// import { useLocation, useHistory } from "react-router-dom";
// import axios from "axios";
// import { FaCalendar, FaExclamationTriangle, FaFont, FaInfo, FaInfoCircle, FaKey, FaSignature, FaUser } from 'react-icons/fa';

// import PDFCanvas from "components/Canvas/canvas.js";
// import { Rnd } from 'react-rnd';
// import { Document, Page, pdfjs } from "react-pdf";
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// import { Container, Spinner, Alert, Row, Col, Card, Navbar, Nav, Dropdown, Button, Modal, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
// import { toast } from "react-toastify";
// import { PDFDocument } from "pdf-lib";

// import SignatureModal from 'components/ModalForm/SignatureModal.js';
// import InitialModal from "components/ModalForm/InitialModal.js";
// import DeclineModal from "components/ModalForm/DeclineModal.js";
// import DocInfoModal from "components/ModalForm/DocInfoModal.js";
// import AuditTrailModal from "components/ModalForm/AuditTrailModal.js";
// import DelegateModal from "components/ModalForm/DelegateModal.js";

// import "../assets/scss/lbd/_receivedoc.scss";
// import "../assets/scss/lbd/_usernavbar.scss";
// import "../assets/scss/lbd/_login.scss";


// import html2canvas from "html2canvas";
// import {jsPDF} from "jspdf";

// import { saveAs } from "file-saver";

// function ReceiveDocument() {
//     const [pdfUrl, setPdfUrl] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [errorMsg, setErrorMsg] = useState("");
//     const [x_axis, setXAxis] = useState(0);
//     const [y_axis, setYAxis] = useState(0);
//     const [width, setWidth] = useState(0);
//     const [height, setHeight] = useState(0);
//     const [jenis_item, setJenisItem] = useState("");
//     const [fields, setFields] = useState([]);
//     const [id_dokumen, setIdDokumen] = useState("");
//     const [id_signers, setIdSigner] = useState("");
//     const [delegated_signers, setDelegatedSigners] = useState("");
//     const [id_karyawan, setIdKaryawan] = useState("");
//     const [id_item, setIdItem] = useState("");
//     const [sign_base64, setSignBase64] = useState("");
//     const [status, setStatus] = useState([]);
//     const [signStatus, setSignStatus] = useState([]);
//     const [nama, setNama] = useState("");
//     const [mainSigner, setMainSigner] = useState("");

//     const [idDokumen, setIDDokumen] = useState(null);

//     const [showSignatureModal, setShowSignatureModal] = React.useState(false);
//     const [showInitialModal, setShowInitialModal] = useState(false);
//     const [showDeclineModal, setShowDeclineModal] = useState(false);
//     const [showDocInfoModal, setShowDocInfoModal] = useState(false);
//     const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);
//     const [showDelegateModal, setShowDelegateModal] = useState(false);
    
//     const [showDownloadModal, setShowDownloadModal] = useState(false);

//     const [selectedIdItem, setSelectedIdItem] = useState([]);
    
//     const [initials, setInitials] = useState([]);
//     const [signedInitials, setSignedInitials] = useState([]);
//     const [initial, setInitial] = useState([]);

//     const [signatures, setSignatures] = useState([]);
//     const [signedSignatures, setSignedSignatures] = useState([]);
//     const [signature, setSignature] = useState([]);

//     const [page, setPage] = useState([]);

//     const [dateField, setDateField] = useState([]);
//     const [clickCount, setClickCount] = useState(0);
//     const timeRef = useRef(null);

//     const [signClicked, setSignClicked] = useState(false);
//     const [initClicked, setInitClicked] = useState(false);
//     const [nameSigner, setNameSigner] = useState("");

//     const [selectedSigner, setSelectedSigner] = useState(null);
//     const [selectedDocument, setSelectedDocument] = useState(null);
//     const [selectedKaryawan, setSelectedKaryawan] = useState(null);

//     const [urutan, setUrutan] = useState("");
//     const [urutanMap, setUrutanMap] = useState({});

//     const [allSigners, setAllSigners] = useState("");
//     const [submittedMap, setSubmittedMap] = useState({});
//     const [delegatedMap, setDelegatedMap] = useState({});

//     const [completeSubmitted, setCompleteSubmitted] = useState("");
//     const [nextSigner, setNextSigner] = useState("");
//     const [nextSignCompleted, setNextSignCompleted] = useState("");

//     const history = useHistory();

//     const [show, setShow] = useState("");
//     const [editable, setEditable] = useState("");

//     const [allItems, setAllItems] = useState("");
//     const [signerData, setSignerData] = useState([]);

//     const [initial_status, setInitialStatus] = useState([]);
//     const [submitted_list, setSubmittedList] = useState([]);
//     const [jenisItem_list, setJenisItemList] = useState([]);
//     const [delegate_status, setDelegateStatus] = useState([]);
//     const [token_db, setTokenDb] = useState([]);

//     const [verified, setVerified] = useState(false);
//     const [inputEmail, setInputEmail] = useState("");
//     const [emailVerified, setEmailVerified] = useState(false);

//     const [inputPassword, setInputPassword] = useState("");
//     const [isAccessed, setIsAccessed] = useState(false);
//     let [prevFields, setPrevFields] = useState("");
//     let [nextFields, setNextFields] = useState("");
//     const [isPrevFieldForNextSigner, setIsPrevFieldForNextSigner] = useState("");
//     const [isNextField, setIsNextField] = useState("");
//     const [finalSignerId, setFinalSignerId] = useState("");
//     const [is_delegated, setIsDelegated] = useState("");
//     const [actualSigner, setActualSigner] = useState("");
//     const [current_signer, setCurrentSigner] = useState("");
//     const [filteredFields, setFilterFields] = useState ("");
//     const [normalizedDelegated, setNormalizedDelegated] = useState("");
//     const [currentItemId, setCurrentItemId] = useState([]);
//     const [showDelegatedAlert, setShowDelegatedAlert] = useState(false);
//     const [delegateEmailSent, setDelegateEmailSent] = useState(false);
//     const [is_submitted, setIsSubmitted] = useState(false);

//     const [main_token, setMainToken] = useState("");
//     const [delegate_token, setDelegateToken] = useState("");
//     const [deadline, setDeadline] = useState("");
//     const [documents, setDocuments] = useState([]); 
//     const [is_download, setIsDownload] = useState(true);

//     const date = new Date();
//     const day = String(date.getDate()).padStart(2, '0');
//     const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"] 
//     const month = monthNames[date.getMonth()];
//     const year = date.getFullYear();
//     const currentDate = `${day} ${month} ${year}`;

//     const today = new Date();
//     // today.setHours(0, 0, 0, 0);
//     const currentYear = today.getFullYear();
//     const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
//     const todayDate = today.getDate().toString().padStart(2, '0');
//     const formattedDate = `${currentYear}-${currentMonth}-${todayDate}`;

//     console.log("FORMATTED DATE:", formattedDate);
    
//     const pdfContainerRef = useRef(null);
//     const pdfRefs = useRef({});

//     // const isdelegated = localStorage.getItem("is_delegated");
//     const delegatedDoc = localStorage.getItem("id_dokumen");
    

//     // console.log("isDelegated from modal:", isdelegated);
//     // console.log("delegatedDoc:", delegatedDoc);

//     const mobileSidebarToggle = (e) => {
//         e.preventDefault();
//         document.documentElement.classList.toggle("nav-open");
//         var node = document.createElement("div");
//         node.id = "bodyClick";
//         node.onclick = function () {
//         this.parentElement.removeChild(this);
//         document.documentElement.classList.toggle("nav-open");
//         };
//         document.body.appendChild(node);
//     };
    
    
//     const location = useLocation();
//     const queryParams = new URLSearchParams(location.search);
//     const token = queryParams.get("token");
//     // console.log("TOKEN QUERY PARAMS:", token);

//     const styleRnd = {
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: 'rgba(25, 230, 25, 0.5)'
//     };

//     const styleIcon = {
//         width: "25%",
//         height: "25%"
//     }

//     const selectedCategory = location.state?.selectedCategory;

//     const getDocument = async (selectedCategory) =>{
//         try {
//         const url = selectedCategory 
//         ? `http://localhost:5000/document/category/${selectedCategory}`
//         : `http://localhost:5000/document`;

//         const response = await axios.get(url, {
//             headers: {
//             Authorization: `Bearer ${token}`,
//         },
//         });
//         setDocuments(response.data || []);
//         } catch (error) {
//         console.error("Error fetching data:", error.message); 
//         } finally {
//         setLoading(false);
//         }
//     };

//     useEffect(() => {
//         getDocument(selectedCategory);
//     }, [selectedCategory]);

//     const handleSignatureClick = (id_item, show, editable) => {
//         const signer = signatures.find(i => i.id_item === id_item);
//         if (signer) {
//             setSelectedIdItem(id_item);
//             setSelectedSigner(signer);
//             setShowSignatureModal(true);
//             setShow(show);
//             setEditable(editable);

//         }
//     };

//     const handleInitialClick = (id_item, show, editable) => {
        
//         const clickedField = initials.find(i => i.id_item === id_item);
        
//         if (!clickedField) {
//             console.warn(`handleInitialClick: No initial field found for id_item: ${id_item}`);
//             return;
//         }

//         setSelectedIdItem(id_item);
//         setSelectedSigner(clickedField?.id_signers || null);
//         setShowInitialModal(true);
//         setShow(show);
//         setEditable(editable);
//     };

//     const handleDeclineClick = (id_dokumen, id_signers) => {
//         if (!id_dokumen || !id_signers) {
//             console.warn("id_dokumen or id_signers not found.");
//             return;
//         }

//         setSelectedSigner(id_signers);
//         setSelectedDocument(id_dokumen);
//         setShowDeclineModal(true);
//     };

//      const handleDelegateClick = (id_dokumen, id_signers) => {
//         if (!id_dokumen || !id_signers) {
//             console.warn("id_dokumen or id_signers not found.");
//             return;
//         }

//         setSelectedSigner(id_signers);
//         setSelectedDocument(id_dokumen);
//         setShowDelegateModal(true);
//     };

//     const handleDocInfoClick = (id_dokumen, id_signers, id_karyawan) => {
//         if (!id_dokumen || !id_signers) {
//             console.warn("id_dokumen or id_signers not found.");
//             return;
//         }

//         setSelectedSigner(id_signers);
//         setSelectedDocument(id_dokumen);
//         setSelectedKaryawan(id_karyawan);
//         setShowDocInfoModal(true);
//     };

//     const handleAuditTrail = (id_dokumen, id_signers) => {
//         if (!id_dokumen || !id_signers) {
//             console.warn("id_dokumen or id_signers not found.");
//             return;
//         }

//         setSelectedSigner(id_signers);
//         setSelectedDocument(id_dokumen);
//         setSelectedKaryawan(id_karyawan);
//         setShowAuditTrailModal(true);
//     };
    
//     const handleSignatureSuccess = () => {
//         toast.success("Document signed successfully.", {
//             position: "top-right",
//             autoClose: 5000,
//             hideProgressBar: true,
//         });
//     };

//     useEffect(() => {
//         const checkAccessStatus = async() => {
//             if (!token) return;

//             try {
//                 const docRes = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
//                 const { id_dokumen, id_signers } = docRes.data;

//                 setIdDokumen(id_dokumen);
//                 setIdSigner(id_signers);

//                 const logsignRes = await axios.get(`http://localhost:5000/access-status?token=${token}`);
//                 const accessed = logsignRes.data.is_accessed;
//                 setIsAccessed(accessed);

//                 // console.log("IsAccessed:", accessed);

//                 if (accessed === true) {
//                     setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
//                     setEmailVerified(true);
//                     setVerified(true);
//                 } else {
//                     setEmailVerified(false);
//                     setVerified(false);
//                     setPdfUrl("");
//                 }

//             } catch (error) {
//                 console.error("Error:", error);
//                 setIsAccessed(false);
//                 setEmailVerified(false);
//                 setPdfUrl("");
//             }
//         };
//         checkAccessStatus();
//     }, [token]);

//     const handleEmailVerify = async (e) => { 
//         e.preventDefault();
//         setErrorMsg("");

//         try {
//             const docRes = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
//             const { id_dokumen, id_signers, currentSigner} = docRes.data;
//             await axios.post("http://localhost:5000/link-access-log", { token, real_email: inputEmail, password: inputPassword, is_accessed: true, currentSigner });
//             setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
//             setEmailVerified(true);
//             setVerified(true);
//             setIsAccessed(true);
//         } catch (error) {
//             setErrorMsg("Access Denied: Token doesn't valid or email not found.");
//             setEmailVerified(false);
//             setPdfUrl("");
//             setIsAccessed(false);

//         } finally {
//             setLoading(false);
//         }
//     }


//     const getSelectedSignerInfo = () => {
//         return signerData.find(signer => signer.id_signers === selectedSigner && signer.id_karyawan === selectedKaryawan);
//     };

//     useEffect(() => {
//     const fetchData = async () => {
//         if (!token) return;

//         try {
//             const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
//             const id_dokumen = res.data.id_dokumen;
//             const allSigners = res.data.id_signers;
//             const urutan = res.data.urutan;
//             const currentSigner = res.data.currentSigner;
//             const allItems = res.data.id_item;
//             const idKaryawan = res.data.id_karyawan;
//             const delegated_signers = res.data.delegated_signers || null;
//             const is_delegated = res.data.is_delegated;
//             const main_token = res.data.main_token;
//             const delegate_token = res.data.delegate_token;
//             const deadline = res.data.deadline;

//             console.log("Deadline from token:", deadline);

//             const finalSignerId = allSigners || currentSigner || delegated_signers;
//             setDelegatedSigners(delegated_signers);
//             setCurrentSigner(currentSigner);

//             if (!id_dokumen || !allSigners || !urutan || !allItems || !idKaryawan) {
//                 throw new Error("Missing id_dokumen, id_signers, id_item, id_karyawan or urutan from token.");
//             }

//             setIdDokumen(id_dokumen);
//             setIdSigner(currentSigner);
//             setAllSigners(allSigners);
//             setAllItems(allItems);
//             setIdKaryawan(idKaryawan);
//             setFinalSignerId(finalSignerId);
//             setIsDelegated(is_delegated);
//             setMainToken(main_token);
//             setDelegateToken(delegate_token);
//             setDeadline(deadline)

//             const fileRes = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`);
//             if (!fileRes.ok) {
//                 throw new Error("Failed to get PDF Document.");
//             }

//             const blob = await fileRes.blob();
//             const url = URL.createObjectURL(blob);
//             setPdfUrl(url);

//             const localSignatureFields = [];
//             const localInitialFields = [];
//             const localDateFields = [];
//             const allStatus = [];
//             const allSigner = [];

//             const signerArray = Array.isArray(finalSignerId) ? finalSignerId : [finalSignerId];
//             const itemArray = Array.isArray(allItems) ? allItems : [allItems];
//             const karyawanArray = Array.isArray(idKaryawan) ? idKaryawan : [idKaryawan];

//             const urutanMapping = {};
//             const submittedMapping = {};
//             const delegateMapping = {};

//             for (const signer of signerArray) {
//                 const resSignerInfo = await axios.get(`http://localhost:5000/doc-info/${id_dokumen}/${signer}`);
//                     const dataSignerInfo = resSignerInfo.data;
//                     if (dataSignerInfo.length > 0 && dataSignerInfo[0]?.Signerr && dataSignerInfo[0]?.DocName) {
//                         const signerInfo = {
//                             id_signers: dataSignerInfo[0].id_signers,
//                             nama: dataSignerInfo[0].Signerr.nama,
//                             organisasi: dataSignerInfo[0].Signerr.organisasi,
//                             doc_name: dataSignerInfo[0].DocName.nama_dokumen,
//                             email: dataSignerInfo[0].Signerr.Penerima?.email,
//                         };
//                         signerData.push(signerInfo);
//                     }

//                 const response = await axios.get(`http://localhost:5000/decline/${id_dokumen}/${signer}`);
//                 const data = response.data;

//                 if (data.length > 0 && data[0].Signerr){
//                     allSigner.push({
//                         id_signers: data[0].id_signers, 
//                         nama: data[0].Signerr.nama,
//                     });
//                 }

//                 setSignerData(allSigner);

//                 let mainSigner = allSigners;
//                 if (is_delegated) {
//                     mainSigner = res.data.id_signers;
//                 }

//                 setMainSigner(mainSigner);

//                 let querySigner = signer;
//                 setActualSigner(querySigner);
                
//                 for (const itemID of itemArray) {
//                     const fieldRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${querySigner}/${itemID}`);

//                     const validFields = fieldRes.data.filter(item => item.ItemField);

//                     for (let idx = 0; idx < validFields.length; idx++) {
//                         const item = validFields[idx];
//                         const{
//                             x_axis, 
//                             y_axis, 
//                             width, 
//                             height, 
//                             jenis_item, 
//                             page,
//                             id_item: fieldItemId,
//                         } = item.ItemField;

//                         const status = item.status || "Pending";
//                         const urutan = item.urutan;
//                         const is_submitted = item.is_submitted;

//                         if (!urutanMapping[fieldItemId]) {
//                             urutanMapping[fieldItemId] = urutan;
//                         }

//                         if (!submittedMapping[signer]) {
//                             submittedMapping[signer] = is_submitted;
//                         }

//                         const fieldObj = {
//                             id: `field-${querySigner}-${idx}`,
//                             x_axis,
//                             y_axis,
//                             width,
//                             height, 
//                             jenis_item,
//                             page,
//                             pageScale: 1,
//                             enableResizing: false,
//                             disableDragging: true,
//                             id_item: fieldItemId, 
//                             status,
//                             urutan, 
//                             is_submitted, 
//                             show,
//                             editable,
//                             id_signers: querySigner, 
//                             is_delegated,
//                             delegated_signers,
//                             // token
//                         }; 

//                         console.log("FieldObj:", fieldObj);

//                         allStatus.push({id_item: fieldItemId, status});

//                         if (jenis_item === "Signpad") {
//                             localSignatureFields.push(fieldObj);
//                         } else if (jenis_item === "Initialpad") {
//                             localInitialFields.push(fieldObj);
//                         } else if (jenis_item === "Date") {
//                             localDateFields.push(fieldObj);
//                         }
//                     }
//                 }
//             }

//             setSignatures(localSignatureFields);
//             setInitials(localInitialFields);
//             setDateField(localDateFields);
//             setSignStatus(allStatus);
//             setUrutanMap(urutanMapping);
//             setSubmittedMap(submittedMapping);
//             setDelegatedMap(delegateMapping);

//         } catch (error) {
//             console.error("Failed to load PDF:", error.message);
//             setErrorMsg(error.message);
//             toast.error("Load document error or Expired token.");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchData();
//     }, [token]);

    
//     useEffect(() => {
//         if (signerData.length === 0) return;
//         const foundSigner = signerData.find(s => s.id_signers === id_signers); 

//         if (foundSigner) {
//             setNama(foundSigner.nama);
//         }
//     }, [id_signers, signerData]);

//     const updateSubmitted = async(id_dokumen, current_signer) => {
//         try {
//             const response = await axios.patch(`http://localhost:5000/update-submitted/${id_dokumen}/${current_signer}`, {
//                 is_submitted: true,
//                 status: "Completed",
//                 tgl_tt: date,
//             });

//             toast.success("Document signed successfully.", {
//                 position: "top-right", 
//                 autoClose: 5000, 
//                 hideProgressBar: true,
//             });

//             if (is_delegated && id_signers === delegated_signers && !delegateEmailSent) {
//                 await sendSignedDelegate(id_dokumen, delegated_signers, token);
//                 setDelegateEmailSent(true);
//             }

//             window.location.reload();
//         } catch (error) {
//             toast.error("Failed to save signed document.", {
//                 position: "top-right",
//                 autoClose: 5000,
//                 hideProgressBar: true,
//             });
//         }
//     };

//     const sendSignedDelegate = async(id_dokumen, delegated_signers, token) => {

//         try {
//             const signedDelegate = await axios.post('http://localhost:5000/signed-delegate-email', {
//                 id_dokumen, 
//                 delegated_signers,
//                 token
//             });

//             toast.success("Signed delegate email sent!", {
//                 position: "top-right",
//                 autoClose: 5000,
//                 hideProgressBar: true,
//             });

//         } catch (error) {
//             console.error("Failed to send signed delegate email:", error.message);
//             toast.error("Failed to send signed delegate email.");
//         }
//     }

//     useEffect(() => {
//     const fetchAllFields = async () => {
//         if (!id_dokumen || !allSigners || !allItems || allSigners.length === 0 || Object.keys(urutanMap).length === 0) return;

//         try {
//         const signerArray = Array.isArray(allSigners) ? allSigners : [allSigners];
//         const itemArray = Array.isArray(allItems) ? allItems : [allItems];
//         const signerParam = signerArray.join(",");

//         const initialsRes = await axios.get(`http://localhost:5000/initials/${id_dokumen}/${signerParam}`);
//         const initialsData = initialsRes.data;
//         const fieldBuffer = [];

//         for (const signer of signerArray) {
//             for (const itemId of itemArray) {
//                 const currentUrutan = Number(urutanMap[itemId]);
//                 const currentSubmitted = submittedMap[signer];
//                 const currentDelegated = delegatedMap[signer] || false;
//                 const axisRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}/${itemId}`);
//                 const signerFields = axisRes.data.filter(field => field.ItemField?.jenis_item);
//                 const signerInitials = initialsData.filter(init => init.id_signers === signer && init.id_item === itemId);

//                 for (const field of signerFields) {
//                     const matchInitial = signerInitials.find(init => init.id_item === field.id_item);
//                     const base64 = matchInitial?.sign_base64;
//                     const formattedBase64 = base64?.startsWith("data:image")? base64 : base64 ? `data:image/png;base64,${base64}` : null;

//                     const delegatedForThisSigner = matchInitial?.delegated_signers || null;


//                     fieldBuffer.push({
//                         id_item: field.id_item,
//                         id_signers: signer,
//                         sign_base64: formattedBase64,
//                         status: matchInitial?.status || "Pending", 
//                         nama: matchInitial?.Signerr?.nama || "-", 
//                         x_axis: field.ItemField?.x_axis || 0,
//                         y_axis: field.ItemField?.y_axis || 0,
//                         width: field.ItemField?.width || 0,
//                         height: field.ItemField?.height || 0,
//                         page: field.ItemField?.page || 0,
//                         enableResizing: false,
//                         disableDragging: true,
//                         jenis_item: field.ItemField?.jenis_item || "", 
//                         urutan: currentUrutan, 
//                         id_dokumen, 
//                         is_submitted: currentSubmitted,
//                         rawField: field,
//                         is_delegated,
//                         nowSigner: finalSignerId,
//                         delegated_signers: delegatedForThisSigner,
//                         token,

//                     });
//                 }
//             }
//         }

//         const allFields = fieldBuffer.map(field => {
//             const {urutan: currentUrutan, id_item, id_signers, current_signer, delegated_signers} = field;
            
//             let normalizedDelegated = null;
//             if (delegated_signers && !Array.isArray(delegated_signers)) {
//                 normalizedDelegated = [String(delegated_signers)];
//             } else if (Array.isArray(delegated_signers)) {
//                 normalizedDelegated = delegated_signers.map(String);
//             }

//             setNormalizedDelegated(normalizedDelegated);

//             const prevSignerItem = Object.keys(urutanMap).find(key => Number(urutanMap[key]) === currentUrutan - 1);
//             setPrevFields(prevSignerItem);

//             const nextSignerItem = Object.keys(urutanMap).find(key => Number(urutanMap[key]) === currentUrutan + 1);
//             setNextFields(nextSignerItem);

//             const prevFields = fieldBuffer.filter(f => f.id_item === prevSignerItem);
//             const nextFields = fieldBuffer.filter(f => f.id_item === nextSignerItem);

//             const prevStatusList = prevFields.map(f => f.status);
//             const prevSubmittedList = prevFields.map(f => f.is_submitted);

//             const allCompleted = prevStatusList.length > 0 && 
//             prevStatusList.every(s => s === "Completed") && 
//             prevSubmittedList.every(s => s === true);

//             let show = true;
//             let editable = true;

//             if (signerArray.length > 1) {
//                 if (currentUrutan === 1) {
//                     show = true;
//                     editable = true;
//                 } else if (prevStatusList.length === 0) {
//                     show = false;
//                     editable = false;
//                 } else if (allCompleted) {
//                     show = true;
//                     editable = true;
//                 } else if (prevSubmittedList.every(s => s !== true)) {
//                     show = false;
//                     editable = false;
//                 } else {
//                     show = true;
//                     editable = false;
//                 }
//             }

//             if (field.jenis_item === "Date") {
//                 show = true;
//                 editable = false;
//             }

//             const nextSignerInitials = initialsData.filter(init => 
//                 {
//                     if (is_delegated === true) {
//                         return init.delegated_signers === nextSignerItem
//                     } else {
//                          return init.id_signers === nextSignerItem
//                     }
//                 }
//             );
//             const nextSignerSubmitted = submittedMap[nextSignerItem];
//             const nextSignCompleted = nextSignerInitials.length > 0 && nextSignerSubmitted === true;

//             const isPrevFieldForNextSigner = nextSignerItem && field.id_signers !== id_signers && !field.sign_base64;

//             setIsPrevFieldForNextSigner(isPrevFieldForNextSigner);
//             setCompleteSubmitted(allCompleted);

//             return {
//                 ...field,
//                 delegated_signers: normalizedDelegated,
//                 show, 
//                 editable,
//                 prevSigner: prevSignerItem,
//                 nextSigner: nextSignerItem, 
//                 nextSignCompleted, 
//                 prevFieldDisplay: isPrevFieldForNextSigner,
//             };
//         });

//         setSignedInitials(allFields); 
//         setSignedSignatures(allFields);

//         console.log("SignedInitials:", allFields);

//         const ownerSigner = allFields.find(s => {

//             if (!s.delegated_signers) return false;
//             if (Array.isArray(s.delegated_signers)) {
//                 return s.delegated_signers.map(String).includes(String(current_signer));
//             }
//             return String(s.delegated_signers) === String(current_signer);
//         });


//         const ownerSignerId = ownerSigner ? String(ownerSigner.id_signers) : null;


//         const filteredFields = allFields.filter(field => {
//             const fieldOwner = String(field.id_signers) || "";
            
//             if (ownerSignerId) {
//                 return fieldOwner === ownerSignerId; 
//             }

//             return fieldOwner === String(current_signer);
//         });
//         setFilterFields(filteredFields);

//         setInitial(filteredFields);
//         setSignature(filteredFields);
//         setDateField(filteredFields);

//         const statusList = filteredFields.map(field => field.status);
//         setInitialStatus(statusList);

//         const delegateList = filteredFields.map(field => field.is_delegated);
//         setDelegateStatus(delegateList);

//         const submittedList = filteredFields.map(field => field.is_submitted);
//         setSubmittedList(submittedList);

//         const jenisItemList = filteredFields.map(field => field.jenis_item);
//         setJenisItemList(jenisItemList);

//         const pageList = filteredFields.map(field => field.page);
//         setPage(pageList);

//         const nextSignCompletedList = allFields
//             .filter(field => field.prevSigner === id_signers)
//             .map(field => field.is_submitted);
//         setNextSignCompleted(nextSignCompletedList);


//         } catch (error) {
//         console.error("Failed to fetch initials or axis-field:", error.message);
//         }
//     };

//     fetchAllFields();
//     }, [id_dokumen, id_signers, urutanMap, allSigners, current_signer]);

//     const nonDateItems = initial
//     .filter(item => item.jenis_item !== "Date")
//     .map(item => ({
//         jenis_item: item.jenis_item,
//         is_delegated: item.is_delegated,
//         status: item.status,
//         is_submitted: item.is_submitted
//     }));

//     const isNonDateCompleted = nonDateItems.every(item => item.status === "Completed");
//     const isNonDateNotCompleted = nonDateItems.every(item => item.status !== "Completed");
//     const isNonDateSubmitted =  nonDateItems.every(item => item.is_submitted === true);

//     const isDelegatedSigner = is_delegated && delegated_signers === current_signer;

//     const isFinishDisabled = isDelegatedSigner ? isNonDateNotCompleted : isNonDateNotCompleted;
//     const isFinishHidden = isDelegatedSigner ? (isNonDateCompleted && isNonDateSubmitted) : (isNonDateCompleted && isNonDateSubmitted);

//     const itemArray = Array.isArray(allItems) ? allItems : [allItems];
//     const signerArray = Array.isArray(allSigners) ? allSigners : [allSigners];
    
//     useEffect(() => {
//         let allCurrentItemIds = [];
//         for (const signer of signerArray) {
//             for (const item of itemArray) {

//             const activeItems = initial.filter(sig => sig.id_signers === signer && sig.show && !sig.is_submitted);
//             const currentItemIds = activeItems.map(activeItem => activeItem.id_item);
//             allCurrentItemIds = [...new Set([...allCurrentItemIds, ...currentItemIds])];
            
//                 for (const activeItem of activeItems){
//                     const currentItemId = activeItem.id_item;
//                     const isCurrentItem = currentItemId === item;

//                 }
//             }
//         }

//         setCurrentItemId(prev => {
//             const prevArray = Array.isArray(prev) ? prev : [];
//             const isSame = 
//             prevArray.length === allCurrentItemIds.length && 
//             prevArray.every(id => allCurrentItemIds.includes(id));
//             return isSame ? prevArray : allCurrentItemIds;
//         });
//     }, [signerArray, itemArray, initial]);
    

//     useEffect(() => {
//         const hasSubmitted = initial.some(sig => sig?.is_submitted === true);
//         setIsSubmitted(hasSubmitted);
//     }, [initial]);

//     const showDelegateAlert = !is_delegated === true && is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc !== id_dokumen) : !is_delegated || (delegatedDoc === id_dokumen);

//     const plainPDF = async (id_dokumen) => {
//         try {
//             const res = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`);
//             if (!res.ok) throw new Error("Failed to fetch PDF for download.");

//             const blob = await res.blob();
//             const url = window.URL.createObjectURL(blob);

//             const a = document.createElement("a"); 
//             a.href = url;
//             a.download = `${id_dokumen}.pdf`;
//             document.body.appendChild(a);
//             a.click();
//             a.remove();
//             window.URL.revokeObjectURL(url);
//         } catch (error) {
//             console.error("Downloading error:", error.message);
//         }
//     }

//     const getRef = (id) => {
//         if (!pdfRefs.current[id]) {
//             pdfRefs.current[id] = React.createRef();
//         }
//         return pdfRefs.current[id];
//     }

//     const downloadPDF = async (id_dokumen, ref, LOGSIGN) => {
//         try {
//             const pdfUrl = `http://localhost:5000/pdf-document/${id_dokumen}`;
//             const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
//             const pdfDoc = await PDFDocument.load(existingPdfBytes);

//             const pages = pdfDoc.getPages();
//             const scale = 1.5;

//             for (const sign of LOGSIGN) {
//                 if (sign.status === "Completed" && sign.is_submitted) {
//                     const axisRes = await fetch(
//                         `http://localhost:5000/axis-field/${id_dokumen}/${sign.id_signers}/${sign.id_item}`
//                     ).then(res => res.json());

//                     const field = axisRes[0]?.ItemField;
//                     if (!field) continue;

//                     let { x_axis, y_axis, width, height, jenis_item } = field;
//                     x_axis = jenis_item === "Date" ? Number(x_axis) / scale + 40 : Number(x_axis) / scale;
//                     y_axis = jenis_item === "Initialpad" ? Number(y_axis) / scale + 20 : jenis_item === "Signpad" ? Number(y_axis) / scale + 10 :jenis_item === "Date" ? Number(y_axis) / scale - 60 : Number(y_axis) / scale ;
//                     //y_axis initialpad +20 atau hanya /scale saja
                    
//                     width = Number(height) / scale;
//                     height = Number(width) / scale - 20;

//                     let targetPageIndex = 0;
//                     let remainingY = y_axis;
//                     for (let i = 0; i < pages.length; i++) {
//                         const pageHeight = pages[i].getHeight();
//                         if (remainingY <= pageHeight) {
//                             targetPageIndex = i;
//                             break;
//                         }
//                         remainingY -= pageHeight;
//                     }

//                     const page = pages[targetPageIndex];
//                     const pageHeight = page.getHeight();
//                     const yPos = pageHeight - remainingY - height + 29;

//                     if (jenis_item === "Initialpad" || jenis_item === "Signpad") {
//                         let base64Url = sign.sign_base64;
//                         if (!base64Url.startsWith("data:image")) {
//                             base64Url = `data:image/png;base64,${base64Url}`;
//                         }

//                         const pngImage = await pdfDoc.embedPng(base64Url);

//                         page.drawImage(pngImage, {
//                             x: x_axis,
//                             y: yPos,
//                             width,
//                             height,
//                         });
//                     } else{
//                         let date = new Date(sign.tgl_tt);
//                         const day = String(date.getDate()).padStart(2, '0');
//                         const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"] 
//                         const month = monthNames[date.getMonth()];
//                         const year = date.getFullYear();
//                         const currentDate = `${day} ${month} ${year}`;

//                         page.drawText(currentDate, {
//                             x: x_axis,
//                             y: yPos,
//                             size: 9,
//                             textAlign: 'center',
//                         });
//                     }
//                 }
//             }

//             const signedBytes = await pdfDoc.save();
//             const loadingTask = pdfjsLib.getDocument({ data: signedBytes, disableStream: true, disableAutoFetch: true });
//             const pdf = await loadingTask.promise;

//             let finalPdf;
//             for (let i = 1; i <= pdf.numPages; i++) {
//                 const page = await pdf.getPage(i);
//                 const viewport = page.getViewport({ scale: 2 });
//                 const canvas = document.createElement("canvas");
//                 const ctx = canvas.getContext("2d");
//                 canvas.width = viewport.width;
//                 canvas.height = viewport.height;

//                 await page.render({ canvasContext: ctx, viewport }).promise;

//                 const imgData = canvas.toDataURL("image/jpeg", 1.0);
//                 const orientation = canvas.width > canvas.height ? "landscape" : "portrait";

//                 if (i === 1) {
//                     finalPdf = new jsPDF({
//                         orientation,
//                         unit: "px",
//                         format: [canvas.width, canvas.height],
//                         compress: true,
//                     });
//                 } else {
//                     finalPdf.addPage([canvas.width, canvas.height], orientation);
//                 }

//                 finalPdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
//             }

//             const finalBytes = finalPdf.output("blob");
//             saveAs(finalBytes, `signed_${id_dokumen}.pdf`);

//         } catch (error) {
//             console.error("Downloading error:", error.message);
//         }
//     };
    
//     const pendingFields = signedInitials.filter(sig => {
//         if (!sig || !sig.id_item || sig.show !== true) return false;

//         const isCompleted = sig.status === "Completed";
//         const isSubmitted = sig.is_submitted === true;

//         const currentSignerStr = String(id_signers);
//         const delegatedArray = Array.isArray(sig.delegated_signers)
//         ? sig.delegated_signers.map(String)
//         : sig.delegated_signers ? [String(sig.delegated_signers)] : [];

//         const normalizedArray = Array.isArray(normalizedDelegated)
//         ? normalizedDelegated.map(String)
//         : normalizedDelegated ? [String(normalizedDelegated)] : [];

//         const isSigner = 
//         String(sig.id_signers) === currentSignerStr || 
//         delegatedArray.includes(currentSignerStr) ||
//         normalizedArray.includes(currentSignerStr);
        
//         return isSigner && !isCompleted && !isSubmitted;
//     });

//     let pendingCount = pendingFields.length;

//     const handleJumpTo = () => {
//         if (pendingFields.length === 0) return;

//         const firstField = pendingFields[0];
//         const fieldElement = document.getElementById(`field-${firstField.id_item}-${firstField.id_signers}`);
//         if (fieldElement) {
//             fieldElement.scrollIntoView({behavior: "smooth", block:"center"});
//             fieldElement.focus?.();
//         }
//     };

//     return (
//         <>
//             <Navbar className="bg-navbar nav-padding w-100" style={{position:'fixed', top:'0'}} expand="lg" hidden={isAccessed !== true}>
//                 <Container fluid>
//                 <div className="d-flex justify-content-center align-items-center ml-2 ml-lg-0">
//                     <Button
//                     variant="dark"
//                     className="d-lg-none btn-fill d-flex justify-content-center align-items-center rounded-circle p-2"
//                     onClick={mobileSidebarToggle}
//                     >
//                     <i className="fas fa-ellipsis-v"></i>
//                     </Button>
//                     <Navbar.Brand
//                     onClick={(e) => e.preventDefault()}
//                     >
//                     <img
//                         src={require("assets/img/logo2.png")}
//                         alt="sidebar-logo"
//                         style={{ width: '30px' }}
//                         className="img-items mr-2"
//                     />
//                     <span className="fs-5">Campina Sign</span>
//                     </Navbar.Brand>
//                 </div>
//                 <Navbar.Collapse id="basic-navbar-nav">
//                     <Nav className="ml-auto" style={{marginRight:'50px'}}>
//                     <Dropdown as={Nav.Item}>
//                         <Dropdown.Toggle
//                         aria-expanded={false}
//                         as={Nav.Link}
//                         id="navbarDropdownMenuLink"
//                         variant="default"
//                         className="mr-5 mt-2"
//                         // hidden={is_delegated ? isDelegatedAlertVisible && token === delegate_token : isDelegatedAlertVisible}
                        
//                         //last
//                         // hidden={is_delegated || is_submitted ? isDelegatedAlertVisible && token === delegate_token : isDelegatedAlertVisible}
//                         // hidden={(!is_submitted)  && (delegatedDoc === id_dokumen)}

//                         // hidden={!is_submitted ? (!is_delegated && delegate_token !== null) || (delegatedDoc === id_dokumen) : !is_submitted && (delegatedDoc === id_dokumen)}

//                         //last benar
//                         // hidden={is_submitted ? (!is_delegated && delegate_token !== null) && (delegatedDoc === id_dokumen) : !is_submitted && (!is_delegated && delegate_token !== null) && (delegatedDoc === id_dokumen)}

//                         // hidden={
//                         //     !is_delegated 
//                         //     ? ((is_submitted && delegate_token === null) && (delegatedDoc === id_dokumen))
//                         //     : !is_delegated && (is_submitted && delegate_token !== null)
//                         // }

//                         // hidden={
//                         //     (is_delegated && is_submitted && delegatedDoc === id_dokumen && !is_submitted  )
//                         // }

//                         // hidden={!is_delegated && !is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc === id_dokumen) : is_submitted || !is_delegated === true && (delegatedDoc !== id_dokumen)}

//                         hidden={
//                             (token !== delegate_token) &&
//                             (!is_delegated ) &&
//                             (delegatedDoc === id_dokumen) ||
//                             initial_status.every(status => status === "Decline")
//                         }

//                         // hidden={
//                         //         (token === delegate_token && !is_submitted) ||
//                         //         (is_delegated === true && is_submitted) ||
//                         //         (delegatedDoc !== id_dokumen)
//                         //     }

//                         // hidden={!is_delegated || is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc === id_dokumen) : is_submitted || !is_delegated && (delegatedDoc !== id_dokumen)}

//                         // hidden={!is_delegated || is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc === id_dokumen) : is_submitted || !is_delegated && (delegatedDoc !== id_dokumen)}



//                         >
//                         <span className="fs-6">Actions</span>
//                         </Dropdown.Toggle>
//                         <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink" style={{ width: '200px' }}>
//                         <Dropdown.Item
//                             onClick={() => handleDeclineClick(id_dokumen, id_signers)}
//                             hidden={initial_status.every(status => status === "Decline" || status === "Completed")}
//                         >
//                             Decline
//                         </Dropdown.Item>
//                         <div className="divider" hidden={initial_status.every(status => status === "Decline" || status === "Completed")}></div>
//                         <Dropdown.Item
//                             href="#"
//                             onClick={() => handleDelegateClick(id_dokumen, id_signers)}
//                             hidden={initial_status.every(status => status === "Decline" || status === "Completed") || delegated_signers}
//                         >
//                             Delegate
//                         </Dropdown.Item>
//                         <div className="divider" hidden={initial_status.every(status => status === "Decline" || status === "Completed") || delegated_signers}></div>
//                         <Dropdown.Item
//                             href="#"
//                             onClick={() => handleDocInfoClick(id_dokumen, id_signers, id_karyawan)}
//                         >
//                             Document Info
//                         </Dropdown.Item>
//                         <div className="divider"></div>
                        
//                         <Dropdown.Item
//                             href="#"
//                             onClick={() => handleAuditTrail(id_dokumen, id_signers)}
//                         >   Audit Trail
//                         </Dropdown.Item>
//                         {(() => {
//                             const currentDoc = documents.find(doc => doc.id_dokumen === id_dokumen);
//                             if (!currentDoc) return null;

//                             const hasDownload = currentDoc.LogSigns?.some(log => log.is_download === true);

//                             if (!hasDownload) return null; 

//                             return (
//                                 <>
//                                     <div className="divider"></div>
//                                     <Dropdown.Item
//                                         href="#"
//                                         onClick={async (e) => {
//                                         e.preventDefault();

//                                         const ref = getRef(id_dokumen);
//                                         const LOGSIGN = JSON.parse(JSON.stringify(currentDoc.LogSigns || []));

//                                         LOGSIGN.forEach((log, i) => {
//                                             console.log(`LogSigns[${i}].sign_base64:`, log.sign_base64);

//                                             log.is_submitted
//                                             ? downloadPDF(id_dokumen, ref, LOGSIGN)
//                                             : plainPDF(id_dokumen);
//                                         });
//                                         }}
//                                     >
//                                         Download
//                                     </Dropdown.Item>
//                                 </>
//                             );
//                         })()}


//                         </Dropdown.Menu>
//                     </Dropdown>

//                     <Button
//                         className="submit-btn w-100 mt-3 fs-6"
//                         type="submit"
//                         onClick={() => updateSubmitted(id_dokumen, current_signer)}
//                         disabled={isFinishDisabled}
//                         // hidden={pendingCount == 0 && !is_delegated === true && !is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc === id_dokumen) : is_submitted || !is_delegated === true && (delegatedDoc !== id_dokumen)}
//                         // hidden={((is_delegated && is_submitted && delegate_token !== null) || (token !== delegate_token) && (delegatedDoc === id_dokumen)) || (is_submitted && !is_delegated === true && (delegatedDoc !== id_dokumen))}
//                         hidden={is_delegated !== true && !is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc === id_dokumen) || initial_status.every(status => status === "Decline") : is_submitted || !is_delegated === true && (delegatedDoc !== id_dokumen)}

//                     >
//                         Finish
//                     </Button>
//                     </Nav>

//                     <Button
//                         className="navigate-btn mt-3 fs-6"
//                         type="button"
//                         onClick={handleJumpTo}

//                         // hidden={!is_delegated || is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc === id_dokumen) : is_submitted || !is_delegated && (delegatedDoc !== id_dokumen)}

//                         // hidden={
//                         //     pendingCount == 0 ||
//                         //     (!is_delegated && delegate_token === null || delegatedDoc === id_dokumen && !is_submitted  )
//                         // }

//                         hidden={
//                             pendingCount == 0 ||
//                             (token !== delegate_token) &&
//                             (!is_delegated ) &&
//                             (delegatedDoc === id_dokumen) ||
//                             initial_status.every(status => status === "Decline")
//                         }


//                     >
//                         Jump to ({pendingCount})
//                     </Button>
//                 </Navbar.Collapse>
//                 </Container>
//             </Navbar>

//             <div>
//                 <Container fluid className="px-0 center-object">
//                         {loading && <Spinner animation="border" variant="primary" />}
//                         <div className="sign-in__user d-flex align-items-center justify-content-center">
                        
//                         {isAccessed === false ? 
//                             (
//                             <Alert variant="danger" style={{marginTop: "-680px"}} hidden={initial_status.every(status => status !== "Expired")}>
//                                 <FaExclamationTriangle className="mb-1 mr-2"/> Access denied, token expired.
//                             </Alert>
//                             ) : (
//                                 <>
//                                 </>    
//                             )
//                         }

//                         <Alert variant="danger" style={{marginTop: "-680px"}} hidden={initial_status.every(status => status !== "Decline")}>
//                             <FaExclamationTriangle className="mb-1 mr-2"/> {nama} has declined to sign this document.
//                         </Alert>
//                         <Alert variant="warning" style={{marginTop: "-680px"}}
//                             hidden={
//                                 (token === delegate_token && !is_submitted) ||
//                                 (is_delegated === true && is_submitted) ||
//                                 (delegatedDoc !== id_dokumen)
//                             }
//                         >
//                             <FaExclamationTriangle className="mb-1 mr-2"/> {nama} has delegate this document to other signer.
//                         </Alert>

                       
//                         {isAccessed !== true && (
                    
//                         <Row className="login-user user-element" style={{marginTop: "-2px"}}>
//                             <Card className="login-card shadow mb-0">
//                                 <>{errorMsg && <Alert variant="danger" className="m-4">{errorMsg}</Alert>}</>
//                                 <div className="d-flex justify-content-center">
//                                     <img src={require("assets/img/login2.png")} alt="login-img" className="login-illustration" />
//                                 </div>
//                                 <Card.Body>
//                                     <h4 className="text-center font-form mt-3 mb-2">Campina Sign</h4>
//                                     <Alert variant="info" className="mb-0"><FaInfoCircle className="mr-2"/>Please verify your email</Alert>
//                                     <Form onSubmit={handleEmailVerify}>
//                                         <Form.Group> 
//                                             <span class="input-group-text bg-transparent border-0" id="basic-addon1">
//                                                 <FaUser style={{ marginRight: '8px' }} />
//                                                 <Form.Control
//                                                     type="email"
//                                                     placeholder="Email"
//                                                     value={inputEmail}
//                                                     onChange={(e) => setInputEmail(e.target.value)}
//                                                     required
//                                                     style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}
//                                                     className="m-0"
//                                                 />
//                                             </span>
//                                         </Form.Group>
//                                         <Form.Group className="mb-3">
//                                             <span class="input-group-text bg-transparent  border-0" id="basic-addon1">
//                                                 <FaKey style={{ marginRight: '8px' }} />
//                                                 <Form.Control
//                                                     type="password"
//                                                     placeholder="Password"
//                                                     value={inputPassword}
//                                                     onChange={(e) => setInputPassword(e.target.value)}
//                                                     required 
//                                                     style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}   
//                                                 />
//                                             </span> 
//                                         </Form.Group>
//                                         <Button type="submit" className="w-100 mt-2" disabled={loading} 
//                                             style={{ backgroundColor: "#4c4ef9", border: "none", color: "white", marginBottom:'15px'}}
//                                             >
//                                             {loading ? "Verifying..." : "Verify Email"}
//                                         </Button>
//                                         <p className="text-center font-footer" style={{fontSize:15}}>Forget Password? Please contact Super Admin.</p>
//                                     </Form>
//                                 </Card.Body>
//                             </Card>
//                         </Row>
//                         )}
//                         </div>
//                         {isAccessed === true && pdfUrl && (
//                             <div>
//                                 <div className="vertical-center mt-5" >
//                                     <PDFCanvas pdfUrl={pdfUrl} signatures={signatures} initials={initials} dateField={dateField} />                           

//                                     {signedInitials.map((sig) => {
//                                         if (!sig || !sig.id_item || sig.show !== true) return null;

//                                         const isCompleted = sig.status === "Completed";
//                                         const isSubmitted = sig.is_submitted === true;
//                                         const isDatefield = sig.jenis_item === "Date";
//                                         const isInitialpad = sig.jenis_item === "Initialpad";
//                                         const isSignpad = sig.jenis_item === "Signpad";
//                                         const isDecline = sig.status === "Decline";
//                                         const isPrevField = sig.prevFieldDisplay === true;
//                                         const completedNext = sig.is_submitted === true;
//                                         const urutan = sig.urutan;
//                                         const currentItem = sig.id_item === currentItemId;
//                                         const is_delegated = sig.is_delegated;
//                                         const delegated_signers = sig.delegated_signers;

//                                         const isSignerOwner = sig.id_signers === id_signers;
//                                         const isSignerDelegated = delegated_signers === id_signers;

//                                         const isFirstSigner = urutan === 1;

//                                         const delegatedArray = Array.isArray(delegated_signers)
//                                         ? delegated_signers.map(String)
//                                         : delegated_signers ? [String(delegated_signers)] : [];

//                                         const normalizedArray = Array.isArray(normalizedDelegated)
//                                         ? normalizedDelegated.map(String)
//                                         : normalizedDelegated ? [String(normalizedDelegated)] : [];

//                                         let bgFirst = is_delegated === true || !currentItem ?  "rgba(86, 90, 90, 0.3)" : isSubmitted ? "transparent" : "rgba(25, 230, 25, 0.5)";
//                                         let bgOthers = is_delegated === true || !currentItem ? "rgba(86, 90, 90, 0.3)" : isSubmitted ? "transparent": "rgba(25, 230, 25, 0.5)";


//                                         if (isCompleted === true) {
//                                             bgFirst = "transparent";
//                                             bgOthers = "transparent";
//                                         }

//                                         const bgStyle = 
//                                         isSubmitted || isCompleted
//                                         ? "transparent"
//                                         : !isSignerDelegated && !isSignerOwner
//                                         ? "rgba(86, 90, 90, 0.4)"
//                                         : !isSignerOwner && !isSignerDelegated
//                                         ? "rgba(86, 90, 90, 0.4)"
//                                         : !isSubmitted || isCompleted
//                                         ? "rgba(25, 230, 25, 0.4)"
//                                         : "transparent";

//                                         let firstBorderStyle = (isSubmitted) ? "transparent" : is_delegated || !currentItem ? "solid 5px rgba(86, 90, 90, 0.3)" : "solid 5px rgba(25, 230, 25, 0.5)";
//                                         let otherBorderStyle = (isSubmitted) ? "transparent" : is_delegated || !currentItem ? "solid 5px rgba(86, 90, 90, 0.3)" : "solid 5px rgba(25, 230, 25, 0.5)";

//                                         const zIndexStyle = isPrevField && !isFirstSigner ? 1 : 2;

//                                         const groupByUrutan = signedInitials.reduce((acc, field) => {
//                                             if (!acc[field.urutan]) acc[field.urutan] = [];
//                                             acc[field.urutan].push(field);
//                                             return acc;
//                                         }, {});

//                                         const getMessageForUrutan = (urutan) => {
//                                             const fields = groupByUrutan[urutan] || [];
//                                             const currentSignerStr = String(id_signers);

//                                             const relatedSigners = new Set();

//                                             fields.forEach(f => {
//                                                 //cek id_signers yg punya delegated_signers ke current signer
//                                                 if (Array.isArray(f.delegated_signers) 
//                                                 ? f.delegated_signers.map(String).includes(currentSignerStr)
//                                                 : String(f.delegated_signers) === currentSignerStr) {
//                                                     relatedSigners.add(String(f.id_signers));
//                                                 }

//                                                 // cek id_signers yg ada di normalizedDelegated ke current signer
//                                                 if (Array.isArray(f.normalizedDelegated) 
//                                                 ? f.normalizedDelegated.map(String).includes(currentSignerStr)
//                                                 : String(f.normalizedDelegated) === currentSignerStr) {
//                                                     relatedSigners.add(String(f.id_signers));
//                                                 }

//                                                 if (String(f.id_signers) === currentSignerStr) {
//                                                     relatedSigners.add(currentSignerStr);
//                                                 }
//                                             });

//                                             const isOtherSignerGroup = fields.some(f => !relatedSigners.has(String(f.id_signers)));

//                                             if (!isOtherSignerGroup) return "";

//                                             const relatedCompleted = fields
//                                                 .filter(f => relatedSigners.has(String(f.id_signers)))
//                                                 .every(f => f.status === "Completed");

//                                             if (relatedCompleted && !isSubmitted) {
//                                                 return <p className="text-center">Another sign didn't complete</p>;
//                                             }

//                                         };

//                                         const message = getMessageForUrutan(sig.urutan);

//                                         const currentSignerStr = String(current_signer);
//                                         const isCurrentItem = currentItemId.includes(sig.id_item);

//                                         let content;

//                                         if (isCompleted && sig.sign_base64) {
//                                         content = (
//                                             <img
//                                             src={sig.sign_base64}
//                                             alt="Initial"
//                                             style={{ width: "100%", height: "100%" }}
//                                             />
//                                         );
//                                         } else if (!is_delegated && isFirstSigner) {
//                                         content = message;
//                                         } else if (!is_delegated && !isFirstSigner) {
//                                         content = message;
//                                         } else if (is_delegated && isInitialpad) {
//                                         content = <FaFont style={{ width: "100%", height: "100%"}} />;
//                                         } else if (isSignpad) {
//                                         content = <FaSignature style={{ width: "25%", height: "25%", top: "50%", left: "50%", position: "absolute", transform: "translate(-50%, -50%)"}} />;
//                                         } else {
//                                         content = <></>;
//                                         }

//                                         const canClick = !is_delegated === true && !is_submitted ? (token === delegate_token && !is_submitted) || (isCurrentItem && delegatedDoc === id_dokumen) : !is_delegated === true || is_submitted && (isCurrentItem && delegatedDoc !== id_dokumen);

//                                         return (
//                                             <>
//                                                 <Rnd
//                                                     id={`field-${sig.id_item}-${sig.id_signers}`} 
//                                                     key={`${sig.id_signers}-${sig.id_item}`}
//                                                     position={{ x: Number(sig.x_axis), y: Number(sig.y_axis) }}
//                                                     size={{ width: Number(sig.height), height: Number(sig.width) }}
//                                                     enableResizing={sig.enableResizing}
//                                                     disableDragging={sig.disableDragging}
//                                                     style={{
//                                                         display: "flex",
//                                                         alignItems: "center",
//                                                         justifyContent: "center",
//                                                         backgroundColor: bgStyle,
//                                                         border: isFirstSigner ? firstBorderStyle : otherBorderStyle,
//                                                         zIndex: zIndexStyle,     
//                                                         cursor: !is_submitted && isCurrentItem ? canClick && showDelegateAlert ? "default" : "pointer" : "default",


//                                                     }}
//                                                     hidden={isDecline}
//                                                     onClick={() => {
//                                                         const currentSignerStr = String(current_signer);
//                                                         const isCurrentSigner = 
//                                                         String(sig.id_signers) === currentSignerStr ||
//                                                         delegatedArray.includes(currentSignerStr) ||
//                                                         normalizedArray.includes(currentSignerStr);
//                                                         if (!is_submitted && (is_delegated === true && !isSubmitted) || isCurrentItem  && (delegatedDoc !== id_dokumen)) {
//                                                             if (isInitialpad && isCurrentItem){
//                                                                 handleInitialClick(sig.id_item, sig.show, sig.editable);
//                                                             } else if (isSignpad && isCurrentItem){
//                                                                 handleSignatureClick(sig.id_item, sig.editable, sig.show);
//                                                             }
//                                                         }
//                                                     }}
//                                                     disabled ={isSubmitted === true}

//                                                 >
//                                                     {console.log("isDELEGATED:", is_delegated)}

//                                                     {!isSubmitted && (is_delegated === true && !isSubmitted) || isCurrentItem  && (delegatedDoc !== id_dokumen) ? (
//                                                         <OverlayTrigger
//                                                             placement="bottom"
//                                                             overlay={<Tooltip id="initialCompleteTooltip" hidden={!isCurrentItem}>Click to change your sign.</Tooltip>}
//                                                         >
//                                                             {({ ref, ...triggerHandler }) => (
//                                                             <>
//                                                                 <div {...triggerHandler} ref={ref} style={{width: "100%", height: "100%" }}>
//                                                                     {!message && (isInitialpad && !isCompleted) ? (
//                                                                         <div
//                                                                             style={{
//                                                                                 width: "25%",
//                                                                                 height: "25%",
//                                                                                 top: "50%",
//                                                                                 left: "50%",
//                                                                                 position: "absolute",
//                                                                                 transform: "translate(-50%, -50%)",
//                                                                             }}
//                                                                         >
//                                                                             {content}
//                                                                         </div>
//                                                                     ) : message && (isInitialpad && !isCompleted) ? (
//                                                                         <div
//                                                                             style={{
//                                                                                 top: "50%",
//                                                                                 left: "50%",
//                                                                                 position: "absolute",
//                                                                                 transform: "translate(-50%, -50%)",
//                                                                             }}
//                                                                         >
//                                                                             {content}
//                                                                         </div>
//                                                                     ) : (
//                                                                         <div
//                                                                             style={{
//                                                                                 width: "100%",
//                                                                                 height: "100%",
//                                                                                 top: "50%",
//                                                                                 left: "50%",
//                                                                                 position: "absolute",
//                                                                                 transform: "translate(-50%, -50%)",
//                                                                             }}
//                                                                         >
//                                                                             {content}
//                                                                         </div>
//                                                                     )}
//                                                                 </div>

//                                                                 {isCompleted && isDatefield ? (
//                                                                     currentDate 
//                                                                 ) : (
//                                                                     isDatefield ? <FaCalendar style={{ width: "25%", height: "25%", top: "50%", left: "50%", position: "absolute", transform: "translate(-50%, -50%)" }} /> : <></>
//                                                                 )}
//                                                             </>
//                                                             )}
//                                                         </OverlayTrigger>
//                                                         ) : (
//                                                         <>
//                                                             {content}

//                                                             {isCompleted && isDatefield ? (
//                                                                 currentDate 
//                                                             ) : (
//                                                                 isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }} /> : <></>
//                                                             )}
//                                                         </>
//                                                     )}
//                                                 </Rnd>
//                                             </>
//                                         );
//                                     })}

//                                     {initial.map((sig) => {
//                                         if (!sig || !sig.id_item || sig.show !== true) return null;

//                                         const isCompleted = sig.status === "Completed";
//                                         const isSubmitted = sig.is_submitted === true;
//                                         const isDecline = sig.status === "Decline";
//                                         const isInitialpad = sig.jenis_item === "Initialpad";
//                                         const isSignpad = sig.jenis_item === "Signpad";
//                                         const isDatefield = sig.jenis_item === "Date";
//                                         const isPrevField = sig.prevFieldDisplay === true;
//                                         const prevSigner = sig.prevSigner; 
//                                         const urutan = sig.urutan;
//                                         const isFirstSigner = urutan === 1;
//                                         const currentSigner = sig.id_signers;
//                                         const currentItem = sig.id_item === currentItemId;
//                                         const nextSigner = sig.nextSigner;
//                                         const is_delegated = sig.is_delegated;

//                                         const isSignerOwner = sig.id_signers === id_signers;
//                                         const isSignerDelegated = delegated_signers === id_signers;

//                                         const prevField = signedInitials.find(field => field.id_item === prevSigner);
//                                         const prevNotSubmitted = prevField && (
//                                             prevField.status !== "Completed" || prevField.is_submitted !== true
//                                         );
                                        

//                                         //FIX PLISSS JGN DIUBAH!!!
//                                         const borderStyle = 
//                                         isSubmitted 
//                                         ? "transparent"
//                                         : !isSignerDelegated && !isSignerOwner
//                                         ? "solid 5px rgba(86, 90, 90, 0.5)"
//                                         : !isSignerOwner && !isSignerDelegated
//                                         ? "solid 5px rgba(86, 90, 90, 0.5)"
//                                         : !isSubmitted
//                                         ? "solid 5px rgba(25, 230, 25, 0.5)"
//                                         : isFirstSigner && !isCompleted 
//                                         ? "solid 5px rgba(25, 230, 25, 0.5)" 
//                                         : "transparent";

//                                         const backgroundColor = isPrevField 
//                                         ? "rgba(86, 90, 90, 0.5)"
//                                         : prevNotSubmitted 
//                                         ? "rgba(86, 90, 90, 0.5)"
//                                         : isFirstSigner && isCompleted && !isPrevFieldForNextSigner
//                                         ? "solid 5px rgba(86, 90, 90, 0.5)"
//                                         : !isPrevFieldForNextSigner
//                                         ? "solid 5px rgba(86, 90, 90, 0.5)"
//                                         : "solid 5px rgba(86, 90, 90, 0.5)";

//                                         const delegatedArray = Array.isArray(delegated_signers)
//                                         ? delegated_signers.map(String)
//                                         : delegated_signers ? [String(delegated_signers)] : [];

//                                         const normalizedArray = Array.isArray(normalizedDelegated)
//                                         ? normalizedDelegated.map(String)
//                                         : normalizedDelegated ? [String(normalizedDelegated)] : [];


//                                         let bgFirst = is_delegated === true || currentItem ?  "rgba(25, 230, 25, 0.5)" : isSubmitted ? "transparent" : "rgba(86, 90, 90, 0.3)";
//                                         let bgOthers = is_delegated === true || currentItem ? "rgba(25, 230, 25, 0.5))" : isSubmitted ? "transparent": "rgba(86, 90, 90, 0.3)";

//                                         const bgStyle = 
//                                         isSubmitted || isCompleted
//                                         ? "transparent"
//                                         : !isSignerDelegated && !isSignerOwner
//                                         ? "rgba(86, 90, 90, 0.4)"
//                                         : !isSignerOwner && !isSignerDelegated
//                                         ? "rgba(86, 90, 90, 0.4)"
//                                         : !isSubmitted || isCompleted 
//                                         ? "rgba(25, 230, 25, 0.4)"
//                                         : "transparent";


//                                         if (isCompleted === true) {
//                                             bgFirst = "transparent";
//                                             bgOthers = "transparent";
//                                         }

//                                         const currentSignerStr = String(current_signer);

                                       
//                                         const isCurrentItem = currentItemId.includes(sig.id_item);

//                                         const signerItemCount = initial.filter(item => 
//                                             currentItemId.includes(item.id_item) && (
//                                                 String(item.id_signers) === currentSignerStr ||
//                                                 delegatedArray.includes(currentSignerStr) || 
//                                                 normalizedArray.includes(currentSignerStr)
//                                             )
//                                         ).length;
//                                         const canClick = !is_delegated === true && !is_submitted ? (token === delegate_token && !is_submitted) || (isCurrentItem && delegatedDoc === id_dokumen) : !is_delegated === true || is_submitted && (isCurrentItem && delegatedDoc !== id_dokumen);

//                                         return (
//                                             <Rnd
//                                                 id={`field-${sig.id_item}-${sig.id_signers}`} 
//                                                 key={`${sig.id_signers}-${sig.id_item}`}
//                                                 position={{ x: Number(sig.x_axis), y: Number(sig.y_axis) }}
//                                                 size={{ width: Number(sig.height), height: Number(sig.width) }}
//                                                 enableResizing={sig.enableResizing}
//                                                 disableDragging={sig.disableDragging}
//                                                 style={{
//                                                     display: "flex",
//                                                     alignItems: "center",
//                                                     justifyContent: "center",
//                                                     backgroundColor: 
//                                                         bgStyle,
//                                                     border: borderStyle, 

//                                                     cursor: !is_submitted && isCurrentItem ? canClick && showDelegateAlert ? "default" : "pointer" : "default",

//                                                     zIndex: isCompleted ? 1 : 2,
//                                                 }}
//                                                 hidden={isDecline}
//                                                 onClick={() => {
//                                                     const currentSignerStr = String(current_signer);
//                                                     const isCurrentSigner = 
//                                                     String(sig.id_signers) === currentSignerStr ||
//                                                     delegatedArray.includes(currentSignerStr) ||
//                                                     normalizedArray.includes(currentSignerStr);

//                                                     if (!is_submitted && (is_delegated === true && !isSubmitted) || isCurrentItem  && (delegatedDoc !== id_dokumen)) {
//                                                         if (!is_delegated ? isInitialpad && isCurrentItem || is_delegated : isInitialpad && isCurrentItem && is_delegated){
//                                                             handleInitialClick(sig.id_item, sig.show, sig.editable);
//                                                         } else if (!is_delegated ? isSignpad && isCurrentItem || is_delegated : isSignpad && isCurrentItem && is_delegated) {
//                                                             handleSignatureClick(sig.id_item, sig.editable, sig.show);
//                                                         }
//                                                     }
//                                                 }}
//                                                 disabled ={isSubmitted === true}
//                                             >
//                                                 {!isSubmitted ? (
//                                                 <OverlayTrigger
//                                                     placement="bottom"
//                                                     overlay={<Tooltip id="initialCompleteTooltip" hidden={!isCurrentItem || !is_delegated}>Click to change your sign.</Tooltip>}
//                                                 >
//                                                     {({ ref, ...triggerHandler }) => (
//                                                     <>
//                                                         {isCompleted && sig.sign_base64 ? (
//                                                         <img
//                                                             {...triggerHandler}
//                                                             ref={ref}
//                                                             src={sig.sign_base64}
//                                                             alt="Initial"
//                                                             style={{ width: "100%", height: "100%" }}
//                                                         />
//                                                         ) : (
//                                                             isInitialpad ? <FaFont style={{ width: "25%", height: "25%" }} /> : isSignpad ? <FaSignature style={{ width: "25%", height: "25%" }} /> :  <></>
//                                                         )}

//                                                         {isCompleted && isDatefield ? (
//                                                             currentDate
//                                                         ) : (
//                                                             isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }} /> : <></>
//                                                         )}
//                                                     </>
//                                                     )}
//                                                 </OverlayTrigger>
//                                                 ) : (
//                                                 <>
//                                                     {isCompleted && sig.sign_base64 ? (
//                                                     <img
//                                                         src={sig.sign_base64}
//                                                         alt="Initial"
//                                                         style={{ width: "100%", height: "100%" }}
//                                                     />
//                                                     ) : (
//                                                         isInitialpad ? <FaFont style={{ width: "25%", height: "25%" }} /> : isSignpad ? <FaSignature style={{ width: "25%", height: "25%" }} /> : <></>
//                                                     )}

//                                                     {isCompleted && isDatefield ? (
//                                                         currentDate
//                                                     ) : (
//                                                         isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }}/> : <></>
//                                                     )}
//                                                 </>
//                                                 )}


//                                             </Rnd>
//                                         );
//                                     })}

//                                     <SignatureModal showSignatureModal={showSignatureModal} setShowSignatureModal={setShowSignatureModal} onSuccess={handleSignatureSuccess} selectedIdItem={selectedIdItem} selectedSigner={selectedSigner} />

//                                     <InitialModal
//                                         showInitialModal={showInitialModal}
//                                         setShowInitialModal={setShowInitialModal}
//                                         onSuccess={handleSignatureSuccess}
//                                         selectedIdItem={selectedIdItem}
//                                         selectedSigner={selectedSigner}
//                                     />

//                                     <DeclineModal
//                                         showDeclineModal={showDeclineModal}
//                                         setShowDeclineModal={setShowDeclineModal}
//                                         onSuccess={handleSignatureSuccess}
//                                         selectedSigner={selectedSigner}
//                                         selectedDocument={selectedDocument}
//                                     />

//                                     <DelegateModal 
//                                         showDelegateModal={showDelegateModal}
//                                         setShowDelegateModal={setShowDelegateModal}
//                                         onSuccess={handleSignatureSuccess}
//                                         selectedSigner={selectedSigner}
//                                         selectedDocument={selectedDocument}
//                                     />

//                                     <DocInfoModal
//                                         showDocInfoModal={showDocInfoModal}
//                                         setShowDocInfoModal={setShowDocInfoModal}
//                                         onSuccess={handleSignatureSuccess}
//                                         selectedSigner={selectedSigner}
//                                         selectedDocument={selectedDocument}
//                                         signerInfo ={getSelectedSignerInfo()}
//                                     />

//                                     <AuditTrailModal
//                                         showAuditTrailModal={showAuditTrailModal}
//                                         setShowAuditTrailModal={setShowAuditTrailModal}
//                                         onSuccess={handleSignatureSuccess}
//                                         selectedSigner={selectedSigner}
//                                         selectedDocument={selectedDocument}
//                                         signerInfo ={getSelectedSignerInfo()}
//                                     />
                                    
//                                 </div>
//                             </div>  
//                         )}

//                 </Container>   
//             </div>
//         </>
//     );
// }

// export default ReceiveDocument;



// w/ positioning field when clicked
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import { FaCalendar, FaExclamationTriangle, FaFont, FaInfo, FaInfoCircle, FaKey, FaSignature, FaUser } from 'react-icons/fa';

import { Rnd } from 'react-rnd';
import { pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { Container, Spinner, Alert, Row, Col, Card, Navbar, Nav, Dropdown, Button, Modal, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { toast } from "react-toastify";
import { PDFDocument } from "pdf-lib";

import SignatureModal from 'components/ModalForm/SignatureModal.js';
import InitialModal from "components/ModalForm/InitialModal.js";
import DeclineModal from "components/ModalForm/DeclineModal.js";
import DocInfoModal from "components/ModalForm/DocInfoModal.js";
import AuditTrailModal from "components/ModalForm/AuditTrailModal.js";
import DelegateModal from "components/ModalForm/DelegateModal.js";

import "../assets/scss/lbd/_receivedoc.scss";
import "../assets/scss/lbd/_usernavbar.scss";
import "../assets/scss/lbd/_login.scss";

import {jsPDF} from "jspdf";

import { saveAs } from "file-saver";

function ReceiveDocument() {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [delegated_signers, setDelegatedSigners] = useState("");
    const [id_karyawan, setIdKaryawan] = useState("");
    const [signStatus, setSignStatus] = useState([]);
    const [nama, setNama] = useState("");
    const [mainSigner, setMainSigner] = useState("");
    const [showSignatureModal, setShowSignatureModal] = React.useState(false);
    const [showInitialModal, setShowInitialModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showDocInfoModal, setShowDocInfoModal] = useState(false);
    const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);
    const [showDelegateModal, setShowDelegateModal] = useState(false);
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedIdItem, setSelectedIdItem] = useState([]);
    
    const [initials, setInitials] = useState([]);
    const [signedInitials, setSignedInitials] = useState([]);
    const [initial, setInitial] = useState([]);

    const [signatures, setSignatures] = useState([]);
    const [signedSignatures, setSignedSignatures] = useState([]);
    const [signature, setSignature] = useState([]);

    const [page, setPage] = useState([]);
    const [pages, setPages] = useState([]);

    const [dateField, setDateField] = useState([]);
    const [clickCount, setClickCount] = useState(0);
    const timeRef = useRef(null);

    const [selectedSigner, setSelectedSigner] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedKaryawan, setSelectedKaryawan] = useState(null);

    const [urutan, setUrutan] = useState("");
    const [urutanMap, setUrutanMap] = useState({});

    const [allSigners, setAllSigners] = useState("");
    const [submittedMap, setSubmittedMap] = useState({});
    const [delegatedMap, setDelegatedMap] = useState({});

    const [completeSubmitted, setCompleteSubmitted] = useState("");
    const [nextSigner, setNextSigner] = useState("");
    const [nextSignCompleted, setNextSignCompleted] = useState("");

    const history = useHistory();

    const [show, setShow] = useState("");
    const [editable, setEditable] = useState("");

    const [allItems, setAllItems] = useState("");
    const [signerData, setSignerData] = useState([]);

    const [initial_status, setInitialStatus] = useState([]);
    const [submitted_list, setSubmittedList] = useState([]);
    const [jenisItem_list, setJenisItemList] = useState([]);
    const [delegate_status, setDelegateStatus] = useState([]);
    const [token_db, setTokenDb] = useState([]);

    const [verified, setVerified] = useState(false);
    const [inputEmail, setInputEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);

    const [inputPassword, setInputPassword] = useState("");
    const [isAccessed, setIsAccessed] = useState(false);
    let [prevFields, setPrevFields] = useState("");
    let [nextFields, setNextFields] = useState("");
    const [isPrevFieldForNextSigner, setIsPrevFieldForNextSigner] = useState("");
    const [isNextField, setIsNextField] = useState("");
    const [finalSignerId, setFinalSignerId] = useState("");
    const [is_delegated, setIsDelegated] = useState("");
    const [actualSigner, setActualSigner] = useState("");
    const [current_signer, setCurrentSigner] = useState("");
    const [filteredFields, setFilterFields] = useState ("");
    const [normalizedDelegated, setNormalizedDelegated] = useState("");
    const [currentItemId, setCurrentItemId] = useState([]);
    const [showDelegatedAlert, setShowDelegatedAlert] = useState(false);
    const [delegateEmailSent, setDelegateEmailSent] = useState(false);
    const [is_submitted, setIsSubmitted] = useState(false);

    const [main_token, setMainToken] = useState("");
    const [delegate_token, setDelegateToken] = useState("");
    const [deadline, setDeadline] = useState("");
    const [documents, setDocuments] = useState([]); 
    const [is_download, setIsDownload] = useState(true);
    const canvasContainerRef = useRef(null);
    const [canvases, setCanvases] = useState([]);

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"] 
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const currentDate = `${day} ${month} ${year}`;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const todayDate = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${currentYear}-${currentMonth}-${todayDate}`;

    console.log("FORMATTED DATE:", formattedDate);
    
    const pdfContainerRef = useRef(null);
    const pdfRefs = useRef({});
    const delegatedDoc = localStorage.getItem("id_dokumen");
    
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
    
    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const styleRnd = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'rgba(25, 230, 25, 0.5)'
    };

    const styleIcon = {
        width: "25%",
        height: "25%"
    }

    const selectedCategory = location.state?.selectedCategory;

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
        setDocuments(response.data || []);
        } catch (error) {
        console.error("Error fetching data:", error.message); 
        } finally {
        setLoading(false);
        }
    };

    useEffect(() => {
        getDocument(selectedCategory);
    }, [selectedCategory]);

    useEffect(() => {
        const loadPdf = async() => {
            try {
                const loadingTask = pdfjsLib.getDocument(pdfUrl);
                const pdf = await loadingTask.promise;

                const renderedCanvases = [];

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const scale = 1.5;
                    const viewport = page.getViewport({scale});

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;

                    context.font = '14px Arial';
                    context.textAlign = 'right'; 
                    context.fillText(`Page ${pageNum} of ${pdf.numPages}`, canvas.width - 20, canvas.height - 10);
                    renderedCanvases.push({pageNum, imgSrc: canvas.toDataURL()});
                }
                setCanvases(renderedCanvases);

            } catch (error) {
                console.error('Error loading or rendering PDF: ', error);
            }
        };

        if (pdfUrl) {
            loadPdf();
        }
    }, [pdfUrl]);

    const handleSignatureClick = (id_item, show, editable) => {
        const signer = signatures.find(i => i.id_item === id_item);
        if (signer) {
            setSelectedIdItem(id_item);
            setSelectedSigner(signer);
            setShowSignatureModal(true);
            setShow(show);
            setEditable(editable);

        }
    };

    const handlePagesRendered = (pageNum) => {
    console.log("Page rendered:", pageNum);

    const container = document.getElementById(`page-${pageNum}`);
    if (container) {
        let label = container.querySelector(".page-label");
        if (!label) {
        label = document.createElement("div");
        label.className = "page-label";
        label.style.position = "absolute";
        label.style.top = "5px";
        label.style.left = "5px";
        label.style.background = "rgba(0,0,0,0.5)";
        label.style.color = "white";
        label.style.padding = "2px 6px";
        label.style.borderRadius = "4px";
        container.style.position = "relative";
        container.appendChild(label);
        }
        label.textContent = `Page rendered: ${pageNum}`;
    }
    };

    const handleInitialClick = (id_item, show, editable) => {
        const clickedField = initials.find(i => i.id_item === id_item);
        if (!clickedField) {
            console.warn(`handleInitialClick: No initial field found for id_item: ${id_item}`);
            return;
        }

        setSelectedIdItem(id_item);
        setSelectedSigner(clickedField?.id_signers || null);
        setShowInitialModal(true);
        setShow(show);
        setEditable(editable);
    };

    const handleDeclineClick = (id_dokumen, id_signers) => {
        if (!id_dokumen || !id_signers) {
            console.warn("id_dokumen or id_signers not found.");
            return;
        }

        setSelectedSigner(id_signers);
        setSelectedDocument(id_dokumen);
        setShowDeclineModal(true);
    };

     const handleDelegateClick = (id_dokumen, id_signers) => {
        if (!id_dokumen || !id_signers) {
            console.warn("id_dokumen or id_signers not found.");
            return;
        }

        setSelectedSigner(id_signers);
        setSelectedDocument(id_dokumen);
        setShowDelegateModal(true);
    };

    const handleDocInfoClick = (id_dokumen, id_signers, id_karyawan) => {
        if (!id_dokumen || !id_signers) {
            console.warn("id_dokumen or id_signers not found.");
            return;
        }

        setSelectedSigner(id_signers);
        setSelectedDocument(id_dokumen);
        setSelectedKaryawan(id_karyawan);
        setShowDocInfoModal(true);
    };

    const handleAuditTrail = (id_dokumen, id_signers) => {
        if (!id_dokumen || !id_signers) {
            console.warn("id_dokumen or id_signers not found.");
            return;
        }

        setSelectedSigner(id_signers);
        setSelectedDocument(id_dokumen);
        setSelectedKaryawan(id_karyawan);
        setShowAuditTrailModal(true);
    };
    
    const handleSignatureSuccess = () => {
        toast.success("Document signed successfully.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
        });
    };

    useEffect(() => {
        const checkAccessStatus = async() => {
            if (!token) return;

            try {
                const docRes = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const { id_dokumen, id_signers } = docRes.data;

                setIdDokumen(id_dokumen);
                setIdSigner(id_signers);

                const logsignRes = await axios.get(`http://localhost:5000/access-status?token=${token}`);
                const accessed = logsignRes.data.is_accessed;
                setIsAccessed(accessed);

                if (accessed === true) {
                    setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
                    setEmailVerified(true);
                    setVerified(true);
                } else {
                    setEmailVerified(false);
                    setVerified(false);
                    setPdfUrl("");
                }

            } catch (error) {
                console.error("Error:", error);
                setIsAccessed(false);
                setEmailVerified(false);
                setPdfUrl("");
            }
        };
        checkAccessStatus();
    }, [token]);

    const handleEmailVerify = async (e) => { 
        e.preventDefault();
        setErrorMsg("");

        try {
            const docRes = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
            const { id_dokumen, id_signers, currentSigner} = docRes.data;
            await axios.post("http://localhost:5000/link-access-log", { token, real_email: inputEmail, password: inputPassword, is_accessed: true, currentSigner });
            setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
            setEmailVerified(true);
            setVerified(true);
            setIsAccessed(true);
        } catch (error) {
            setErrorMsg("Access Denied: Token doesn't valid or email not found.");
            setEmailVerified(false);
            setPdfUrl("");
            setIsAccessed(false);

        } finally {
            setLoading(false);
        }
    }


    const getSelectedSignerInfo = () => {
        return signerData.find(signer => signer.id_signers === selectedSigner && signer.id_karyawan === selectedKaryawan);
    };

    useEffect(() => {
    const fetchData = async () => {
        if (!token) return;

        try {
            const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
            const id_dokumen = res.data.id_dokumen;
            const allSigners = res.data.id_signers;
            const urutan = res.data.urutan;
            const currentSigner = res.data.currentSigner;
            const allItems = res.data.id_item;
            const idKaryawan = res.data.id_karyawan;
            const delegated_signers = res.data.delegated_signers || null;
            const is_delegated = res.data.is_delegated;
            const main_token = res.data.main_token;
            const delegate_token = res.data.delegate_token;
            const deadline = res.data.deadline;

            console.log("Deadline from token:", deadline);

            const finalSignerId = allSigners || currentSigner || delegated_signers;
            setDelegatedSigners(delegated_signers);
            setCurrentSigner(currentSigner);

            if (!id_dokumen || !allSigners || !urutan || !allItems || !idKaryawan) {
                throw new Error("Missing id_dokumen, id_signers, id_item, id_karyawan or urutan from token.");
            }

            setIdDokumen(id_dokumen);
            setIdSigner(currentSigner);
            setAllSigners(allSigners);
            setAllItems(allItems);
            setIdKaryawan(idKaryawan);
            setFinalSignerId(finalSignerId);
            setIsDelegated(is_delegated);
            setMainToken(main_token);
            setDelegateToken(delegate_token);
            setDeadline(deadline)

            const fileRes = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`);
            if (!fileRes.ok) {
                throw new Error("Failed to get PDF Document.");
            }

            const blob = await fileRes.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);

            const localSignatureFields = [];
            const localInitialFields = [];
            const localDateFields = [];
            const allStatus = [];
            const allSigner = [];

            const signerArray = Array.isArray(finalSignerId) ? finalSignerId : [finalSignerId];
            const itemArray = Array.isArray(allItems) ? allItems : [allItems];
            const karyawanArray = Array.isArray(idKaryawan) ? idKaryawan : [idKaryawan];

            const urutanMapping = {};
            const submittedMapping = {};
            const delegateMapping = {};

            for (const signer of signerArray) {
                const resSignerInfo = await axios.get(`http://localhost:5000/doc-info/${id_dokumen}/${signer}`);
                    const dataSignerInfo = resSignerInfo.data;
                    if (dataSignerInfo.length > 0 && dataSignerInfo[0]?.Signerr && dataSignerInfo[0]?.DocName) {
                        const signerInfo = {
                            id_signers: dataSignerInfo[0].id_signers,
                            nama: dataSignerInfo[0].Signerr.nama,
                            organisasi: dataSignerInfo[0].Signerr.organisasi,
                            doc_name: dataSignerInfo[0].DocName.nama_dokumen,
                            email: dataSignerInfo[0].Signerr.Penerima?.email,
                        };
                        signerData.push(signerInfo);
                    }

                const response = await axios.get(`http://localhost:5000/decline/${id_dokumen}/${signer}`);
                const data = response.data;

                if (data.length > 0 && data[0].Signerr){
                    allSigner.push({
                        id_signers: data[0].id_signers, 
                        nama: data[0].Signerr.nama,
                    });
                }

                setSignerData(allSigner);

                let mainSigner = allSigners;
                if (is_delegated) {
                    mainSigner = res.data.id_signers;
                }

                setMainSigner(mainSigner);

                let querySigner = signer;
                setActualSigner(querySigner);
                
                for (const itemID of itemArray) {
                    const fieldRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${querySigner}/${itemID}`);

                    const validFields = fieldRes.data.filter(item => item.ItemField);

                    for (let idx = 0; idx < validFields.length; idx++) {
                        const item = validFields[idx];
                        const{
                            x_axis, 
                            y_axis, 
                            width, 
                            height, 
                            jenis_item, 
                            page,
                            id_item: fieldItemId,
                        } = item.ItemField;

                        const status = item.status || "Pending";
                        const urutan = item.urutan;
                        const is_submitted = item.is_submitted;

                        if (!urutanMapping[fieldItemId]) {
                            urutanMapping[fieldItemId] = urutan;
                        }

                        if (!submittedMapping[signer]) {
                            submittedMapping[signer] = is_submitted;
                        }

                        const fieldObj = {
                            id: `field-${querySigner}-${idx}`,
                            x_axis,
                            y_axis,
                            width,
                            height, 
                            jenis_item,
                            page,
                            pageScale: 1,
                            enableResizing: false,
                            disableDragging: true,
                            id_item: fieldItemId, 
                            status,
                            urutan, 
                            is_submitted, 
                            show,
                            editable,
                            id_signers: querySigner, 
                            is_delegated,
                            delegated_signers,
                        }; 

                        console.log("FieldObj:", fieldObj);

                        allStatus.push({id_item: fieldItemId, status});

                        if (jenis_item === "Signpad") {
                            localSignatureFields.push(fieldObj);
                        } else if (jenis_item === "Initialpad") {
                            localInitialFields.push(fieldObj);
                        } else if (jenis_item === "Date") {
                            localDateFields.push(fieldObj);
                        }
                    }
                }
            }

            setSignatures(localSignatureFields);
            setInitials(localInitialFields);
            setDateField(localDateFields);
            setSignStatus(allStatus);
            setUrutanMap(urutanMapping);
            setSubmittedMap(submittedMapping);
            setDelegatedMap(delegateMapping);

        } catch (error) {
            console.error("Failed to load PDF:", error.message);
            setErrorMsg(error.message);
            toast.error("Load document error or Expired token.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    
    useEffect(() => {
        if (signerData.length === 0) return;
        const foundSigner = signerData.find(s => s.id_signers === id_signers); 

        if (foundSigner) {
            setNama(foundSigner.nama);
        }
    }, [id_signers, signerData]);

    const updateSubmitted = async(id_dokumen, current_signer) => {
        try {
            const response = await axios.patch(`http://localhost:5000/update-submitted/${id_dokumen}/${current_signer}`, {
                is_submitted: true,
                status: "Completed",
                tgl_tt: date,
            });

            toast.success("Document signed successfully.", {
                position: "top-right", 
                autoClose: 5000, 
                hideProgressBar: true,
            });

            if (is_delegated && id_signers === delegated_signers && !delegateEmailSent) {
                await sendSignedDelegate(id_dokumen, delegated_signers, token);
                setDelegateEmailSent(true);
            }

            window.location.reload();
        } catch (error) {
            toast.error("Failed to save signed document.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });
        }
    };

    const sendSignedDelegate = async(id_dokumen, delegated_signers, token) => {

        try {
            const signedDelegate = await axios.post('http://localhost:5000/signed-delegate-email', {
                id_dokumen, 
                delegated_signers,
                token
            });

            toast.success("Signed delegate email sent!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });

        } catch (error) {
            console.error("Failed to send signed delegate email:", error.message);
            toast.error("Failed to send signed delegate email.");
        }
    }

    useEffect(() => {
    const fetchAllFields = async () => {
        if (!id_dokumen || !allSigners || !allItems || allSigners.length === 0 || Object.keys(urutanMap).length === 0) return;

        try {
        const signerArray = Array.isArray(allSigners) ? allSigners : [allSigners];
        const itemArray = Array.isArray(allItems) ? allItems : [allItems];
        const signerParam = signerArray.join(",");

        const initialsRes = await axios.get(`http://localhost:5000/initials/${id_dokumen}/${signerParam}`);
        const initialsData = initialsRes.data;
        const fieldBuffer = [];

        for (const signer of signerArray) {
            for (const itemId of itemArray) {
                const currentUrutan = Number(urutanMap[itemId]);
                const currentSubmitted = submittedMap[signer];
                const currentDelegated = delegatedMap[signer] || false;
                const axisRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}/${itemId}`);
                const signerFields = axisRes.data.filter(field => field.ItemField?.jenis_item);
                const signerInitials = initialsData.filter(init => init.id_signers === signer && init.id_item === itemId);

                for (const field of signerFields) {
                    const matchInitial = signerInitials.find(init => init.id_item === field.id_item);
                    const base64 = matchInitial?.sign_base64;
                    const formattedBase64 = base64?.startsWith("data:image")? base64 : base64 ? `data:image/png;base64,${base64}` : null;

                    const delegatedForThisSigner = matchInitial?.delegated_signers || null;


                    fieldBuffer.push({
                        id_item: field.id_item,
                        id_signers: signer,
                        sign_base64: formattedBase64,
                        status: matchInitial?.status || "Pending", 
                        nama: matchInitial?.Signerr?.nama || "-", 
                        x_axis: field.ItemField?.x_axis || 0,
                        y_axis: field.ItemField?.y_axis || 0,
                        width: field.ItemField?.width || 0,
                        height: field.ItemField?.height || 0,
                        page: field.ItemField?.page || 0,
                        enableResizing: false,
                        disableDragging: true,
                        jenis_item: field.ItemField?.jenis_item || "", 
                        urutan: currentUrutan, 
                        id_dokumen, 
                        is_submitted: currentSubmitted,
                        rawField: field,
                        is_delegated,
                        nowSigner: finalSignerId,
                        delegated_signers: delegatedForThisSigner,
                        token,

                    });
                }
            }
        }

        const allFields = fieldBuffer.map(field => {
            const {urutan: currentUrutan, id_item, id_signers, current_signer, delegated_signers} = field;
            
            let normalizedDelegated = null;
            if (delegated_signers && !Array.isArray(delegated_signers)) {
                normalizedDelegated = [String(delegated_signers)];
            } else if (Array.isArray(delegated_signers)) {
                normalizedDelegated = delegated_signers.map(String);
            }

            setNormalizedDelegated(normalizedDelegated);

            const prevSignerItem = Object.keys(urutanMap).find(key => Number(urutanMap[key]) === currentUrutan - 1);
            setPrevFields(prevSignerItem);

            const nextSignerItem = Object.keys(urutanMap).find(key => Number(urutanMap[key]) === currentUrutan + 1);
            setNextFields(nextSignerItem);

            const prevFields = fieldBuffer.filter(f => f.id_item === prevSignerItem);
            const nextFields = fieldBuffer.filter(f => f.id_item === nextSignerItem);

            const prevStatusList = prevFields.map(f => f.status);
            const prevSubmittedList = prevFields.map(f => f.is_submitted);

            const allCompleted = prevStatusList.length > 0 && 
            prevStatusList.every(s => s === "Completed") && 
            prevSubmittedList.every(s => s === true);

            let show = true;
            let editable = true;

            if (signerArray.length > 1) {
                if (currentUrutan === 1) {
                    show = true;
                    editable = true;
                } else if (prevStatusList.length === 0) {
                    show = false;
                    editable = false;
                } else if (allCompleted) {
                    show = true;
                    editable = true;
                } else if (prevSubmittedList.every(s => s !== true)) {
                    show = false;
                    editable = false;
                } else {
                    show = true;
                    editable = false;
                }
            }

            if (field.jenis_item === "Date") {
                show = true;
                editable = false;
            }

            const nextSignerInitials = initialsData.filter(init => 
                {
                    if (is_delegated === true) {
                        return init.delegated_signers === nextSignerItem
                    } else {
                         return init.id_signers === nextSignerItem
                    }
                }
            );
            const nextSignerSubmitted = submittedMap[nextSignerItem];
            const nextSignCompleted = nextSignerInitials.length > 0 && nextSignerSubmitted === true;

            const isPrevFieldForNextSigner = nextSignerItem && field.id_signers !== id_signers && !field.sign_base64;

            setIsPrevFieldForNextSigner(isPrevFieldForNextSigner);
            setCompleteSubmitted(allCompleted);

            return {
                ...field,
                delegated_signers: normalizedDelegated,
                show, 
                editable,
                prevSigner: prevSignerItem,
                nextSigner: nextSignerItem, 
                nextSignCompleted, 
                prevFieldDisplay: isPrevFieldForNextSigner,
            };
        });

        setSignedInitials(allFields); 
        setSignedSignatures(allFields);

        console.log("SignedInitials:", allFields);

        const ownerSigner = allFields.find(s => {

            if (!s.delegated_signers) return false;
            if (Array.isArray(s.delegated_signers)) {
                return s.delegated_signers.map(String).includes(String(current_signer));
            }
            return String(s.delegated_signers) === String(current_signer);
        });


        const ownerSignerId = ownerSigner ? String(ownerSigner.id_signers) : null;


        const filteredFields = allFields.filter(field => {
            const fieldOwner = String(field.id_signers) || "";
            
            if (ownerSignerId) {
                return fieldOwner === ownerSignerId; 
            }

            return fieldOwner === String(current_signer);
        });
        setFilterFields(filteredFields);

        setInitial(filteredFields);
        setSignature(filteredFields);
        setDateField(filteredFields);

        const statusList = filteredFields.map(field => field.status);
        setInitialStatus(statusList);

        const delegateList = filteredFields.map(field => field.is_delegated);
        setDelegateStatus(delegateList);

        const submittedList = filteredFields.map(field => field.is_submitted);
        setSubmittedList(submittedList);

        const jenisItemList = filteredFields.map(field => field.jenis_item);
        setJenisItemList(jenisItemList);

        const pageList = filteredFields.map(field => field.page);
        setPage(pageList);

        const nextSignCompletedList = allFields
            .filter(field => field.prevSigner === id_signers)
            .map(field => field.is_submitted);
        setNextSignCompleted(nextSignCompletedList);


        } catch (error) {
        console.error("Failed to fetch initials or axis-field:", error.message);
        }
    };

    fetchAllFields();
    }, [id_dokumen, id_signers, urutanMap, allSigners, current_signer]);

    const nonDateItems = initial
    .filter(item => item.jenis_item !== "Date")
    .map(item => ({
        jenis_item: item.jenis_item,
        is_delegated: item.is_delegated,
        status: item.status,
        is_submitted: item.is_submitted
    }));

    const isNonDateCompleted = nonDateItems.every(item => item.status === "Completed");
    const isNonDateNotCompleted = nonDateItems.every(item => item.status !== "Completed");
    const isNonDateSubmitted =  nonDateItems.every(item => item.is_submitted === true);

    const isDelegatedSigner = is_delegated && delegated_signers === current_signer;

    const isFinishDisabled = isDelegatedSigner ? isNonDateNotCompleted : isNonDateNotCompleted;
    const isFinishHidden = isDelegatedSigner ? (isNonDateCompleted && isNonDateSubmitted) : (isNonDateCompleted && isNonDateSubmitted);

    const itemArray = Array.isArray(allItems) ? allItems : [allItems];
    const signerArray = Array.isArray(allSigners) ? allSigners : [allSigners];
    
    useEffect(() => {
        let allCurrentItemIds = [];
        for (const signer of signerArray) {
            for (const item of itemArray) {

            const activeItems = initial.filter(sig => sig.id_signers === signer && sig.show && !sig.is_submitted);
            const currentItemIds = activeItems.map(activeItem => activeItem.id_item);
            allCurrentItemIds = [...new Set([...allCurrentItemIds, ...currentItemIds])];
            
                for (const activeItem of activeItems){
                    const currentItemId = activeItem.id_item;
                    const isCurrentItem = currentItemId === item;

                }
            }
        }

        setCurrentItemId(prev => {
            const prevArray = Array.isArray(prev) ? prev : [];
            const isSame = 
            prevArray.length === allCurrentItemIds.length && 
            prevArray.every(id => allCurrentItemIds.includes(id));
            return isSame ? prevArray : allCurrentItemIds;
        });
    }, [signerArray, itemArray, initial]);
    

    useEffect(() => {
        const hasSubmitted = initial.some(sig => sig?.is_submitted === true);
        setIsSubmitted(hasSubmitted);
    }, [initial]);

    const showDelegateAlert = !is_delegated === true && is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc !== id_dokumen) : !is_delegated || (delegatedDoc === id_dokumen);

    const plainPDF = async (id_dokumen) => {
        try {
            const res = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`);
            if (!res.ok) throw new Error("Failed to fetch PDF for download.");

            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);

            const a = document.createElement("a"); 
            a.href = url;
            a.download = `${id_dokumen}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Downloading error:", error.message);
        }
    }

    const getRef = (id) => {
        if (!pdfRefs.current[id]) {
            pdfRefs.current[id] = React.createRef();
        }
        return pdfRefs.current[id];
    }

    const downloadPDF = async (id_dokumen, ref, LOGSIGN) => {
        try {
            const pdfUrl = `http://localhost:5000/pdf-document/${id_dokumen}`;
            const existingPdfBytes = await fetch(pdfUrl).then(res => res.arrayBuffer());
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            const pages = pdfDoc.getPages();
            const scale = 1.5;

            for (const sign of LOGSIGN) {
                if (sign.status === "Completed" && sign.is_submitted) {
                    const axisRes = await fetch(
                        `http://localhost:5000/axis-field/${id_dokumen}/${sign.id_signers}/${sign.id_item}`
                    ).then(res => res.json());

                    const field = axisRes[0]?.ItemField;
                    if (!field) continue;

                    let { x_axis, y_axis, width, height, jenis_item, page } = field;
                    x_axis = jenis_item === "Date" ? Number(x_axis) / scale + 40 : Number(x_axis) / scale;
                    y_axis = jenis_item === "Initialpad" ? Number(y_axis) / scale + 20 : jenis_item === "Signpad" ? Number(y_axis) / scale + 10 :jenis_item === "Date" ? Number(y_axis) / scale - 60 : Number(y_axis) / scale ;
                    //y_axis initialpad +20 atau hanya /scale saja
                    
                    width = Number(height) / scale;
                    height = Number(width) / scale - 20;

                    const targetPageIndex = Number(page) - 1;
                    if (targetPageIndex < 0 || targetPageIndex >= pages.length) {
                        console.warn("Invalid page number:", page);
                        continue;
                    }

                    const pdfPage = pages[targetPageIndex];
                    const pageHeight = pdfPage.getHeight();
                    const yPos = pageHeight - y_axis - height + 29;

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
                    } else{
                        let date = new Date(sign.tgl_tt);
                        const day = String(date.getDate()).padStart(2, '0');
                        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"] 
                        const month = monthNames[date.getMonth()];
                        const year = date.getFullYear();
                        const currentDate = `${day} ${month} ${year}`;

                        pdfPage.drawText(currentDate, {
                            x: x_axis,
                            y: yPos,
                            size: 9,
                            textAlign: 'center',
                        });
                    }
                }
            }

            const signedBytes = await pdfDoc.save();
            const loadingTask = pdfjsLib.getDocument({ data: signedBytes, disableStream: true, disableAutoFetch: true });
            const pdf = await loadingTask.promise;

            let finalPdf;
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const viewport = page.getViewport({ scale: 2 });
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;

                await page.render({ canvasContext: ctx, viewport }).promise;

                const imgData = canvas.toDataURL("image/jpeg", 1.0);
                const orientation = canvas.width > canvas.height ? "landscape" : "portrait";

                if (i === 1) {
                    finalPdf = new jsPDF({
                        orientation,
                        unit: "px",
                        format: [canvas.width, canvas.height],
                        compress: true,
                    });
                } else {
                    finalPdf.addPage([canvas.width, canvas.height], orientation);
                }

                finalPdf.addImage(imgData, "JPEG", 0, 0, canvas.width, canvas.height);
            }

            const finalBytes = finalPdf.output("blob");
            saveAs(finalBytes, `signed_${id_dokumen}.pdf`);

        } catch (error) {
            console.error("Downloading error:", error.message);
        }
    };
    
    const pendingFields = signedInitials.filter(sig => {
        if (!sig || !sig.id_item || sig.show !== true) return false;

        const isCompleted = sig.status === "Completed";
        const isSubmitted = sig.is_submitted === true;

        const currentSignerStr = String(id_signers);
        const delegatedArray = Array.isArray(sig.delegated_signers)
        ? sig.delegated_signers.map(String)
        : sig.delegated_signers ? [String(sig.delegated_signers)] : [];

        const normalizedArray = Array.isArray(normalizedDelegated)
        ? normalizedDelegated.map(String)
        : normalizedDelegated ? [String(normalizedDelegated)] : [];

        const isSigner = 
        String(sig.id_signers) === currentSignerStr || 
        delegatedArray.includes(currentSignerStr) ||
        normalizedArray.includes(currentSignerStr);
        
        return isSigner && !isCompleted && !isSubmitted;
    });

    let pendingCount = pendingFields.length;

    const handleJumpTo = () => {
        if (pendingFields.length === 0) return;

        const firstField = pendingFields[0];
        const fieldElement = document.getElementById(`field-${firstField.id_item}-${firstField.id_signers}`);
        if (fieldElement) {
            fieldElement.scrollIntoView({behavior: "smooth", block:"center"});
            fieldElement.focus?.();
        }
    };
    

    return (
        <>
            <Navbar className="bg-navbar nav-padding w-100" style={{position:'fixed', top:'0'}} expand="lg" hidden={isAccessed !== true}>
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
                        src={require("assets/img/logo2.png")}
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
                        className="mr-5 mt-2"
                        hidden={
                            (token !== delegate_token) &&
                            (!is_delegated ) &&
                            (delegatedDoc === id_dokumen) ||
                            initial_status.every(status => status === "Decline")
                        }

                        >
                        <span className="fs-6">Actions</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink" style={{ width: '200px' }}>
                        <Dropdown.Item
                            onClick={() => handleDeclineClick(id_dokumen, id_signers)}
                            hidden={initial_status.every(status => status === "Decline" || status === "Completed")}
                        >
                            Decline
                        </Dropdown.Item>
                        <div className="divider" hidden={initial_status.every(status => status === "Decline" || status === "Completed")}></div>
                        <Dropdown.Item
                            href="#"
                            onClick={() => handleDelegateClick(id_dokumen, id_signers)}
                            hidden={initial_status.every(status => status === "Decline" || status === "Completed") || delegated_signers}
                        >
                            Delegate
                        </Dropdown.Item>
                        <div className="divider" hidden={initial_status.every(status => status === "Decline" || status === "Completed") || delegated_signers}></div>
                        <Dropdown.Item
                            href="#"
                            onClick={() => handleDocInfoClick(id_dokumen, id_signers, id_karyawan)}
                        >
                            Document Info
                        </Dropdown.Item>
                        <div className="divider"></div>
                        
                        <Dropdown.Item
                            href="#"
                            onClick={() => handleAuditTrail(id_dokumen, id_signers)}
                        >   Audit Trail
                        </Dropdown.Item>
                        {(() => {
                            const currentDoc = documents.find(doc => doc.id_dokumen === id_dokumen);
                            if (!currentDoc) return null;

                            const hasDownload = currentDoc.LogSigns?.some(log => log.is_download === true);

                            if (!hasDownload) return null; 

                            return (
                                <>
                                    <div className="divider"></div>
                                    <Dropdown.Item
                                        href="#"
                                        onClick={async (e) => {
                                        e.preventDefault();

                                        const ref = getRef(id_dokumen);
                                        const LOGSIGN = JSON.parse(JSON.stringify(currentDoc.LogSigns || []));

                                        LOGSIGN.forEach((log, i) => {
                                            console.log(`LogSigns[${i}].sign_base64:`, log.sign_base64);

                                            log.is_submitted
                                            ? downloadPDF(id_dokumen, ref, LOGSIGN)
                                            : plainPDF(id_dokumen);
                                        });
                                        }}
                                    >
                                        Download
                                    </Dropdown.Item>
                                </>
                            );
                        })()}


                        </Dropdown.Menu>
                    </Dropdown>

                    <Button
                        className="submit-btn w-100 mt-3 fs-6"
                        type="submit"
                        onClick={() => updateSubmitted(id_dokumen, current_signer)}
                        disabled={isFinishDisabled}
                        hidden={is_delegated !== true && !is_submitted ? (token === delegate_token && !is_submitted) || (delegatedDoc === id_dokumen) || initial_status.every(status => status === "Decline") : is_submitted || !is_delegated === true && (delegatedDoc !== id_dokumen)}
                    >
                        Finish
                    </Button>
                    </Nav>

                    <Button
                        className="navigate-btn mt-3 fs-6"
                        type="button"
                        onClick={handleJumpTo}

                        hidden={
                            pendingCount == 0 ||
                            (token !== delegate_token) &&
                            (!is_delegated ) &&
                            (delegatedDoc === id_dokumen) ||
                            initial_status.every(status => status === "Decline")
                        }


                    >
                        Jump to ({pendingCount})
                    </Button>
                </Navbar.Collapse>
                </Container>
            </Navbar>

            <div>
                <Container fluid className="px-0 center-object">
                        {loading && <Spinner animation="border" variant="primary" />}
                        <div className="sign-in__user d-flex align-items-center justify-content-center">
                        
                        {isAccessed === false ? 
                            (
                            <Alert variant="danger" style={{marginTop: "-680px"}} hidden={initial_status.every(status => status !== "Expired")}>
                                <FaExclamationTriangle className="mb-1 mr-2"/> Access denied, token expired.
                            </Alert>
                            ) : (
                                <>
                                </>    
                            )
                        }

                        <Alert variant="danger" style={{marginTop: "-680px"}} hidden={initial_status.every(status => status !== "Decline")}>
                            <FaExclamationTriangle className="mb-1 mr-2"/> {nama} has declined to sign this document.
                        </Alert>
                        <Alert variant="warning" style={{marginTop: "-680px"}}
                            hidden={
                                (token === delegate_token && !is_submitted) ||
                                (is_delegated === true && is_submitted) ||
                                (delegatedDoc !== id_dokumen)
                            }
                        >
                            <FaExclamationTriangle className="mb-1 mr-2"/> {nama} has delegate this document to other signer.
                        </Alert>

                       
                        {isAccessed !== true && (
                    
                        <Row className="login-user user-element" style={{marginTop: "-2px"}}>
                            <Card className="login-card shadow mb-0">
                                <>{errorMsg && <Alert variant="danger" className="m-4">{errorMsg}</Alert>}</>
                                <div className="d-flex justify-content-center">
                                    <img src={require("assets/img/login2.png")} alt="login-img" className="login-illustration" />
                                </div>
                                <Card.Body>
                                    <h4 className="text-center font-form mt-3 mb-2">Campina Sign</h4>
                                    <Alert variant="info" className="mb-0"><FaInfoCircle className="mr-2"/>Please verify your email</Alert>
                                    <Form onSubmit={handleEmailVerify}>
                                        <Form.Group> 
                                            <span class="input-group-text bg-transparent border-0" id="basic-addon1">
                                                <FaUser style={{ marginRight: '8px' }} />
                                                <Form.Control
                                                    type="email"
                                                    placeholder="Email"
                                                    value={inputEmail}
                                                    onChange={(e) => setInputEmail(e.target.value)}
                                                    required
                                                    style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}
                                                    className="m-0"
                                                />
                                            </span>
                                        </Form.Group>
                                        <Form.Group className="mb-3">
                                            <span class="input-group-text bg-transparent  border-0" id="basic-addon1">
                                                <FaKey style={{ marginRight: '8px' }} />
                                                <Form.Control
                                                    type="password"
                                                    placeholder="Password"
                                                    value={inputPassword}
                                                    onChange={(e) => setInputPassword(e.target.value)}
                                                    required 
                                                    style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}   
                                                />
                                            </span> 
                                        </Form.Group>
                                        <Button type="submit" className="w-100 mt-2" disabled={loading} 
                                            style={{ backgroundColor: "#4c4ef9", border: "none", color: "white", marginBottom:'15px'}}
                                            >
                                            {loading ? "Verifying..." : "Verify Email"}
                                        </Button>
                                        <p className="text-center font-footer" style={{fontSize:15}}>Forget Password? Please contact Super Admin.</p>
                                    </Form>
                                </Card.Body>
                            </Card>
                        </Row>
                        )}
                        </div>
                        {isAccessed === true && pdfUrl && (
                            <div>
                                <div className="vertical-center mt-5" >
                                    <div ref={canvasContainerRef}>
                                            {canvases.length === 0 && <p>Loading PDF...</p>}
                                                {canvases.map((canvas, index) => {
                                                const pageNumber = index + 1;
                                                return (
                                                  <div key={pageNumber} className="pdf-page-container" style={{ position: "relative", marginBottom: "1rem" }} data-pagenumber={pageNumber}>
                                                    <img
                                                      src={canvas.imgSrc}
                                                      alt={`Page ${canvas.pageNum}`}
                                                      style={{
                                                        marginBottom: "1rem",
                                                        border: "1px solid #ccc",
                                                        boxShadow: "4px 4px 15px rgba(151, 151, 151, 0.5)",
                                                      }}
                                                    />

                                                    {signedInitials.map((sig) => {
                                                        if (!sig || !sig.id_item || sig.show !== true) return null;

                                                        const isCompleted = sig.status === "Completed";
                                                        const isSubmitted = sig.is_submitted === true;
                                                        const isDatefield = sig.jenis_item === "Date";
                                                        const isInitialpad = sig.jenis_item === "Initialpad";
                                                        const isSignpad = sig.jenis_item === "Signpad";
                                                        const isDecline = sig.status === "Decline";
                                                        const isPrevField = sig.prevFieldDisplay === true;
                                                        const completedNext = sig.is_submitted === true;
                                                        const urutan = sig.urutan;
                                                        const currentItem = sig.id_item === currentItemId;
                                                        const is_delegated = sig.is_delegated;
                                                        const delegated_signers = sig.delegated_signers;

                                                        const isSignerOwner = sig.id_signers === id_signers;
                                                        const isSignerDelegated = delegated_signers === id_signers;

                                                        const isFirstSigner = urutan === 1;
                                                        const page = Number(sig.page);
                                                         if (page !== pageNumber) return null;

                                                        const delegatedArray = Array.isArray(delegated_signers)
                                                        ? delegated_signers.map(String)
                                                        : delegated_signers ? [String(delegated_signers)] : [];

                                                        const normalizedArray = Array.isArray(normalizedDelegated)
                                                        ? normalizedDelegated.map(String)
                                                        : normalizedDelegated ? [String(normalizedDelegated)] : [];

                                                        let bgFirst = is_delegated === true || !currentItem ?  "rgba(86, 90, 90, 0.3)" : isSubmitted ? "transparent" : "rgba(25, 230, 25, 0.5)";
                                                        let bgOthers = is_delegated === true || !currentItem ? "rgba(86, 90, 90, 0.3)" : isSubmitted ? "transparent": "rgba(25, 230, 25, 0.5)";


                                                        if (isCompleted === true) {
                                                            bgFirst = "transparent";
                                                            bgOthers = "transparent";
                                                        }

                                                        const bgStyle = 
                                                        isSubmitted || isCompleted
                                                        ? "transparent"
                                                        : !isSignerDelegated && !isSignerOwner
                                                        ? "rgba(86, 90, 90, 0.4)"
                                                        : !isSignerOwner && !isSignerDelegated
                                                        ? "rgba(86, 90, 90, 0.4)"
                                                        : !isSubmitted || isCompleted
                                                        ? "rgba(25, 230, 25, 0.4)"
                                                        : "transparent";

                                                        let firstBorderStyle = (isSubmitted) ? "transparent" : is_delegated || !currentItem ? "solid 5px rgba(86, 90, 90, 0.3)" : "solid 5px rgba(25, 230, 25, 0.5)";
                                                        let otherBorderStyle = (isSubmitted) ? "transparent" : is_delegated || !currentItem ? "solid 5px rgba(86, 90, 90, 0.3)" : "solid 5px rgba(25, 230, 25, 0.5)";

                                                        const zIndexStyle = isPrevField && !isFirstSigner ? 1 : 2;

                                                        const groupByUrutan = signedInitials.reduce((acc, field) => {
                                                            if (!acc[field.urutan]) acc[field.urutan] = [];
                                                            acc[field.urutan].push(field);
                                                            return acc;
                                                        }, {});

                                                        const getMessageForUrutan = (urutan) => {
                                                            const fields = groupByUrutan[urutan] || [];
                                                            const currentSignerStr = String(id_signers);

                                                            const relatedSigners = new Set();

                                                            fields.forEach(f => {
                                                                //cek id_signers yg punya delegated_signers ke current signer
                                                                if (Array.isArray(f.delegated_signers) 
                                                                ? f.delegated_signers.map(String).includes(currentSignerStr)
                                                                : String(f.delegated_signers) === currentSignerStr) {
                                                                    relatedSigners.add(String(f.id_signers));
                                                                }

                                                                // cek id_signers yg ada di normalizedDelegated ke current signer
                                                                if (Array.isArray(f.normalizedDelegated) 
                                                                ? f.normalizedDelegated.map(String).includes(currentSignerStr)
                                                                : String(f.normalizedDelegated) === currentSignerStr) {
                                                                    relatedSigners.add(String(f.id_signers));
                                                                }

                                                                if (String(f.id_signers) === currentSignerStr) {
                                                                    relatedSigners.add(currentSignerStr);
                                                                }
                                                            });

                                                            const isOtherSignerGroup = fields.some(f => !relatedSigners.has(String(f.id_signers)));

                                                            if (!isOtherSignerGroup) return "";

                                                            const relatedCompleted = fields
                                                                .filter(f => relatedSigners.has(String(f.id_signers)))
                                                                .every(f => f.status === "Completed");

                                                            if (relatedCompleted && !isSubmitted) {
                                                                return <p className="text-center">Another sign didn't complete</p>;
                                                            }

                                                        };

                                                        const message = getMessageForUrutan(sig.urutan);

                                                        const currentSignerStr = String(current_signer);
                                                        const isCurrentItem = currentItemId.includes(sig.id_item);

                                                        let content;

                                                        if (isCompleted && sig.sign_base64) {
                                                        content = (
                                                            <img
                                                            src={sig.sign_base64}
                                                            alt="Initial"
                                                            style={{ width: "100%", height: "100%" }}
                                                            />
                                                        );
                                                        } else if (!is_delegated && isFirstSigner) {
                                                        content = message;
                                                        } else if (!is_delegated && !isFirstSigner) {
                                                        content = message;
                                                        } else if (is_delegated && isInitialpad) {
                                                        content = <FaFont style={{ width: "100%", height: "100%"}} />;
                                                        } else if (isSignpad) {
                                                        content = <FaSignature style={{ width: "25%", height: "25%", top: "50%", left: "50%", position: "absolute", transform: "translate(-50%, -50%)"}} />;
                                                        } else {
                                                        content = <></>;
                                                        }

                                                        const canClick = !is_delegated === true && !is_submitted ? (token === delegate_token && !is_submitted) || (isCurrentItem && delegatedDoc === id_dokumen) : !is_delegated === true || is_submitted && (isCurrentItem && delegatedDoc !== id_dokumen);

                                                        console.log("page:", page, "pageNumber:", pageNumber);
                                                        if (page !== pageNumber) return null;

                                                        return (
                                                            <>
                                                                <Rnd
                                                                    id={`field-${sig.id_item}-${sig.id_signers}`} 
                                                                    key={`${sig.id_signers}-${sig.id_item}`}
                                                                    position={{ x: Number(sig.x_axis), y: Number(sig.y_axis) }}
                                                                    size={{ width: Number(sig.height), height: Number(sig.width) }}
                                                                    page={page}
                                                                    enableResizing={sig.enableResizing}
                                                                    disableDragging={sig.disableDragging}
                                                                    style={{
                                                                        display: "flex",
                                                                        alignItems: "center",
                                                                        justifyContent: "center",
                                                                        backgroundColor: bgStyle,
                                                                        border: isFirstSigner ? firstBorderStyle : otherBorderStyle,
                                                                        zIndex: zIndexStyle,     
                                                                        cursor: !is_submitted && isCurrentItem ? canClick && showDelegateAlert ? "default" : "pointer" : "default",


                                                                    }}
                                                                    hidden={isDecline}
                                                                    onClick={() => {
                                                                        const currentSignerStr = String(current_signer);
                                                                        const isCurrentSigner = 
                                                                        String(sig.id_signers) === currentSignerStr ||
                                                                        delegatedArray.includes(currentSignerStr) ||
                                                                        normalizedArray.includes(currentSignerStr);
                                                                        if (!is_submitted && (is_delegated === true && !isSubmitted) || isCurrentItem  && (delegatedDoc !== id_dokumen)) {
                                                                            if (isInitialpad && isCurrentItem){
                                                                                handleInitialClick(sig.id_item, sig.show, sig.editable);
                                                                            } else if (isSignpad && isCurrentItem){
                                                                                handleSignatureClick(sig.id_item, sig.editable, sig.show);
                                                                            }
                                                                        }
                                                                    }}
                                                                    disabled ={isSubmitted === true}

                                                                >
                                                                    {console.log("isDELEGATED:", is_delegated)}

                                                                    {!isSubmitted && (is_delegated === true && !isSubmitted) || isCurrentItem  && (delegatedDoc !== id_dokumen) ? (
                                                                        <OverlayTrigger
                                                                            placement="bottom"
                                                                            overlay={<Tooltip id="initialCompleteTooltip" hidden={!isCurrentItem}>Click to change your sign.</Tooltip>}
                                                                        >
                                                                            {({ ref, ...triggerHandler }) => (
                                                                            <>
                                                                                <div {...triggerHandler} ref={ref} style={{width: "100%", height: "100%" }}>
                                                                                    {!message && (isInitialpad && !isCompleted) ? (
                                                                                        <div
                                                                                            style={{
                                                                                                width: "25%",
                                                                                                height: "25%",
                                                                                                top: "50%",
                                                                                                left: "50%",
                                                                                                position: "absolute",
                                                                                                transform: "translate(-50%, -50%)",
                                                                                            }}
                                                                                        >
                                                                                            {content}
                                                                                        </div>
                                                                                    ) : message && (isInitialpad && !isCompleted) ? (
                                                                                        <div
                                                                                            style={{
                                                                                                top: "50%",
                                                                                                left: "50%",
                                                                                                position: "absolute",
                                                                                                transform: "translate(-50%, -50%)",
                                                                                            }}
                                                                                        >
                                                                                            {content}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <div
                                                                                            style={{
                                                                                                width: "100%",
                                                                                                height: "100%",
                                                                                                top: "50%",
                                                                                                left: "50%",
                                                                                                position: "absolute",
                                                                                                transform: "translate(-50%, -50%)",
                                                                                            }}
                                                                                        >
                                                                                            {content}
                                                                                        </div>
                                                                                    )}
                                                                                </div>

                                                                                {isCompleted && isDatefield ? (
                                                                                    currentDate 
                                                                                ) : (
                                                                                    isDatefield ? <FaCalendar style={{ width: "25%", height: "25%", top: "50%", left: "50%", position: "absolute", transform: "translate(-50%, -50%)" }} /> : <></>
                                                                                )}
                                                                            </>
                                                                            )}
                                                                        </OverlayTrigger>
                                                                        ) : (
                                                                        <>
                                                                            {content}

                                                                            {isCompleted && isDatefield ? (
                                                                                currentDate 
                                                                            ) : (
                                                                                isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }} /> : <></>
                                                                            )}
                                                                        </>
                                                                    )}
                                                                </Rnd>
                                                            </>
                                                        );
                                                    })}

                                                    {initial.map((sig) => {
                                                        if (!sig || !sig.id_item || sig.show !== true) return null;

                                                        const isCompleted = sig.status === "Completed";
                                                        const isSubmitted = sig.is_submitted === true;
                                                        const isDecline = sig.status === "Decline";
                                                        const isInitialpad = sig.jenis_item === "Initialpad";
                                                        const isSignpad = sig.jenis_item === "Signpad";
                                                        const isDatefield = sig.jenis_item === "Date";
                                                        const isPrevField = sig.prevFieldDisplay === true;
                                                        const prevSigner = sig.prevSigner; 
                                                        const urutan = sig.urutan;
                                                        const isFirstSigner = urutan === 1;
                                                        const currentSigner = sig.id_signers;
                                                        const currentItem = sig.id_item === currentItemId;
                                                        const nextSigner = sig.nextSigner;
                                                        const is_delegated = sig.is_delegated;
                                                        const page = Number(sig.page);

                                                         if (page !== pageNumber) return null;

                                                        const isSignerOwner = sig.id_signers === id_signers;
                                                        const isSignerDelegated = delegated_signers === id_signers;

                                                        const prevField = signedInitials.find(field => field.id_item === prevSigner);
                                                        const prevNotSubmitted = prevField && (
                                                            prevField.status !== "Completed" || prevField.is_submitted !== true
                                                        );

                                                        
                                                        //FIX PLISSS JGN DIUBAH!!!
                                                        const borderStyle = 
                                                        isSubmitted 
                                                        ? "transparent"
                                                        : !isSignerDelegated && !isSignerOwner
                                                        ? "solid 5px rgba(86, 90, 90, 0.5)"
                                                        : !isSignerOwner && !isSignerDelegated
                                                        ? "solid 5px rgba(86, 90, 90, 0.5)"
                                                        : !isSubmitted
                                                        ? "solid 5px rgba(25, 230, 25, 0.5)"
                                                        : isFirstSigner && !isCompleted 
                                                        ? "solid 5px rgba(25, 230, 25, 0.5)" 
                                                        : "transparent";

                                                        const backgroundColor = isPrevField 
                                                        ? "rgba(86, 90, 90, 0.5)"
                                                        : prevNotSubmitted 
                                                        ? "rgba(86, 90, 90, 0.5)"
                                                        : isFirstSigner && isCompleted && !isPrevFieldForNextSigner
                                                        ? "solid 5px rgba(86, 90, 90, 0.5)"
                                                        : !isPrevFieldForNextSigner
                                                        ? "solid 5px rgba(86, 90, 90, 0.5)"
                                                        : "solid 5px rgba(86, 90, 90, 0.5)";

                                                        const delegatedArray = Array.isArray(delegated_signers)
                                                        ? delegated_signers.map(String)
                                                        : delegated_signers ? [String(delegated_signers)] : [];

                                                        const normalizedArray = Array.isArray(normalizedDelegated)
                                                        ? normalizedDelegated.map(String)
                                                        : normalizedDelegated ? [String(normalizedDelegated)] : [];


                                                        let bgFirst = is_delegated === true || currentItem ?  "rgba(25, 230, 25, 0.5)" : isSubmitted ? "transparent" : "rgba(86, 90, 90, 0.3)";
                                                        let bgOthers = is_delegated === true || currentItem ? "rgba(25, 230, 25, 0.5))" : isSubmitted ? "transparent": "rgba(86, 90, 90, 0.3)";

                                                        const bgStyle = 
                                                        isSubmitted || isCompleted
                                                        ? "transparent"
                                                        : !isSignerDelegated && !isSignerOwner
                                                        ? "rgba(86, 90, 90, 0.4)"
                                                        : !isSignerOwner && !isSignerDelegated
                                                        ? "rgba(86, 90, 90, 0.4)"
                                                        : !isSubmitted || isCompleted 
                                                        ? "rgba(25, 230, 25, 0.4)"
                                                        : "transparent";


                                                        if (isCompleted === true) {
                                                            bgFirst = "transparent";
                                                            bgOthers = "transparent";
                                                        }

                                                        const currentSignerStr = String(current_signer);

                                                    
                                                        const isCurrentItem = currentItemId.includes(sig.id_item);

                                                        const signerItemCount = initial.filter(item => 
                                                            currentItemId.includes(item.id_item) && (
                                                                String(item.id_signers) === currentSignerStr ||
                                                                delegatedArray.includes(currentSignerStr) || 
                                                                normalizedArray.includes(currentSignerStr)
                                                            )
                                                        ).length;
                                                        const canClick = !is_delegated === true && !is_submitted ? (token === delegate_token && !is_submitted) || (isCurrentItem && delegatedDoc === id_dokumen) : !is_delegated === true || is_submitted && (isCurrentItem && delegatedDoc !== id_dokumen);

                                                        return (
                                                            <Rnd
                                                                id={`field-${sig.id_item}-${sig.id_signers}`} 
                                                                key={`${sig.id_signers}-${sig.id_item}`}
                                                                position={{ x: Number(sig.x_axis), y: Number(sig.y_axis) }}
                                                                size={{ width: Number(sig.height), height: Number(sig.width) }}
                                                                page={page}
                                                                enableResizing={sig.enableResizing}
                                                                disableDragging={sig.disableDragging}
                                                                style={{
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    backgroundColor: bgStyle,
                                                                    border: borderStyle, 
                                                                    cursor: !is_submitted && isCurrentItem ? canClick && showDelegateAlert ? "default" : "pointer" : "default",
                                                                    zIndex: isCompleted ? 1 : 2,
                                                                }}
                                                                hidden={isDecline}
                                                                onClick={() => {
                                                                    const currentSignerStr = String(current_signer);
                                                                    const isCurrentSigner = 
                                                                    String(sig.id_signers) === currentSignerStr ||
                                                                    delegatedArray.includes(currentSignerStr) ||
                                                                    normalizedArray.includes(currentSignerStr);

                                                                    if (!is_submitted && (is_delegated === true && !isSubmitted) || isCurrentItem  && (delegatedDoc !== id_dokumen)) {
                                                                        if (!is_delegated ? isInitialpad && isCurrentItem || is_delegated : isInitialpad && isCurrentItem && is_delegated){
                                                                            handleInitialClick(sig.id_item, sig.show, sig.editable);
                                                                        } else if (!is_delegated ? isSignpad && isCurrentItem || is_delegated : isSignpad && isCurrentItem && is_delegated) {
                                                                            handleSignatureClick(sig.id_item, sig.editable, sig.show);
                                                                        }
                                                                    }
                                                                }}
                                                                disabled ={isSubmitted === true}
                                                            >
                                                                {!isSubmitted ? (
                                                                <OverlayTrigger
                                                                    placement="bottom"
                                                                    overlay={<Tooltip id="initialCompleteTooltip" hidden={!isCurrentItem || !is_delegated}>Click to change your sign.</Tooltip>}
                                                                >
                                                                    {({ ref, ...triggerHandler }) => (
                                                                    <>
                                                                        {isCompleted && sig.sign_base64 ? (
                                                                        <img
                                                                            {...triggerHandler}
                                                                            ref={ref}
                                                                            src={sig.sign_base64}
                                                                            alt="Initial"
                                                                            style={{ width: "100%", height: "100%" }}
                                                                        />
                                                                        ) : (
                                                                            isInitialpad ? <FaFont style={{ width: "25%", height: "25%" }} /> : isSignpad ? <FaSignature style={{ width: "25%", height: "25%" }} /> :  <></>
                                                                        )}

                                                                        {isCompleted && isDatefield ? (
                                                                            currentDate
                                                                        ) : (
                                                                            isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }} /> : <></>
                                                                        )}
                                                                    </>
                                                                    )}
                                                                </OverlayTrigger>
                                                                ) : (
                                                                <>
                                                                    {isCompleted && sig.sign_base64 ? (
                                                                    <img
                                                                        src={sig.sign_base64}
                                                                        alt="Initial"
                                                                        style={{ width: "100%", height: "100%" }}
                                                                    />
                                                                    ) : (
                                                                        isInitialpad ? <FaFont style={{ width: "25%", height: "25%" }} /> : isSignpad ? <FaSignature style={{ width: "25%", height: "25%" }} /> : <></>
                                                                    )}

                                                                    {isCompleted && isDatefield ? (
                                                                        currentDate
                                                                    ) : (
                                                                        isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }}/> : <></>
                                                                    )}
                                                                </>
                                                                )}


                                                            </Rnd>
                                                        );
                                                    })}

                                                    <SignatureModal showSignatureModal={showSignatureModal} setShowSignatureModal={setShowSignatureModal} onSuccess={handleSignatureSuccess} selectedIdItem={selectedIdItem} selectedSigner={selectedSigner} />

                                                    <InitialModal
                                                        showInitialModal={showInitialModal}
                                                        setShowInitialModal={setShowInitialModal}
                                                        onSuccess={handleSignatureSuccess}
                                                        backdropClassName="transparent-backdrop"
                                                        contentClassName="initial-modal-content"
                                                        selectedIdItem={selectedIdItem}
                                                        selectedSigner={selectedSigner}
                                                    />

                                                    <DeclineModal
                                                        showDeclineModal={showDeclineModal}
                                                        setShowDeclineModal={setShowDeclineModal}
                                                        onSuccess={handleSignatureSuccess}
                                                        selectedSigner={selectedSigner}
                                                        selectedDocument={selectedDocument}
                                                    />

                                                    <DelegateModal 
                                                        showDelegateModal={showDelegateModal}
                                                        setShowDelegateModal={setShowDelegateModal}
                                                        onSuccess={handleSignatureSuccess}
                                                        selectedSigner={selectedSigner}
                                                        selectedDocument={selectedDocument}
                                                    />

                                                    <DocInfoModal
                                                        showDocInfoModal={showDocInfoModal}
                                                        setShowDocInfoModal={setShowDocInfoModal}
                                                        onSuccess={handleSignatureSuccess}
                                                        selectedSigner={selectedSigner}
                                                        selectedDocument={selectedDocument}
                                                        signerInfo ={getSelectedSignerInfo()}
                                                    />

                                                    <AuditTrailModal
                                                        showAuditTrailModal={showAuditTrailModal}
                                                        setShowAuditTrailModal={setShowAuditTrailModal}
                                                        onSuccess={handleSignatureSuccess}
                                                        selectedSigner={selectedSigner}
                                                        selectedDocument={selectedDocument}
                                                        signerInfo ={getSelectedSignerInfo()}
                                                    />
                                                  </div>
                                                );
                                                })}
                                    
                                    </div>
                                    
                                </div>
                            </div>  
                        )}

                </Container>   
            </div>
        </>
    );
}

export default ReceiveDocument;