import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaFont, FaSignature } from 'react-icons/fa';

import PDFCanvas from "components/Canvas/canvas.js";
import { Rnd } from 'react-rnd';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { Container, Spinner, Alert, Row, Col, Card } from "react-bootstrap";
import { toast } from "react-toastify";

import SignatureModal from 'components/ModalForm/SignatureModal.js';
import InitialModal from "components/ModalForm/InitialModal.js";
import "../assets/scss/lbd/_receivedoc.scss";
import UserNavbar from "components/Navbars/UserNavbar.js";


function ReceiveDocument() {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [x_axis, setXAxis] = useState(0);
    const [y_axis, setYAxis] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [jenis_item, setJenisItem] = useState("");
    const [fields, setFields] = useState([]);
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [sign_base64, setSignBase64] = useState("");
    const [status, setStatus] = useState([]);
    const [signStatus, setSignStatus] = useState([]);
    const [nama, setNama] = useState("");

    const [showSignatureModal, setShowSignatureModal] = React.useState(false);
    const [showInitialModal, setShowInitialModal] = useState(false);
    const [selectedIdItem, setSelectedIdItem] = useState([]);
    
    const [initials, setInitials] = useState([]);
    const [signedInitials, setSignedInitials] = useState([]);
    const [initial, setInitial] = useState([]);

    const [signatures, setSignatures] = useState([]);
    const [dateField, setDateField] = useState([]);
    const [clickCount, setClickCount] = useState(0);
    const timeRef = useRef(null);

    const [signClicked, setSignClicked] = useState(false);
    const [initClicked, setInitClicked] = useState(false);
    const [nameSigner, setNameSigner] = useState("");

    const [selectedSigner, setSelectedSigner] = useState(null);

    const [urutan, setUrutan] = useState("");
    const [urutanMap, setUrutanMap] = useState({});
    // const [signerUrutan, setSignerUrutan] = useState(null);

    const [allSigners, setAllSigners] = useState("");
    
    
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

    const handleSignatureClick = () => {
        setShowSignatureModal(true);
    };

    const handleInitialClick = (id_item) => {
        const signer = initials.find(i => i.id_item === id_item);
        if (signer) {
            setSelectedIdItem(id_item);
            setSelectedSigner(signer);
            setShowInitialModal(true);

            console.log("ID Item clicked:", id_item);
        }
    };
    
    const handleSignatureSuccess = () => {
        toast.success("Document signed successfully.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
        });
    };

    useEffect(() => {
    const fetchData = async () => {
        if (!token) return;

        try {
            const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
            const id_dokumen = res.data.id_dokumen;
            const id_signers = res.data.id_signers;
            const urutan = res.data.urutan;
            const currentSigner = res.data.currentSigner;

            if (!id_dokumen || !id_signers || !urutan) {
                throw new Error("Missing id_dokumen, id_signers, or urutan from token.");
            }

            setIdDokumen(id_dokumen);
            setIdSigner(currentSigner);
            setAllSigners(id_signers);

            console.log("Current signer:", currentSigner);
            console.log("All ID signer:", id_signers);

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

            const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];

            const urutanMapping = {};

            for (const signer of signerArray) {
                const field = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`)
                field.data
                .filter(item => item.ItemField)
                .forEach((item, idx) => {
                    const { x_axis, y_axis, width, height, jenis_item, id_item } = item.ItemField;
                    const status = item.status || "Pending";
                    const urutan = item.urutan;
                    if (!urutanMapping[signer]) {
                        urutanMapping[signer] = urutan;
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
                        id_item,
                        status, 
                        urutan,
                    };

                    allStatus.push({ id_item, status });

                    if (jenis_item === "Signpad") {
                        localSignatureFields.push(fieldObj);
                    } else if (jenis_item === "Initialpad") {
                        localInitialFields.push(fieldObj);
                    } else if (jenis_item === "Date") {
                        localDateFields.push(fieldObj);
                    }
            });
            }

            setSignatures(localSignatureFields);
            setInitials(localInitialFields);
            setDateField(localDateFields);
            setSignStatus(allStatus);
            setUrutanMap(urutanMapping);
            
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

    useEffect(() => {
        const fetchInitials = async () => {
            if (!id_dokumen || !allSigners || allSigners.length === 0 || Object.keys(urutanMap).length === 0) return;

            try {
            const signerArray = Array.isArray(allSigners) ? allSigners : [allSigners];
            const signerParam = signerArray.join(",");
            const initialsRes = await axios.get(`http://localhost:5000/initials/${id_dokumen}/${signerParam}`);
            const initialsData = initialsRes.data;

            const allInitialFields = [];

            for (let i = 0; i < signerArray.length; i++) {
            const signer = signerArray[i];
            const currentUrutan = Number(urutanMap[signer]);
            console.log("CURRENT URUTAN:", currentUrutan);

            const axisRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`);
            const signerFields = axisRes.data.filter(field => field.ItemField?.jenis_item === "Initialpad");

            const signerInitials = initialsData.filter(init => init.id_signers === signer);

            let show = false;
            let editable = false;

            if (currentUrutan === 1) {
                show = true;
                editable = true;
            } else {
                const prevSigner = Object.keys(urutanMap).find(key => Number(urutanMap[key]) === currentUrutan - 1);
                console.log("PREV SIGNER:", prevSigner);

                const prevStatusList = allInitialFields
                .filter(field => field.id_signers === prevSigner && field.id_dokumen === id_dokumen)
                .map(field => field.status);

                console.log("PREVSTATUS LIST:", prevStatusList);

                const allCompleted = prevStatusList.length > 0 && prevStatusList.every(status => status === "Completed");

                if (allCompleted) {
                    show = true;
                    editable = true;
                    } else if (prevStatusList.every(status => status === "Pending")) {
                    show = false;
                    editable = false;
                    } else {
                    show = true;
                    editable = false;
                }
            }

            const initialListForSigner = signerFields.map(field => {
                const matchInitial = signerInitials.find(init => init.id_item === field.id_item);
                const base64 = matchInitial?.sign_base64;
                const formattedBase64 = base64?.startsWith("data:image")
                ? base64
                : base64 ? `data:image/png;base64,${base64}` : null;

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
                };
            });

                allInitialFields.push(...initialListForSigner);
            }

            setSignedInitials(allInitialFields);
            console.log("All Initial list:", allInitialFields);

            const filteredFields = allInitialFields.filter(field => field.id_signers === id_signers);
            setInitial(filteredFields);
            console.log("Initial satuan:", filteredFields);
            

            } catch (error) {
            console.error("Failed to fetch initials or axis-field:", error.message);
            }
        };

    fetchInitials();
    }, [id_dokumen, id_signers, urutanMap, allSigners]);


    useEffect(() => {
        console.log("All sign STATUS:", signStatus);
    }, [signStatus]);

    return (
        <>
            <UserNavbar />
            <div className="center-object my-4">
                <div>
                    <Container fluid className="mt-3 px-0">
                            {loading && <Spinner animation="border" variant="primary" />}
                            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                            {!loading && !errorMsg && pdfUrl && (
                            <>
                                <div className="vertical-center">
                                <PDFCanvas pdfUrl={pdfUrl} />
                                
                                {signatures.map((sig, index) => (
                                    <>
                                        <Rnd
                                            key={sig.id}
                                            position={{ x: sig.x_axis, y: sig.y_axis }}
                                            size={{ width: sig.height, height: sig.width }}
                                            enableResizing={sig.enableResizing} 
                                            disableDragging={sig.disableDragging} 
                                            style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "rgba(25, 230, 25, 0.5)", 
                                            }}
                                            onClick={handleSignatureClick}
                                        >
                                            <FaSignature style={{ width: "25%", height: "25%" }} />
                                        </Rnd>
                                        <SignatureModal showSignatureModal={showSignatureModal} setShowSignatureModal={setShowSignatureModal} onSuccess={handleSignatureSuccess} />
                                
                                    </>
                                ))}

                                {/* image -- setelah di ttd */}
                                {signedInitials.map((sig) => {
                                    if (!sig || !sig.id_item || sig.show !== true) return null;

                                    const isCompleted = sig.status === "Completed";

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
                                            {isCompleted && sig.sign_base64 ? (
                                                <img
                                                    src={sig.sign_base64}
                                                    alt="Initial"
                                                    style={{ width: "100%", height: "100%" }}
                                                />
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
                                                cursor: sig.editable ? "pointer" : "default",
                                                zIndex: isCompleted? 1 : 2
                                            }}
                                            onClick={() => {
                                                if (sig.editable) {
                                                    handleInitialClick(sig.id_item);
                                                }
                                            }}
                                        >
                                            {isCompleted && sig.sign_base64 ? (
                                                <img
                                                    src={sig.sign_base64}
                                                    alt="Initial"
                                                    style={{ width: "100%", height: "100%" }}
                                                />
                                            ) : (
                                                <FaFont style={{ width: "25%", height: "25%" }} />
                                            )}
                                        </Rnd>
                                    );
                                })}

                                <InitialModal
                                    showInitialModal={showInitialModal}
                                    setShowInitialModal={setShowInitialModal}
                                    onSuccess={handleSignatureSuccess}
                                    selectedIdItem={selectedIdItem}
                                    selectedSigner={selectedSigner}
                                />
                                
                                {dateField.map((sig, index) => (
                                <Rnd
                                    key={sig.id}
                                    position={{ x: sig.x_axis, y: sig.y_axis }}
                                    size={{ width: sig.height, height: sig.width }}
                                    enableResizing={sig.enableResizing}    
                                    disableDragging={sig.disableDragging} 
                                    style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "rgba(25, 230, 25, 0.5)",
                                    }}
                                >
                                    <FaSignature style={{ width: "25%", height: "25%" }} />
                                </Rnd>
                                ))}
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