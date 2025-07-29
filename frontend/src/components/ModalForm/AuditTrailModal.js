import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";
import html2canvas from "html2canvas";
import { SketchPicker } from "react-color";
import { FaCheckCircle, FaCircle, FaCircleNotch, FaEye, FaSignature, FaTimesCircle, FaUpload } from "react-icons/fa";
import moment from "moment";

const AuditTrailModal = ({showAuditTrailModal, setShowAuditTrailModal, selectedSigner, selectedDocument, selectedKaryawan, signerInfo}) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [signerData, setSignerData] = useState([]);
    const [senderData, setSenderData] = useState([]);

    const [selectedValues, setSelectedValues] = useState({});
    const [nama, setNama] = useState("");
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [email, setEmail] = useState("");
    const [signerID, setSignerID] = useState("");
    const [reason, setReason] = useState("");
    const [id_karyawan, setIdKaryawan] = useState("");

    const [statusList, setStatusList] = useState([]);
    const [submittedList, setSubmittedList] = useState([]);

    const [real_email, setRealEmail] = useState("");
    const [accessed_at, setAccessedAt] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        console.log("AuditTrailModal receive id_signers:", selectedSigner);
        console.log("AuditTrailModal show AuditTrailModal:", showAuditTrailModal);
        console.log("AuditTrailModal receive id_dokumen:", selectedDocument);
        console.log("AuditTrailModal receive id_karyawan:", selectedKaryawan);
        console.log("AuditTrailModal signerInfo:", signerInfo);
    }, [selectedSigner, showAuditTrailModal, selectedDocument, selectedKaryawan, signerInfo]);


    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;
                setIdSigner(id_signers);
                console.log("ID SIGNERS:", id_signers); 

                const idKaryawan = res.data.id_karyawan;
                const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
                const karyawanArray = Array.isArray(idKaryawan) ? idKaryawan : [idKaryawan];

                console.log("signerArray:", signerArray);

                const signerData = [];

                for (const signer of signerArray) {
                    for (const sender of karyawanArray) {
                        const response = await axios.get(`http://localhost:5000/doc-info/${id_dokumen}/${signer}`);
                        const data = response.data;

                        if (data.length > 0 && data[0]?.Signerr && data[0]?.DocName && data[0]?.LinkAccess) {
                            const signerInfo = {
                                id_signers: data[0].id_signers,
                                nama: data[0].Signerr.nama,
                                organisasi: data[0].Signerr.organisasi,
                                doc_name: data[0].DocName.nama_dokumen,
                                email_signer: data[0].Signerr.Penerima?.email,
                                createdAt: data[0].createdAt,
                                status: data[0].status,
                                id_dokumen: data[0].id_dokumen,
                                tgl_tt: data[0].tgl_tt,
                                is_submitted: data[0].is_submitted,
                                accessed_at: data[0].LinkAccess.accessed_at,
                                real_email: data[0].LinkAccess.real_email,
                            };
                            signerData.push(signerInfo);
                        }

                        const filteredSigner = signerData.filter(s => s.id_signers === signer);
                        console.log("Filtered Signer Data:", filteredSigner);

                        const status_list = filteredSigner.map(s => s.status);
                        setStatusList(status_list);

                        // console.log("Status List:", status_list);

                        const resSender = await axios.get(`http://localhost:5000/email-sender/${sender}`);
                        const resSenderData = resSender.data;

                        if (resSenderData.length > 0 && resSenderData[0]?.Signerr) {
                            const senderInfo = {
                                id_sender: resSenderData[0].id_karyawan,
                                nama: resSenderData[0].Signerr.nama,
                                organisasi: resSenderData[0].Signerr.organisasi,
                                email_sender: resSenderData[0].Signerr.Penerima?.email,
                            };
                            setSenderData(senderInfo);
                        }
                    }
                }

                setSignerData(signerData);
                console.log("AUDIT TRAIL:", signerData);
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
            } 
        };

        fetchData();
    }, [token]);

    // console.log("DOC NAME:", signerData.doc_name);

    const completedSigners = signerData.filter(s => s.status === "Completed" && s.is_submitted === true);



    useEffect(() => {
        if (!selectedSigner || signerData.length === 0) return;
        const found = signerData.find(s => s.id_signers === selectedSigner);
        // console.log("FOUND SIGNER:", found);
        if (found) {
            setNama(found.nama);
            setSignerID(found.id_signers); 
            setEmail(found.email_signer);
            setAccessedAt(found.accessed_at);
            setRealEmail(found.real_email);
            
        }
    }, [id_signers, selectedSigner, signerData]);


    const handleSubmit = async(e, signerID) => {
        e.preventDefault();
        await updateStatus(id_dokumen, signerID);
        // window.location.reload();
    }

    const updateStatus = async(id_dokumen, signerID) => {
        console.log("Data update status:", id_dokumen, signerID);

        try {
            const response = await axios.patch(`http://localhost:5000/update-status/${id_dokumen}/${signerID}`, {
                status: "Decline",
            }); 

            sendEmailDecline(id_dokumen, signerID, reason, token);

            console.log("Signer status updated:", response.data);
            toast.success("Decline document successful.", {
                position: "top-right", 
                autoClose: 5000,
                hideProgressBar: true, 
            }); 
            setShowAuditTrailModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Failed to update status document.", error.message);
        }
    };

    const sendEmailDecline = async(id_dokumen, signerID, reason) => {
        console.log("sendEmailDecline: ", id_dokumen, signerID, reason, token);

        try {
            const responseDecline = await axios.post('http://localhost:5000/send-decline-email', {
                id_dokumen, 
                signerID, 
                reason: [reason],
                token
            });

            toast.success("Decline email sent!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });

            console.log("Decline sign document successfully.", responseDecline);
        } catch (error) {
            console.error("Failed to send decline email:", error.message);
            toast.error("Failed to send decline email.");
        }
    }

    const handleCloseModal = () => {
        setShowAuditTrailModal(false);
        setReason("");
        setSelectedValue("");
        setSelectedValues({});
    }

    return (
       <>
        {signerData.length > 0 && signerData.map((selectedSigner) => (
            <Modal
                key={selectedSigner.id_signers}
                show={showAuditTrailModal}
                onHide={handleCloseModal}
            >
            <Modal.Header closeButton>
                <Modal.Title>Audit Trail</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={(e) => handleSubmit(e, signerID)}>
                    <Row className="mt-3">
                        <Col md="6">
                            <Form.Group>
                                <label>Document name</label>
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            {selectedSigner.doc_name}
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md="6">
                            <Form.Group>
                                <label>Document ID</label>
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            {selectedSigner.id_dokumen}
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md="6">
                            <Form.Group>
                                <label>Status</label>
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            {
                                selectedSigner.status ? (
                                    selectedSigner.status === "Pending" ? <FaCircle style={{ color: 'orange' }} className="mr-2"/>  : selectedSigner.status === "Completed" ? <FaCircle style={{ color: 'green' }} className="mr-2"/> : <FaCircle style={{ color: 'red' }} className="mr-2"/>   
                                ) :  null
                            }
                            {selectedSigner.status}
                        </Col>
                    </Row>
                    <hr />
                    {/* <Row className="mt-2">
                        <Col md="6">
                            <FaEye className="mr-3" style={{width: '40', height:'40'}}/> 
                        </Col>
                        <Col md="6">
                            <p className="mb-1">Viewed by: {nama}</p>
                            <p>{email}</p>
                        </Col>
                    </Row> */}
                    <Row className="mt-2">
                            {completedSigners.length > 0 ? (
                                [...completedSigners]
                                .sort((a, b) => new Date(b.tgl_tt) - new Date(a.tgl_tt))
                                .map((signer, idx, arr) => (
                                    <>
                                        <Col md="6">
                                            <div key={signer.id_signers}>
                                                <FaEye className="mr-3" style={{width: '40', height:'40'}} /> {moment(signer.accessed_at).format('DD-MM-YYYY HH:mm:ss')}
                                                {/* {idx !== arr.length - 1 && <hr />} */}
                                            </div>
                                        </Col>
                                        <Col md="6">
                                            <div key={signer.id_signers}> 
                                                <p className="mb-1">Viewed by: {signer.nama}</p>
                                                <p className="mb-1">{signer.email}</p>
                                                <p>{signer.real_email}</p>
                                                {/* {idx !== arr.length - 1 && <hr />} */}
                                            </div>
                                        </Col>
                                    </>
                                )) 
                                ) : ( 
                                    <>
                                        <Col md="6">
                                            <FaEye className="mr-3" style={{width: '40', height:'40'}} /> {moment(accessed_at).format('DD-MM-YYYY HH:mm:ss')}
                                        </Col>
                                        <Col md="6">
                                            <p className="mb-1">Viewed by: {nama}</p>
                                            <p className="mb-1">{email}</p>
                                            <p>{real_email}</p>
                                            
                                        </Col>
                                    </>
                            )}
                    </Row>
                    <Row className="mt-2">
                        <Col md="6">
                            <FaUpload className="mr-3" style={{width: '40', height:'40'}}/> {moment(selectedSigner.createdAt).format('DD-MM-YYYY HH:mm:ss')}
                        </Col>
                        <Col md="6">
                            <p className="mb-1">Sent for signature to {nama} from {senderData.nama}</p>
                            <p>{senderData.email_sender}</p>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md="6">
                            <FaCheckCircle className="mr-3" style={{width: '40', height:'40'}}/> {moment(selectedSigner.createdAt).format('DD-MM-YYYY HH:mm:ss')}
                        </Col>
                        <Col md="6">
                            <p className="mb-1">Created by: {senderData.nama}</p>
                            <p>{senderData.email_sender}</p>
                        </Col>
                    </Row>
                    <Row className="mt-2" hidden={!statusList.every(status => status === "Completed")}>
                            {completedSigners.length > 0 ? (
                                [...completedSigners]
                                .sort((a, b) => new Date(b.tgl_tt) - new Date(a.tgl_tt))
                                .map((signer, idx, arr) => (
                                    <>
                                        <Col md="6">
                                            <div key={signer.id_signers}>
                                                <FaSignature className="mr-3" style={{width: '40', height:'40'}} /> {moment(signer.tgl_tt).format('DD-MM-YYYY HH:mm:ss')}
                                                {/* {idx !== arr.length - 1 && <hr />} */}
                                            </div>
                                        </Col>
                                        <Col md="6">
                                            <div key={signer.id_signers}> 
                                                <p className="mb-1">Signed by: {signer.nama}</p>
                                                <p className="mb-1">{signer.email_signer}</p>
                                                <p>{signer.real_email}</p>
                                                {/* {idx !== arr.length - 1 && <hr />} */}
                                            </div>
                                        </Col>
                                    </>
                                )) 
                                ) : ( 
                                    <>
                                        <Col md="6">
                                            <FaSignature className="mr-3" style={{width: '40', height:'40'}} /> {moment(selectedSigner.tgl_tt).format('DD-MM-YYYY HH:mm:ss')}
                                        </Col>
                                        <Col md="6">
                                            <p className="mb-1">Signed by: {nama}</p>
                                            <p>{email}</p>
                                            <p>{real_email}</p>
                                        </Col>
                                    </>
                            )}
                    </Row>
                </Form>

            </Modal.Body>
            </Modal>
        ))}
       </>
    )
}

export default AuditTrailModal;