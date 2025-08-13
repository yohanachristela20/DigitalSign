import React, { useState, useEffect, useRef, useMemo } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import { FaCalendar, FaExclamationTriangle, FaFont, FaInfo, FaInfoCircle, FaKey, FaSignature, FaUser } from 'react-icons/fa';

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
import DelegateModal from "components/ModalForm/DelegateModal.js";

import "../assets/scss/lbd/_receivedoc.scss";
import "../assets/scss/lbd/_usernavbar.scss";
import "../assets/scss/lbd/_login.scss";

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
    const [delegated_signers, setDelegatedSigners] = useState("");
    const [id_karyawan, setIdKaryawan] = useState("");
    const [id_item, setIdItem] = useState("");
    const [sign_base64, setSignBase64] = useState("");
    const [status, setStatus] = useState([]);
    const [signStatus, setSignStatus] = useState([]);
    const [nama, setNama] = useState("");
    const [mainSigner, setMainSigner] = useState("");

    const [showSignatureModal, setShowSignatureModal] = React.useState(false);
    const [showInitialModal, setShowInitialModal] = useState(false);
    const [showDeclineModal, setShowDeclineModal] = useState(false);
    const [showDocInfoModal, setShowDocInfoModal] = useState(false);
    const [showAuditTrailModal, setShowAuditTrailModal] = useState(false);
    const [showDelegateModal, setShowDelegateModal] = useState(false);

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

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] 
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const currentDate = `${day} ${month} ${year}`;

    const isdelegated = localStorage.getItem("is_delegated");
    const delegatedDoc = localStorage.getItem("id_dokumen");

    console.log("isDelegated from modal:", isdelegated);
    console.log("delegatedDoc:", delegatedDoc);

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
        if (signer) {
            setSelectedIdItem(id_item);
            setSelectedSigner(signer);
            setShowSignatureModal(true);
            setShow(show);
            setEditable(editable);

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

            
            console.log("is_delegated:", is_delegated);

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
             toast.error("Failed to load PDF Document.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    console.log("id_dokumen real:", id_dokumen);


    
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
            });

            toast.success("Document signed successfully.", {
                position: "top-right", 
                autoClose: 5000, 
                hideProgressBar: true,
            });

            window.location.reload();
        } catch (error) {
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
                        enableResizing: false,
                        disableDragging: true,
                        jenis_item: field.ItemField?.jenis_item || "", 
                        urutan: currentUrutan, 
                        id_dokumen, 
                        is_submitted: currentSubmitted,
                        rawField: field,
                        is_delegated: currentDelegated,
                        nowSigner: finalSignerId,
                        delegated_signers: delegatedForThisSigner,
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

            // console.log("is_delegated fetchall:", is_delegated);

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

        
        console.log("filteredFields for render:", filteredFields.map(f => ({
            id_signers: f.id_signers,
            delegated_signers: f.delegated_signers,
            id_item: f.id_item,
            jenis_item: f.jenis_item,
        })));

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

    const stableItemArray = useMemo(() => (
        Array.isArray(allItems) ? allItems : [allItems]
    ), [allItems]);

    const stableSignerArray = useMemo(() => (
        Array.isArray(signerArray) ? signerArray : [signerArray]
    ), [signerArray]);
    
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

                    console.log(`Item ${item} → is current: ${isCurrentItem}`);
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
        console.log("Final currentItemIds:", allCurrentItemIds);
    }, [signerArray, itemArray, initial]);
    


    return (
        <>
            <Navbar className="bg-navbar nav-padding" expand="lg" hidden={isAccessed !== true}>
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
                        hidden={isAccessed !== true || (delegatedDoc === id_dokumen && isdelegated)}
                        // /delegatedDoc !== id_dokumen || (initial_status.every(status => status === "Completed") ? delegated_signers === id_signers : !isdelegated)
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
                        onClick={() => updateSubmitted(id_dokumen, current_signer)}
                        disabled={isFinishDisabled}
                        hidden={isFinishHidden || delegatedDoc === id_dokumen && isdelegated || initial_status.every(status => status === "Decline")}
                     
                    >
                        Finish
                    </Button>
                    </Nav>
                </Navbar.Collapse>
                </Container>
            </Navbar>

            <div>
                <Container fluid className="px-0">
                        {loading && <Spinner animation="border" variant="primary" />}
                        <div className="sign-in__user d-flex align-items-center justify-content-center pt-5 ">
                        <Alert variant="warning" hidden={!initial_status.every(status => status === "Decline")}>
                            <FaExclamationTriangle className="mb-1 mr-2"/> {nama} has declined to sign this document.
                        </Alert>
                        <Alert variant="warning" hidden={delegatedDoc !== id_dokumen || (initial_status.every(status => status === "Completed") ? delegated_signers === id_signers : !isdelegated)}>
                            <FaExclamationTriangle className="mb-1 mr-2"/> {nama} has delegate this document to other signer.
                        </Alert>
                        {isAccessed !== true && (
                    
                        <Row className="login-user user-element mt-2">
                            
                            <Card className="login-card shadow mb-0">
                                <>{errorMsg && <Alert variant="danger" className="m-4">{errorMsg}</Alert>}</>
                                <div className="d-flex align-items-center justify-content-center">
                                    <img src={require("assets/img/login2.png")} alt="login-img" style={{width:450}} />
                                </div>
                                <Card.Body>
                                    <h3 className="text-center font-form mt-0">Campina Sign</h3>
                                    <Alert variant="info"><FaInfoCircle className="mr-2"/>Please verify your email</Alert>
                                    <Form onSubmit={handleEmailVerify} className="mb-3">
                                        <Form.Group className="mb-2"> 
                                            <span class="input-group-text bg-transparent  border-0" id="basic-addon1">
                                                <FaUser style={{ marginRight: '8px' }} />
                                                <Form.Control
                                                    type="email"
                                                    placeholder="Email"
                                                    value={inputEmail}
                                                    onChange={(e) => setInputEmail(e.target.value)}
                                                    required
                                                    style={{borderStyle: 'none', borderBottom:'solid', borderBottomWidth:1, borderRadius:0, borderColor:'#E3E3E3'}}
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
                                        <Button type="submit" className="w-100 mt-3" disabled={loading} 
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
                            <div className="center-object">
                                <div className="vertical-center">
                                    {/* <Alert variant="warning" hidden={!initial_status.every(status => status === "Decline")}>
                                    <FaExclamationTriangle className="mb-1 mr-2"/> {nama} has declined to sign this document.
                                    </Alert> */}
                                    <PDFCanvas pdfUrl={pdfUrl} />                           

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
                                        const prevSigner = sig.prevSigner; //item field
                                        const currentSigner = sig.id_signers;
                                        const currentItem = sig.id_item === currentItemId;
                                        const nextSigner = sig.nextSigner;
                                        const is_delegated = sig.is_delegated;
                                        const delegated_signers = sig.delegated_signers;

                                        const isSignerOwner = sig.id_signers === id_signers;
                                        const isSignerDelegated = delegated_signers === id_signers;

                                        const isFirstSigner = urutan === 1;

                                        const showImage = sig.sign_base64;
                                        const showDate = isCompleted && completedNext && isDatefield;

                                        const delegatedArray = Array.isArray(delegated_signers)
                                        ? delegated_signers.map(String)
                                        : delegated_signers ? [String(delegated_signers)] : [];

                                        const normalizedArray = Array.isArray(normalizedDelegated)
                                        ? normalizedDelegated.map(String)
                                        : normalizedDelegated ? [String(normalizedDelegated)] : [];

                                        let bgFirst = currentItem || isSubmitted ? "transparent" : "rgba(86, 90, 90, 0.3)";
                                        let bgOthers = currentItem || isSubmitted ? "transparent" : "rgba(86, 90, 90, 0.3)";

                                        if ((delegatedArray.length > 1 || normalizedArray.length > 1) && isCompleted !== true) {
                                            bgFirst = "rgba(86, 90, 90, 0.3)";
                                            bgOthers = "rgba(86, 90, 90, 0.3)";
                                        }

                                        if (isCompleted === true) {
                                            bgFirst = "transparent";
                                            bgOthers = "transparent";
                                        }

                                        const firstBorderStyle = currentItem
                                        ? "transparent"
                                        : isSubmitted
                                        ? "transparent"
                                        : "solid 5px rgba(86, 90, 90, 0.3)";

                                        const otherBorderStyle = currentItem 
                                        ? "transparent"
                                        : isSubmitted
                                        ? "transparent"
                                        : "solid 5px rgba(86, 90, 90, 0.3)";

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

                                            // return <p className="text-center">Another sign didn't complete</p>;
                                        };

                                        const message = getMessageForUrutan(sig.urutan);

                                        const currentSignerStr = String(current_signer);
                                        const isCurrentItem = currentItemId.includes(sig.id_item);

                                        const signerItemCount = initial.filter(item => 
                                            currentItemId.includes(item.id_item) && (
                                                String(item.id_signers) === currentSignerStr ||
                                                delegatedArray.includes(currentSignerStr) || 
                                                normalizedArray.includes(currentSignerStr)
                                            )
                                        ).length;

                                        console.log("current item count:", signerItemCount);


                                        return (
                                            <>
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
                                                            backgroundColor: isFirstSigner ? bgFirst : bgOthers,
                                                            border: isFirstSigner ? firstBorderStyle : otherBorderStyle,
                                                            zIndex: zIndexStyle,
                                                            // cursor: sig.editable && !isSubmitted && currentItem ? "pointer" : "default",
                                                           
                                                            cursor: !isSubmitted && (delegatedDoc !== id_dokumen || !isdelegated) && currentSignerStr === String(sig.id_signers) || (delegatedArray.includes(currentSignerStr) && !isSubmitted) && (normalizedArray.includes(currentSignerStr) && !isSubmitted)? "pointer" : "default",
                                                            
                                                        }}
                                                        hidden={isDecline}
                                                        onClick={() => {
                                                            const currentSignerStr = String(current_signer);
                                                            const isCurrentSigner = 
                                                            String(sig.id_signers) === currentSignerStr ||
                                                            delegatedArray.includes(currentSignerStr) ||
                                                            normalizedArray.includes(currentSignerStr);

                                                            const canClick = isCurrentSigner && isCurrentItem && !isSubmitted && (delegatedDoc !== id_dokumen || !isdelegated);

                                                            if (canClick) {
                                                                if (isInitialpad){
                                                                    handleInitialClick(sig.id_item, sig.show, sig.editable);
                                                                } else if (isSignpad) {
                                                                    handleSignatureClick(sig.id_item, sig.editable, sig.show);
                                                                }
                                                            }
                                                        }}
                                                        disabled ={isSubmitted === true}

                                                    >
                                                        {is_delegated || (isCompleted && completedNext && sig.sign_base64) ? (
                                                            <img
                                                                src={sig.sign_base64}
                                                                alt="Initial"
                                                                style={{ width: "100%", height: "100%" }}
                                                            />
                                                        ) : isFirstSigner ? (
                                                            message
                                                        ) : !isFirstSigner ? (
                                                            message
                                                        ) : (
                                                            <></>
                                                        )}
                                                        {isCompleted && completedNext && isDatefield ? (
                                                            currentDate
                                                        ) : (
                                                        <></>
                                                        )}
                                                    </Rnd>
                                            </>
                                        );
                                    })}

                                    {/* field sign */}
                                    {initial.map((sig) => {
                                        if (!sig || !sig.id_item || sig.show !== true) return null;

                                        const isCompleted = sig.status === "Completed";
                                        const isSubmitted = sig.is_submitted === true;
                                        const isDecline = sig.status === "Decline";
                                        const isInitialpad = sig.jenis_item === "Initialpad";
                                        const isSignpad = sig.jenis_item === "Signpad";
                                        const isDatefield = sig.jenis_item === "Date";
                                        const isPrevField = sig.prevFieldDisplay === true;
                                        const prevSigner = sig.prevSigner; //item field
                                        const urutan = sig.urutan;
                                        const isFirstSigner = urutan === 1;
                                        const currentSigner = sig.id_signers;
                                        const currentItem = sig.id_item === currentItemId;
                                        const nextSigner = sig.nextSigner;
                                        // const isDelegated = sig.is_delegated;
                                        const is_delegated = sig.is_delegated;

                                        const isSignerOwner = sig.id_signers === id_signers;
                                        const isSignerDelegated = delegated_signers === id_signers;

                                        const prevField = signedInitials.find(field => field.id_item === prevSigner);
                                        const prevNotSubmitted = prevField && (
                                            prevField.status !== "Completed" || prevField.is_submitted !== true
                                        );
                                        
                                        console.log("current item id:", currentItemId);

                                        //FIX PLISSS JGN DIUBAH!!!
                                        const borderStyle = 
                                        isSubmitted 
                                        ? "transparent"
                                        : !isSignerDelegated && !isSignerOwner && !is_delegated
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

                                        let bgFirst = "transparent";
                                        let bgOthers = "transparent";

                                        if (isSubmitted) {
                                            bgFirst = "transparent";
                                        }
                                        else if (!isCompleted){
                                            bgFirst = "rgba(25, 230, 25, 0.5)";
                                        }
                                        if (!isSignerDelegated && is_delegated && !isSubmitted && !isCompleted) {
                                            bgFirst = "rgba(25, 230, 25, 0.5)";
                                        } else if (!isSignerOwner && !isSignerDelegated) {
                                            bgFirst = "rgba(25, 230, 25, 0.5)";
                                        } 

                                        if (isSubmitted) {
                                            bgOthers = "transparent";
                                        }
                                        else if (!isCompleted){
                                            bgOthers = "rgba(25, 230, 25, 0.5)";
                                        }
                                        if (!isSignerDelegated && is_delegated && !isSubmitted && !isCompleted) {
                                            bgOthers = "rgba(25, 230, 25, 0.5)";
                                        } else if (!isSignerOwner && !isSignerDelegated) {
                                            bgOthers = "rgba(25, 230, 25, 0.5)";
                                        } 

                                        if ((delegatedArray.length > 1 || normalizedArray.length > 1) && isCompleted !== true) {
                                            bgFirst = "rgba(25, 230, 25, 0.5)";
                                            bgOthers = "rgba(25, 230, 25, 0.5)";
                                        }

                                        if (isCompleted === true) {
                                            bgFirst = "transparent"
                                            bgOthers = "transparent"
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

                                        console.log("current item count:", signerItemCount);

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
                                                    backgroundColor: 
                                                        isFirstSigner ? bgFirst : bgOthers,
                                                    border: borderStyle, 
                                                    cursor: !isSubmitted && (delegatedDoc !== id_dokumen || !isdelegated) && currentSignerStr === String(sig.id_signers) || (delegatedArray.includes(currentSignerStr) && !isSubmitted) && (normalizedArray.includes(currentSignerStr) && !isSubmitted)? "pointer" : "default",

                                                    zIndex: isCompleted? 1 : 2,
                                                }}
                                                hidden={isDecline}
                                                onClick={() => {
                                                    const currentSignerStr = String(current_signer);
                                                    const isCurrentSigner = 
                                                    String(sig.id_signers) === currentSignerStr ||
                                                    delegatedArray.includes(currentSignerStr) ||
                                                    normalizedArray.includes(currentSignerStr);

                                                    const canClick = isCurrentSigner && isCurrentItem && !isSubmitted && (delegatedDoc !== id_dokumen || !isdelegated);

                                                    if (canClick) {
                                                        if (isInitialpad){
                                                            handleInitialClick(sig.id_item, sig.show, sig.editable);
                                                        } else if (isSignpad) {
                                                            handleSignatureClick(sig.id_item, sig.editable, sig.show);
                                                        }
                                                    }
                                                }}
                                                disabled ={isSubmitted === true}
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
                            </div>  
                        )}

                </Container>   
            </div>
        </>
    );
}

export default ReceiveDocument;