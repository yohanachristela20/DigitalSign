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

    const [signatures, setSignatures] = useState([]);
    const [dateField, setDateField] = useState([]);
    const [clickCount, setClickCount] = useState(0);
    const timeRef = useRef(null);

    const [signClicked, setSignClicked] = useState(false);
    const [initClicked, setInitClicked] = useState(false);
    const [nameSigner, setNameSigner] = useState("");
    
    
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
        setSelectedIdItem(id_item);
        setShowInitialModal(true);
    };
    
    const handleSignatureSuccess = () => {
        toast.success("Document signed successfully.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
        });
    };

    //LAST
    useEffect(() => {
    const fetchInitials = async () => {
        if (!id_dokumen || !id_signers || id_signers.length === 0) return;

        try {
            const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
            const signerParam = signerArray.join(",");

            const initialsRes = await axios.get(`http://localhost:5000/initials/${id_dokumen}/${signerParam}`);
            const initialsData = initialsRes.data;

            const axisFieldPromises = signerArray.map((signer) =>
                axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`)
            );
            const axisFieldResponses = await Promise.all(axisFieldPromises);

            const axisFieldData = axisFieldResponses.flatMap(res => res.data);

            const initialList = [];

            initialsData.forEach((initial, i) => {
            const match = axisFieldData.filter(field =>
                field.id_signers === initial.id_signers &&
                field.Signerr?.nama === initial.Signerr?.nama &&
                field.ItemField?.jenis_item === "Initialpad"
            );

                match.forEach((field, j) => {
                    const base64 = initial.sign_base64;
                    const formattedBase64 = base64?.startsWith("data:image")
                        ? base64
                        : base64 ? `data:image/png;base64,${base64}` : null;
                

                    initialList.push(
                        {
                        id_item: field.id_item || `unknown-${i}-${j}`,
                        id_signers: initial.id_signers,
                        sign_base64: formattedBase64,
                        status: initial.status,
                        nama: initial.Signerr?.nama || "-",
                        x_axis: field.ItemField?.x_axis || 0,
                        y_axis: field.ItemField?.y_axis || 0,
                        width: field.ItemField?.width || 50,
                        height: field.ItemField?.height || 50,
                        enableResizing: false,
                        disableDragging: true
                    });
                });
            });

            setSignedInitials(initialList);
            console.log("Initial list with id_item:", initialList);
            // console.log("Signbase:", initialList[1].sign_base64);

        } catch (error) {
            console.error("Failed to fetch initials or axis-field:", error.message);
        }
    };

    fetchInitials();
    }, [id_dokumen, id_signers]);

    // useEffect(() => {
    // const fetchInitials = async () => {
    //     if (!id_dokumen || !id_signers || id_signers.length === 0) return;

    //     try {
    //         const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
    //         const signerParam = signerArray.join(",");

    //         const initialsRes = await axios.get(`http://localhost:5000/initials/${id_dokumen}/${signerParam}`);
    //         const initialsData = initialsRes.data;

    //         const axisFieldResponses = await Promise.all(
    //             signerArray.map((signer) => 
    //                 axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`)
    //             )
    //         );
                
    //         // const axisFieldResponses = await Promise.all(axisFieldPromises);

    //         const axisFieldData = axisFieldResponses.flatMap(res => res.data);
    //         const initialList = [];

    //         signerArray.forEach((signer) => {
    //             const signerInitials = initialsData.filter(initial => initial.id_signers === signer);
    //         })

    //         setSignedInitials(initialList);
    //         console.log("Initial list with id_item:", initialList);
    //         // console.log("Signbase:", initialList[1].sign_base64);

    //     } catch (error) {
    //         console.error("Failed to fetch initials or axis-field:", error.message);
    //     }
    // };

    // fetchInitials();
    // }, [id_dokumen, id_signers]);

    useEffect(() => {
    const fetchData = async () => {
        if (!token) return;

        try {
            const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
            const id_dokumen = res.data.id_dokumen;
            const id_signers = res.data.id_signers;

            if (!id_dokumen || !id_signers) {
                throw new Error("Missing id_dokumen or id_signers from token.");
            }

            setIdDokumen(id_dokumen);
            setIdSigner(id_signers);

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

            for (const signer of signerArray) {
                const field = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`)
                field.data
                .filter(item => item.ItemField)
                .forEach((item, idx) => {
                    const { x_axis, y_axis, width, height, jenis_item, id_item } = item.ItemField;
                    const status = item.status || "Pending";

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
                        status
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
            

            console.log("SIGN STATUS:", signStatus);
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

                                {console.log("Initials:", initials)}

                                {signedInitials.map((sig, index) => {
                                    if (!sig || !sig.id_item) return null;
                                    
                                    if (sig.status == "Completed") {
                                        console.log("Sign base64:", sig.sign_base64);
                                        return (
                                        <Rnd
                                            key={sig.id_item || index}
                                            position={{ x: sig.x_axis, y: sig.y_axis }}
                                            size={{ width: sig.height, height: sig.width }}
                                            enableResizing={sig.enableResizing} 
                                            disableDragging={sig.disableDragging}  
                                            style={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "transparent",
                                            }}
                                            >
                                            <img
                                                src={sig.sign_base64} 
                                                alt="Initial"
                                                onLoad={() => console.log("Image loaded:", sig.sign_base64)}
                                                style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "contain",
                                                }}
                                                onError={(e) => {
                                                    console.error("Image error", e);
                                                    e.target.src = "/fallback.png"; 
                                                }}
                                            />
                                        </Rnd>
                                        ); 
                                    } 
                                    return null;
                                })}

                                {initials.map((sig, index) => {
                                if (!sig || !sig.id_item) return null;

                                if (sig.status !== "Completed") {
                                    return (
                                        <Rnd
                                        key={`${sig.id_signers}-${sig.id_item}`}
                                        position={{ x: sig.x_axis, y: sig.y_axis }}
                                        size={{ width: sig.height, height: sig.width }}
                                        enableResizing={sig.enableResizing} 
                                        disableDragging={sig.disableDragging}  
                                        style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: "rgba(25, 230, 25, 0.5)",
                                        cursor: "pointer"
                                        }}
                                        onClick={() => {
                                            handleInitialClick(sig.id_item);
                                            console.log("Id item clicked:", sig.id_item);
                                        }}
                                        >
                                        <FaFont style={{ width: "25%", height: "25%" }} />
                                    </Rnd>
                                    )
                                    
                                }
                                    return null;
                                })}

                                <InitialModal
                                    showInitialModal={showInitialModal}
                                    setShowInitialModal={setShowInitialModal}
                                    onSuccess={handleSignatureSuccess}
                                    selectedIdItem={selectedIdItem}
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