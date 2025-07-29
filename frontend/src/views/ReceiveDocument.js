import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import { FaCalendar, FaExclamationTriangle, FaFont, FaInfo, FaInfoCircle, FaSignature } from 'react-icons/fa';

import PDFCanvas from "components/Canvas/canvas.js";
import { Rnd } from 'react-rnd';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { Container, Spinner, Alert, Row, Col, Card, Navbar, Nav, Dropdown, Button, Modal, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { toast } from "react-toastify";

import SignatureModal from 'components/ModalForm/SignatureModal.js';
import InitialModal from "components/ModalForm/InitialModal.js";
import DeclineModal from "components/ModalForm/DeclineModal.js";
import DocInfoModal from "components/ModalForm/DocInfoModal.js";
import AuditTrailModal from "components/ModalForm/AuditTrailModal.js";

import "../assets/scss/lbd/_receivedoc.scss";
import "../assets/scss/lbd/_usernavbar.scss";
import { get } from "jquery";

function ReceiveDocument() {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [x_axis, setXAxis] = useState(0);
    const [y_axis, setYAxis] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [jenis_item, setJenisItem] = useState("");
    const [fields, setFields] = useState([]);
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [id_karyawan, setIdKaryawan] = useState("");
    const [id_item, setIdItem] = useState("");
    const [sign_base64, setSignBase64] = useState("");
    const [status, setStatus] = useState([]);
    const [signStatus, setSignStatus] = useState([]);
    const [nama, setNama] = useState("");

    const [showSignatureModal, setShowSignatureModal] = React.useState(false);
    const [showInitialModal, setShowInitialModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showDocInfoModal, setShowDocInfoModal] = useState(false);
    const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);

    const [selectedIdItem, setSelectedIdItem] = useState([]);
    
    const [initials, setInitials] = useState([]);
    const [signedInitials, setSignedInitials] = useState([]);
    const [initial, setInitial] = useState([]);

    const [signatures, setSignatures] = useState([]);
    const [signedSignatures, setSignedSignatures] = useState([]);
    const [signature, setSignature] = useState([]);

    const [dateField, setDateField] = useState([]);
    const [clickCount, setClickCount] = useState(0);
    const timeRef = useRef(null);

    const [signClicked, setSignClicked] = useState(false);
    const [initClicked, setInitClicked] = useState(false);
    const [nameSigner, setNameSigner] = useState("");

    const [selectedSigner, setSelectedSigner] = useState(null);
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [selectedKaryawan, setSelectedKaryawan] = useState(null);

    const [urutan, setUrutan] = useState("");
    const [urutanMap, setUrutanMap] = useState({});
    // const [signerUrutan, setSignerUrutan] = useState(null);

    const [allSigners, setAllSigners] = useState("");
    // const [is_submitted, setIsSubmitted] = useState("");
    const [submittedMap, setSubmittedMap] = useState({});
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

    const [verified, setVerified] = useState(false);
    const [inputEmail, setInputEmail] = useState("");
    const [emailVerified, setEmailVerified] = useState(false);

    const [inputPassword, setInputPassword] = useState("");
    const [isAccessed, setIsAccessed] = useState(false);

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] 
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const currentDate = `${day} ${month} ${year}`;

    // console.log("Current date:", currentDate);

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

    const handleSignatureClick = (id_item, show, editable) => {
        const signer = signatures.find(i => i.id_item === id_item);
        // console.log("Signer from signature click:", signer);
        if (signer) {
            setSelectedIdItem(id_item);
            setSelectedSigner(signer);
            setShowSignatureModal(true);
            setShow(show);
            setEditable(editable);

            // console.log("Data from signature click:", "id_item:", id_item, "show:", show, "editable:", editable);
        }
    };

    const handleInitialClick = (id_item, show, editable) => {
        // console.log("Id Item initial click:", id_item);
        
        const clickedField = initials.find(i => i.id_item === id_item);
        // console.log("Signer from initial click:", clickedField);
        
        if (!clickedField) {
            console.warn(`handleInitialClick: No initial field found for id_item: ${id_item}`);
            return;
        }

        setSelectedIdItem(id_item);
        setSelectedSigner(clickedField?.id_signers || null);
        setShowInitialModal(true);
        setShow(show);
        setEditable(editable);

        // console.log("Selected signer:", selectedSigner);

        // console.log("Initial clicked:", {
        //     id_item, 
        //     signer: clickedField?.id_signers, 
        //     show,
        //     editable,
        // });
    };

    const handleDeclineClick = (id_dokumen, id_signers) => {
        // console.log("ID Dokumen from decline:", id_dokumen);
        // console.log("ID Signers from decline:", id_signers);
        if (!id_dokumen || !id_signers) {
            console.warn("id_dokumen or id_signers not found.");
            return;
        }

        setSelectedSigner(id_signers);
        setSelectedDocument(id_dokumen);
        setShowDeclineModal(true);
    };

    const handleDocInfoClick = (id_dokumen, id_signers, id_karyawan) => {
        // console.log("ID Dokumen from docInfo:", id_dokumen);
        // console.log("ID Signers from docInfo:", id_signers);
        // console.log("ID Karyawan from docInfo:", id_karyawan);
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
        // console.log("ID Dokumen from docInfo:", id_dokumen);
        // console.log("ID Signers from docInfo:", id_signers);
        // console.log("ID Karyawan from docInfo:", id_karyawan);
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

    // useEffect(() => {
    //     const storedEmailVerified = localStorage.getItem("emailVerified") === "true";
    //     const storedIsAccessed = localStorage.getItem("is_accessed") === "true";  
        
    //     if (storedEmailVerified) setEmailVerified(true);
    //     if (storedIsAccessed) setIsAccessed(true);
    // }, []);

    // useEffect(() => {
    //     const checkAccessStatus = async() => {
    //         if (!token) return;

    //         try {
    //             const docRes = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
    //             const { id_dokumen, id_signers, id_logsign } = docRes.data;
    //             let accessed = false;

    //             const logsignRes = await axios.get(`http://localhost:5000/access-status?id_logsign=${id_logsign}&id_karyawan=${id_signers}`);
    //             accessed = logsignRes.data.is_accessed;
    //             setIsAccessed(accessed);

    //             if (accessed === true) {
    //                 setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
    //                 setEmailVerified(true);
    //                 setVerified(true);
    //                 setLoading(false);
    //             }

    //         } catch (error) {
    //             setIsAccessed(false);
    //             setEmailVerified(false);
    //             setPdfUrl("");
    //         }
    //     };
    //     checkAccessStatus();
    // }, [token]);


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
        // setLoading(true);
        setErrorMsg("");

        try {
            const docRes = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
            const { id_dokumen, id_signers, id_logsign, id_karyawan } = docRes.data;
            // let accessed = false;
            // try {
            //     const logsignRes = await axios.get(`http://localhost:5000/access-status?id_logsign=${id_logsign}&id_karyawan=${id_signers}`);
            //     accessed = logsignRes.data.is_accessed;
            //     setIsAccessed(accessed);
            // } catch (error) {
            //     if (err.response && err.response.status === 404) {
            //         accessed = false;
            //         setIsAccessed(accessed);
            //         console.log("Access status: not found, will verify email.");
            //     } else {
            //         throw err;
            //     }
            // }

            
            // console.log("Id Karyawan:", id_karyawan);
            // console.log("Id Logsign:", id_logsign);

            // if (accessed === true) {
            //     setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
            //     setEmailVerified(true);
            //     setVerified(true);
            //     // setIsAccessed(true);
            //     setLoading(false);
            //     return;
            // }

            await axios.post("http://localhost:5000/link-access-log", { token, real_email: inputEmail, password: inputPassword, is_accessed: true });
            setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
            setEmailVerified(true);
            setVerified(true);
            setIsAccessed(true);
            

            // localStorage.setItem("emailVerified", "true");
            // localStorage.setItem("is_accessed", "true");

        } catch (error) {
            setErrorMsg("Access Denied: Token doesn't valid or email not found.");
            setEmailVerified(false);
            setPdfUrl("");
            setIsAccessed(false);

            // localStorage.setItem("emailVerified", "false");
            // localStorage.setItem("is_accessed", "false");
        } finally {
            setLoading(false);
        }
    }


    console.log("isAccessed from db:", isAccessed);
    console.log("Email verified:", emailVerified);

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

            if (!id_dokumen || !allSigners || !urutan || !allItems || !idKaryawan) {
                throw new Error("Missing id_dokumen, id_signers, id_item, id_karyawan or urutan from token.");
            }

            setIdDokumen(id_dokumen);
            setIdSigner(currentSigner);
            setAllSigners(allSigners);
            setAllItems(allItems);
            setIdKaryawan(idKaryawan);

            // console.log("Current signer:", currentSigner);
            // console.log("All ID signer:", allSigners);
            // console.log("All Id item:", allItems);
            // console.log("ID Karyawan:", idKaryawan);
            
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
            // const allSenders = [];

            const signerArray = Array.isArray(allSigners) ? allSigners : [allSigners];
            const itemArray = Array.isArray(allItems) ? allItems : [allItems];
            const karyawanArray = Array.isArray(idKaryawan) ? idKaryawan : [idKaryawan];

            const urutanMapping = {};
            const submittedMapping = {};

            for (const signer of signerArray) {
                const resSignerInfo = await axios.get(`http://localhost:5000/doc-info/${id_dokumen}/${signer}`);
                    // console.log("RESPONSE DOC INFO:", resSignerInfo);
                    const dataSignerInfo = resSignerInfo.data;
                    // console.log("DATA DOC INFO:", dataSignerInfo);

                    if (dataSignerInfo.length > 0 && dataSignerInfo[0]?.Signerr && dataSignerInfo[0]?.DocName) {
                        const signerInfo = {
                            id_signers: dataSignerInfo[0].id_signers,
                            nama: dataSignerInfo[0].Signerr.nama,
                            organisasi: dataSignerInfo[0].Signerr.organisasi,
                            doc_name: dataSignerInfo[0].DocName.nama_dokumen,
                            email: dataSignerInfo[0].Signerr.Penerima?.email,
                        };
                        // console.log("SIGNER INFO DOC INFO:", signerInfo);
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
                
                for (const itemID of itemArray) {
                    const fieldRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}/${itemID}`);

                    const validFields = fieldRes.data.filter(item => item.ItemField);

                    for (let idx = 0; idx < validFields.length; idx++) {
                        const item = validFields[idx];
                        const{
                            x_axis, 
                            y_axis, 
                            width, 
                            height, 
                            jenis_item, 
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
                            id: `field-${signer}-${idx}`,
                            x_axis,
                            y_axis,
                            width,
                            height, 
                            jenis_item,
                            pageScale: 1,
                            enableResizing: false,
                            disableDragging: true,
                            id_item: fieldItemId, 
                            status,
                            urutan, 
                            is_submitted, 
                            show,
                            editable,
                            id_signers: currentSigner, 
                        }; 

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

            // console.log("SIGNER DATA FROM RECEIVE:", allSigner);
            setSignerData(allSigner);

            setSignatures(localSignatureFields);
            setInitials(localInitialFields);
            setDateField(localDateFields);
            setSignStatus(allStatus);
            setUrutanMap(urutanMapping);
            setSubmittedMap(submittedMapping);

            // console.log("UrutanMap:", urutanMapping);
            // console.log("SubmittedMap:", submittedMap); 
            
        } catch (error) {
            console.error("Failed to load PDF:", error.message);
            setErrorMsg(error.message);
             toast.error("Failed to load PDF Document.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    // useEffect(() => {
    // const verifyAccess = async () => {
    //     try {
    //     await axios.post("http://localhost:5000/link-access-log", { token });
    //     const docRes = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
    //     const { id_dokumen } = docRes.data;
    //     setPdfUrl(`http://localhost:5000/pdf-document/${id_dokumen}`);
    //     setVerified(true);
    //     } catch (err) {
    //     setErrorMsg("Please enter the email to verify access.");
    //     setVerified(false);
    //     }
    // };
    // verifyAccess();
    // }, [token]);
    


    useEffect(() => {
        if (signerData.length === 0) return;
        const foundSigner = signerData.find(s => s.id_signers === id_signers); 
        // console.log("FOUND SIGNER FROM RECEIVE:", foundSigner);

        if (foundSigner) {
            setNama(foundSigner.nama);
        }
    }, [id_signers, signerData]);

    const updateSubmitted = async(id_dokumen, id_signers) => {
        // console.log("Id Dokumen:", id_dokumen);
        // console.log("Id Signers:", id_signers);

        try {
            const response = await axios.patch(`http://localhost:5000/update-submitted/${id_dokumen}/${id_signers}`, {
                is_submitted: true,
                status: "Completed",
            });

            // console.log("Document signed submitted:", response);
            toast.success("Document signed successfully.", {
                position: "top-right", 
                autoClose: 5000, 
                hideProgressBar: true,
            });

            window.location.reload();
        } catch (error) {
            // console.log("Failed to save signed document:", error.message);
            toast.error("Failed to save signed document.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });
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
        
        // console.log("Signer array:", signerArray);
        // console.log("Signer array length:", signerArray.length);

        const allFields = [];

        for (const signer of signerArray) {
            for (const itemId of itemArray) {
            const currentUrutan = Number(urutanMap[itemId]);
            // console.log("currentUrutan allFields:", currentUrutan);
            const currentSubmitted = submittedMap[signer];

            const axisRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}/${itemId}`);
            const signerFields = axisRes.data.filter(field => field.ItemField?.jenis_item);

            const signerInitials = initialsData.filter(init => init.id_signers === signer);

            const prevSigner = Object.keys(urutanMap).find(
            key => Number(urutanMap[key]) === currentUrutan - 1
            );
            // console.log("prevSigner:", prevSigner);

            // console.log("initialsData:", initialsData);
            const initialsForPrevSigner = initialsData.filter(init => init.id_item === prevSigner);
            // console.log("initialsForPrevSigner:", initialsForPrevSigner);


            const prevFields = allFields.filter(
                field => field.id_item === prevSigner
            );

            // console.log("prevField:", prevFields);

            const prevStatusList = prevFields.map(field => field.status);
            // console.log("prevStatusList:", prevStatusList);
            const prevSubmittedList = prevFields.map(field => field.is_submitted);
            // console.log("prevSubmittedList:", prevSubmittedList);

            const allCompleted =
            prevStatusList.length > 0 &&
            prevStatusList.every(status => status === "Completed") &&
            prevSubmittedList.every(is_submitted => is_submitted === true);

            setCompleteSubmitted(allCompleted);

            let show = true;
            let editable = true;
            

            if (signerArray.length > 1) {
                if (currentUrutan === 1) {
                    show = true;
                    editable = true;
                } else if (prevStatusList.length === 0) {
                    show = false;
                    editable = false;
                } else if (prevStatusList.every(status => status === "Completed") && prevSubmittedList.every(is_submitted => is_submitted === true)) {
                    show = true;
                    editable = true;
                } else if (prevStatusList.every(status => status === "Pending") || prevSubmittedList.every(is_submitted => is_submitted !== true)) {
                    show = false;
                    editable = false;
                } else {
                    show = true;
                    editable = false;
                }
            }

            const nextSign = Object.keys(urutanMap).find(
            key => Number(urutanMap[key]) === currentUrutan + 1
            );

            const nextSignerInitials = initialsData.filter(init => init.id_signers === nextSign);
            const nextSignerSubmitted = submittedMap[nextSign];
            const nextSignCompleted = nextSignerInitials.length > 0 && nextSignerSubmitted === true;

            const mappedFields = signerFields.map(field => {
            const matchInitial = signerInitials.find(init => init.id_item === field.id_item);
            const base64 = matchInitial?.sign_base64;
            const formattedBase64 = base64?.startsWith("data:image")
                ? base64
                : base64 ? `data:image/png;base64,${base64}` : null;

            if (field.ItemField?.jenis_item === "Date") {
                show = true;
                editable = false; 
            }

            return {
                id_item: field.id_item,
                id_signers: signer,
                sign_base64: formattedBase64,
                status: matchInitial?.status || "Pending",
                nama: matchInitial?.Signerr?.nama || "-",
                x_axis: field.ItemField?.x_axis || 0,
                y_axis: field.ItemField?.y_axis || 0,
                width: field.ItemField?.width || 50,
                height: field.ItemField?.height || 50,
                enableResizing: false,
                disableDragging: true,
                show,
                editable,
                urutan: currentUrutan,
                id_dokumen,
                is_submitted: currentSubmitted,
                nextSigner: nextSign,
                prevSigner,
                nextSignCompleted,
                jenis_item: field.ItemField?.jenis_item || "",
            };
            });

            allFields.push(...mappedFields);
            }
        }

        setSignedInitials(allFields); 
        setSignedSignatures(allFields);
        // console.log("All Mapped Fields:", allFields);

        const filteredFields = allFields.filter(field => field.id_signers === id_signers);
        setInitial(filteredFields);
        setSignature(filteredFields);
        setDateField(filteredFields);

        const statusList = filteredFields.map(field => field.status);
        setInitialStatus(statusList);

        const submittedList = filteredFields.map(field => field.is_submitted);
        setSubmittedList(submittedList);

        const jenisItemList = filteredFields.map(field => field.jenis_item);
        setJenisItemList(jenisItemList);

        // console.log("Jenis item list:", jenisItemList);

        const nextSignCompletedList = allFields
            .filter(field => field.prevSigner === id_signers)
            .map(field => field.is_submitted);
        setNextSignCompleted(nextSignCompletedList);


        } catch (error) {
        console.error("Failed to fetch initials or axis-field:", error.message);
        }
    };

    fetchAllFields();
    }, [id_dokumen, id_signers, urutanMap, allSigners]);

    // useEffect(() => {
    //     console.log("All sign STATUS:", signStatus);
    // }, [signStatus]);

    // const isJenisItemList = jenisItem_list.every(jenis_item => jenis_item !== "Date");

    const nonDateItems = jenisItem_list
    .map((jenis_item, index) => ({jenis_item, status: initial_status[index]}))
    .filter(item => item.jenis_item !== "Date");

    const isNonDateCompleted = nonDateItems.every(item => item.status === "Completed");

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
                            onClick={() => handleDocInfoClick(id_dokumen, id_signers, id_karyawan)}
                        >
                            Document Info
                        </Dropdown.Item>
                        <div className="divider"></div>
                        
                        <Dropdown.Item
                            href="#"
                            onClick={() => handleAuditTrail(id_dokumen, id_signers)}
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
                        onClick={() => updateSubmitted(id_dokumen, id_signers)}
                        disabled={!isNonDateCompleted}
                        hidden={submitted_list.every(is_completed => is_completed === true) || initial_status.every(status => status === "Decline")}
                    >
                        Finish
                    </Button>
                    </Nav>
                </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="center-object my-4">
                <div>
                    <Container fluid className="mt-3 px-0">
                            {loading && <Spinner animation="border" variant="primary" />}
                            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                            {console.log("IS ACCESSED:", isAccessed)}
                            {isAccessed !== true && (
                                <Form onSubmit={handleEmailVerify} className="mb-3">
                                    <Form.Group> 
                                        <Form.Label>
                                            Email:
                                        </Form.Label>
                                        <Form.Control
                                            type="email"
                                            value={inputEmail}
                                            onChange={(e) => setInputEmail(e.target.value)}
                                            required />
                                    </Form.Group>
                                    <Form.Group> 
                                        <Form.Label>
                                            Password:
                                        </Form.Label>
                                        <Form.Control
                                            type="password"
                                            value={inputPassword}
                                            onChange={(e) => setInputPassword(e.target.value)}
                                            required />
                                    </Form.Group>
                                    <Button type="submit" variant="primary" className="mt-3" disabled={loading}>{loading ? "Verifying..." : "Verify Email"}</Button>
                                </Form>
                            )}
                            {isAccessed === true && pdfUrl && (
                                <>
                                    <div className="vertical-center">
                                        <Alert variant="warning" hidden={!initial_status.every(status => status === "Decline")}>
                                        <FaExclamationTriangle className="mb-1 mr-2"/>  {nama} has declined to sign this document.
                                        </Alert>
                                        <PDFCanvas pdfUrl={pdfUrl} />
                                        
                                        {/* image -- setelah di ttd */}
                                        {signedInitials.map((sig) => {
                                            if (!sig || !sig.id_item || sig.show !== true) return null;

                                            const isCompleted = sig.status === "Completed";
                                            const completedNext = sig.is_submitted === true;
                                            const isDatefield = sig.jenis_item === "Date"

                                            return (
                                                <Rnd
                                                    key={`${sig.id_signers}-${sig.id_item}`}
                                                    position={{ x: Number(sig.x_axis), y: Number(sig.y_axis) }}
                                                    size={{ width: Number(sig.height), height: Number(sig.width) }}
                                                    enableResizing={sig.enableResizing}
                                                    disableDragging={sig.disableDragging}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    
                                                    }}
                                                >
                                                    {isCompleted && completedNext && sig.sign_base64 ? (
                                                        <img
                                                            src={sig.sign_base64}
                                                            alt="Initial"
                                                            style={{ width: "100%", height: "100%" }}
                                                            // hidden={nextSignCompleted === false}
                                                        />
                                                    ) : (
                                                        <></>
                                                    )}
                                                    {isCompleted && completedNext && isDatefield ? (
                                                        currentDate
                                                    ) : (
                                                        <></>
                                                    )}
                                                </Rnd>
                                            );
                                        })}


                                        {/* field sign */}
                                        {initial.map((sig) => {
                                            if (!sig || !sig.id_item || sig.show !== true) return null;

                                            const isCompleted = sig.status === "Completed";
                                            const isSubmitted = sig.is_submitted === true;
                                            const isInitialpad = sig.jenis_item === "Initialpad";
                                            const isSignpad = sig.jenis_item === "Signpad";
                                            const isDatefield = sig.jenis_item === "Date"

                                            return (
                                                <Rnd
                                                    key={`${sig.id_signers}-${sig.id_item}`}
                                                    position={{ x: Number(sig.x_axis), y: Number(sig.y_axis) }}
                                                    size={{ width: Number(sig.height), height: Number(sig.width) }}
                                                    enableResizing={sig.enableResizing}
                                                    disableDragging={sig.disableDragging}
                                                    style={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: isCompleted
                                                            ? "transparent"
                                                            : "rgba(25, 230, 25, 0.5)",
                                                        border: isSubmitted ? "none" : "solid 3px rgba(10, 193, 10, 0.5)", 
                                                        cursor: sig.editable && !isSubmitted ? "pointer" : "default",
                                                        zIndex: isCompleted? 1 : 2
                                                    }}
                                                    hidden={initial_status.every(status => status === "Decline")}
                                                    onClick={() => {
                                                        if (sig.editable && !isSubmitted) {
                                                            if (isInitialpad) {
                                                                handleInitialClick(sig.id_item, sig.show, sig.editable);
                                                            } else if (isSignpad) {
                                                                handleSignatureClick(sig.id_item, sig.editable, sig.show);
                                                            }
                                                        }
                                                    }}
                                                >
                                                    {!isSubmitted ? (
                                                    <OverlayTrigger
                                                        placement="bottom"
                                                        overlay={<Tooltip id="initialCompleteTooltip">Click to change your sign.</Tooltip>}
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
                                </>  
                            )}

                    </Container>   
                </div>
            </div>
        </>
    );
}

export default ReceiveDocument;