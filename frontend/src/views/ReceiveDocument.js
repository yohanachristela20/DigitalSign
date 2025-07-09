import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaFont, FaSignature } from 'react-icons/fa';

import PDFCanvas from "components/Canvas/canvas.js";
import { Rnd } from 'react-rnd';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { Container, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";

import SignatureModal from 'components/ModalForm/SignatureModal.js';
import InitialModal from "components/ModalForm/InitialModal.js";
import "../assets/scss/lbd/_receivedoc.scss";
import UserNavbar from "components/Navbars/UserNavbar.js";
// import { converBase64ToImage } from "convert-base64-to-image";
// import fs from "fs";


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
    // const [nama, setNama] = useState("");

    const [showSignatureModal, setShowSignatureModal] = React.useState(false);
    const [showInitialModal, setShowInitialModal] = React.useState(false);
    
    // const signatureFields = [];
    // const initialFields = [];
    // const dateFields = [];

    const [initials, setInitials] = useState([]);
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

    const handleInitialClick = () => {
        setShowInitialModal(true);
    };

    const handleSignatureSuccess = () => {
    toast.success("Document signed successfully.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
    };

    useEffect(() => {
        const fetchInitials = async() => {
            if (!id_dokumen || !id_signers) return;
            try {
                const res = await axios.get(`http://localhost:5000/initials/${id_dokumen}/${id_signers}`);
                console.log("Initialsign:", res.data[0].sign_base64);
                console.log("Initialsign base64:", res.data[0].sign_base64.slice(0, 100)); 
                setNameSigner(res.data[0].sign_base64);
            } catch (error) {
                console.error("Failed to fetch initialsign", error.message);
            }
        };

        fetchInitials(); 
    }, [id_dokumen, id_signers]);

    // console.log("Name Signer:", nameSigner);


     useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;
                setIdSigner(id_signers);

                // setIdSigner(id_signers);
                // console.log("Id Signer:", idSigner);

                if (!id_dokumen) {
                    throw new Error("Document not found.");
                }

                const fileRes = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`);
                if (!fileRes.ok) {
                    throw new Error("Failed to get PDF Document.");
                }

                const blob = await fileRes.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);

                const field = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${id_signers}`);

                const localSignatureFields = [];
                const localInitialFields = [];
                const localDateFields = [];

                field.data
                .filter(item => item.ItemField)
                .forEach((item, idx) => {
                    const {x_axis, y_axis, width, height, jenis_item} = item.ItemField;
                    // const {nama} = item.Signer;

                    const fieldObj = {
                        id: `field-${idx}`, 
                        x_axis: x_axis, 
                        y_axis: y_axis, 
                        width, 
                        height, 
                        jenis_item, 
                        pageScale: 1,
                        enableResizing: false,
                        disableDragging: true,
                    };

                    if (jenis_item === "Signpad") {
                        localSignatureFields.push(fieldObj);
                    } else if (jenis_item === "Initialpad") {
                        localInitialFields.push(fieldObj);
                    } else if (jenis_item === "Date") {
                        localDateFields.push(fieldObj);
                    }
                });

                // setNama(nama);
                // console.log("Namaa:", nama);

                setSignatures(localSignatureFields);
                setInitials(localInitialFields);
                setDateField(localDateFields);
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


    return (
        <>
            <div className="bg-receivedoc">
            <UserNavbar />
            <div className="center-object">
                <div className="vertical-center">
                    <Container fluid className="mt-3 pl-0">
                    {/* <h5>Preview Document</h5> */}
                    {loading && <Spinner animation="border" variant="primary" />}
                    {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                    {!loading && !errorMsg && pdfUrl && (
                    <>
                        <PDFCanvas pdfUrl={pdfUrl} 
                        />
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

                        {/* {initials.map((sig, index) => (
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
                                onClick={handleInitialClick}
                            >
                                <FaFont style={{ width: "25%", height: "25%" }} />
                            </Rnd>
                            <InitialModal showInitialModal={showInitialModal} setShowInitialModal={setShowInitialModal} onSuccess={handleSignatureSuccess} />
                            </>
                        ))} */}

                        {/* {initials.map((sig, index) => (
                            <React.Fragment key={index}>
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
                                backgroundColor: "transparent",
                                }}
                                onClick={handleInitialClick}
                            >
                                {sig.sign_base64 && sig.sign_base64.startsWith("data:image") ? (
                                    <img 
                                    src={sig.sign_base64.trim()}
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "/fallback.png";
                                    }}
                                    alt="Initial"
                                    style={{ width: "100%", height: "100%", objectFit: "contain", pointerEvents: "none" }}
                                    />
                                ) : (
                                    <span style={{ fontSize: "12px", color: "#ccc" }}>No image</span>
                                )}
                            </Rnd>
                            <InitialModal showInitialModal={showInitialModal} setShowInitialModal={setShowInitialModal} onSuccess={handleSignatureSuccess} />
                            </React.Fragment>
                        ))} */}

                        
                        {initials.map((sig, index) => (
                            console.log("Sign base64:", nameSigner),
                            <React.Fragment key={index}>
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
                                backgroundColor: "transparent",
                                }}
                                onClick={handleInitialClick}
                            >
                                <img
                                    src={nameSigner} 
                                    
                                    alt="Initial"
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
                            </React.Fragment>
                        ))}

                        <InitialModal
                            showInitialModal={showInitialModal}
                            setShowInitialModal={setShowInitialModal}
                            onSuccess={handleSignatureSuccess}
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
                    </>
                    )}
                    </Container>
                </div>
            </div>
            </div>
        </>
    );
}

export default ReceiveDocument;