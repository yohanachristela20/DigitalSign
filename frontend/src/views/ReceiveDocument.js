import React, { useState, useEffect, useRef } from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import { FaCalendar, FaFont, FaSignature } from 'react-icons/fa';

import PDFCanvas from "components/Canvas/canvas.js";
import { Rnd } from 'react-rnd';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { Container, Spinner, Alert, Row, Col, Card, Navbar, Nav, Dropdown, Button, Modal, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";

import SignatureModal from 'components/ModalForm/SignatureModal.js';
import InitialModal from "components/ModalForm/InitialModal.js";
import "../assets/scss/lbd/_receivedoc.scss";
import UserNavbar from "components/Navbars/UserNavbar.js";
import UbahPassword from "components/ModalForm/UbahPassword.js";
import "../assets/scss/lbd/_usernavbar.scss";
import { isDate } from "moment";


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
    const [initial_status, setInitialStatus] = useState([]);
    const [nama, setNama] = useState("");

    const [showSignatureModal, setShowSignatureModal] = React.useState(false);
    const [showInitialModal, setShowInitialModal] = useState(false);
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
    const [current, setCurrentDate] = useState(new Date());

    const date = new Date();
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] 
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const currentDate = `${day} ${month} ${year}`;

    console.log("Current date:", currentDate);

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

    const handleSignatureClick = (id_item) => {
        const signer = signatures.find(i => i.id_item === id_item);
        if (signer) {
            setSelectedIdItem(id_item);
            setSelectedSigner(signer);
            setShowSignatureModal(true);

            console.log("ID Item clicked:", id_item);
        }
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
            const submittedMapping = {}

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

                    const is_submitted = item.is_submitted;
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
                        id_item,
                        status, 
                        urutan,
                        is_submitted,
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
            setSubmittedMap(submittedMapping);
            
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

    const updateSubmitted = async(id_dokumen, id_signers) => {
        console.log("Id Dokumen:", id_dokumen);
        console.log("Id Signers:", id_signers);

        try {
            const response = await axios.patch(`http://localhost:5000/update-submitted/${id_dokumen}/${id_signers}`, {
                is_submitted: true,
            });

            console.log("Document signed submitted:", response);
            toast.success("Document signed successfully.", {
                position: "top-right", 
                autoClose: 5000, 
                hideProgressBar: true,
            });

            window.location.reload();
        } catch (error) {
            console.log("Failed to save signed document:", error.message);
            toast.error("Failed to save signed document.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });
        }
    }

    useEffect(() => {
    const fetchAllFields = async () => {
        if (!id_dokumen || !allSigners || allSigners.length === 0 || Object.keys(urutanMap).length === 0) return;

        try {
        const signerArray = Array.isArray(allSigners) ? allSigners : [allSigners];
        const signerParam = signerArray.join(",");
        const initialsRes = await axios.get(`http://localhost:5000/initials/${id_dokumen}/${signerParam}`);
        const initialsData = initialsRes.data;

        const allFields = [];

        for (let i = 0; i < signerArray.length; i++) {
            const signer = signerArray[i];
            const currentUrutan = Number(urutanMap[signer]);
            const currentSubmitted = submittedMap[signer];

            const axisRes = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`);
            const signerFields = axisRes.data.filter(field => field.ItemField?.jenis_item);

            const signerInitials = initialsData.filter(init => init.id_signers === signer);

            const prevSigner = Object.keys(urutanMap).find(
            key => Number(urutanMap[key]) === currentUrutan - 1
            );

            const prevStatusList = allFields
            .filter(field => field.id_signers === prevSigner && field.id_dokumen === id_dokumen)
            .map(field => field.status);

            const prevSubmittedList = allFields
            .filter(field => field.id_signers === prevSigner && field.id_dokumen === id_dokumen)
            .map(field => field.is_submitted);

            const allCompleted =
            prevStatusList.length > 0 &&
            prevStatusList.every(status => status === "Completed") &&
            prevSubmittedList.every(is_submitted => is_submitted !== false);

            setCompleteSubmitted(allCompleted);

            let show = false;
            let editable = false;
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
                prevSigner: prevSigner,
                nextSignCompleted: nextSignCompleted,
                jenis_item: field.ItemField?.jenis_item || "",
            };
            });

            allFields.push(...mappedFields);
        }

        setSignedInitials(allFields); 
        setSignedSignatures(allFields);
        console.log("All Mapped Fields:", allFields);

        const nextSignCompleted = allFields
            .filter(field => field.prevSigner === id_signers)
            .map(field => field.is_submitted);
        setNextSignCompleted(nextSignCompleted);

        const filteredFields = allFields.filter(field => field.id_signers === id_signers);
        setInitial(filteredFields);
        setSignature(filteredFields);

        const statusList = filteredFields.map(field => field.status);
        setInitialStatus(statusList);

        } catch (error) {
        console.error("Failed to fetch initials or axis-field:", error.message);
        }
    };

    fetchAllFields();
    }, [id_dokumen, id_signers, urutanMap, allSigners]);


    useEffect(() => {
        console.log("All sign STATUS:", signStatus);
    }, [signStatus]);

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
                        className="mr-3 mt-2"
                        >
                        <span className="fs-6">Actions</span>
                        </Dropdown.Toggle>
                        <Dropdown.Menu aria-labelledby="navbarDropdownMenuLink" style={{ width: '200px' }}>
                        <Dropdown.Item
                            onClick={(e) => e.preventDefault()}
                        >
                        Decline
                        </Dropdown.Item>
                        <div className="divider"></div>
                        <Dropdown.Item
                            href="#"
                            onClick={(e) => {
                            e.preventDefault();
                            
                            setShowUbahPassword(true); 
                            }}
                        >
                            Document Info
                        </Dropdown.Item>
                        <div className="divider"></div>
                        
                        <Dropdown.Item
                            href="#"
                            onClick={(e) => {
                            e.preventDefault();
                            setShowModal(true); 
                            }}
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
                        // disabled={!initial_status.every(status => status === "Completed")}
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
                            {!loading && !errorMsg && pdfUrl && (
                            <>
                                <div className="vertical-center">
                                    <PDFCanvas pdfUrl={pdfUrl} />
                                    
                                    {/* image -- setelah di ttd */}
                                    {signedInitials.map((sig) => {
                                        if (!sig || !sig.id_item || sig.show !== true) return null;

                                        const isCompleted = sig.status === "Completed";
                                        const completedNext = sig.is_submitted === true;

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
                                                onClick={() => {
                                                    sig.editable && !isSubmitted && isInitialpad ? (handleInitialClick(sig.id_item)) : sig.editable && !isSubmitted && isSignpad ? (handleSignatureClick(sig.id_item)) : <></>
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
                                                            isInitialpad ? <FaFont style={{ width: "25%", height: "25%" }} /> : isSignpad ? <FaSignature style={{ width: "25%", height: "25%" }} /> : isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }} /> : <></>
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
                                                        isInitialpad ? <FaFont style={{ width: "25%", height: "25%" }} /> : isSignpad ? <FaSignature style={{ width: "25%", height: "25%" }} /> : isDatefield ? <FaCalendar style={{ width: "25%", height: "25%" }} /> : <></>
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
                                    
                                    {/* {dateField.map((sig) => {
                                        if (!sig || !sig.id_item || sig.show !== true) return null;

                                        return (
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
                                        );
                                    })} */}
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