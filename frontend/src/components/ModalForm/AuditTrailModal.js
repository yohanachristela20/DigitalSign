import { Row, Col, Modal, Form } from "react-bootstrap";
import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";
import { FaCheckCircle, FaCircle, FaEye, FaSignature, FaUpload } from "react-icons/fa";
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
    const [delegated_signers, setDelegatedSigners] = useState("");
    const [finalSignerId, setFinalSignerId] = useState("");
    const [current_signer, setCurrentSigner] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://10.70.10.20:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                const id_signers = res.data.id_signers;
                const delegated_signers = res.data.delegated_signers;     
                const currentSigner = res.data.currentSigner; 
                const finalSignerId = delegated_signers || id_signers;

                setFinalSignerId(finalSignerId);
                setIdDokumen(id_dokumen);
                setIdSigner(id_signers);
                setDelegatedSigners(delegated_signers);
                setCurrentSigner(currentSigner);

                const idKaryawan = res.data.id_karyawan;
                const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
                const karyawanArray = Array.isArray(idKaryawan) ? idKaryawan : [idKaryawan];
                const signerData = [];

                for (const signer of signerArray) {
                    const response = await axios.get(`http://10.70.10.20:5000/audit-info/${id_dokumen}/${signer}`);
                    const data = response.data;

                    if (data.length > 0) {
                        data.forEach(d => {
                            signerData.push({
                                id_signers: d.id_signers,
                                delegated_signers: d.delegated_signers,
                                nama: d.Signerr?.nama,
                                organisasi: d.Signerr?.organisasi,
                                doc_name: d.DocName?.nama_dokumen,
                                email_signer: d.Signerr?.Penerima?.email,
                                createdAt: d.createdAt,
                                status: d.status,
                                id_dokumen: d.id_dokumen,
                                tgl_tt: d.tgl_tt,
                                sign_permission: d.sign_permission,
                                is_submitted: d.is_submitted,
                                accessed_at: d.LinkAccess?.accessed_at,
                                real_email: d.LinkAccess?.real_email
                            });
                        });
                    }
                }

                for (const sender of karyawanArray) {
                    const resSender = await axios.get(`http://10.70.10.20:5000/email-sender/${sender}`);
                        const resSenderData = resSender.data;
                        if (resSenderData.length > 0 && resSenderData[0]?.Pemohon && resSenderData[0]?.Pemohon?.Penerima) {
                            const senderInfo = {
                                id_sender: resSenderData[0].id_karyawan,
                                nama: resSenderData[0].Pemohon.nama,
                                organisasi: resSenderData[0].Pemohon.organisasi,
                                email_sender: resSenderData[0].Pemohon.Penerima.email,
                            };
                            setSenderData(senderInfo);
                        }
                }

                const uniqueSignerData = signerData.filter(
                    (v, i, a) =>
                        a.findIndex(t =>
                            t.email_signer === v.email_signer && t.real_email === v.real_email
                        ) === i
                );
                setSignerData(uniqueSignerData)

            } catch (error) {
                console.error("Failed to load PDF:", error.message);
            } 
        };

        fetchData();
    }, [token]);

    
    const completedSigners = signerData.filter(
        s =>
            (s.status === "Completed" && s.is_submitted === true) ||
            (s.delegated_signers || s.delegated_signers === selectedSigner)
    );    
    

    useEffect(() => {
        if (!selectedSigner || signerData.length === 0) return;
        const found = signerData.find(s => s.id_signers === selectedSigner || s.delegated_signers === selectedSigner);
        if (found) {
            setNama(found.nama);
            setSignerID(found.id_signers); 
            setEmail(found.email_signer);
            setAccessedAt(found.accessed_at);
            setRealEmail(found.real_email);
            
        }
    }, [selectedSigner, signerData]);


    const handleSubmit = async(e, signerID) => {
        e.preventDefault();
        await updateStatus(id_dokumen, signerID);
        // window.location.reload();
    }

    const updateStatus = async(id_dokumen, signerID) => {
        try {
            const response = await axios.patch(`http://10.70.10.20:5000/update-status/${id_dokumen}/${signerID}`, {
                status: "Decline",
            }); 

            sendEmailDecline(id_dokumen, signerID, reason, token);
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
        try {
            const responseDecline = await axios.post('http://10.70.10.20:5000/send-decline-email', {
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
    };

    const groupedSigners = signerData.reduce((acc, signer) => {
        const key = signer.nama;
        if (!acc[key]) {
            acc[key] = {
                ...signer,
                emails: []
            };
        }

        if (signer.real_email && !acc[key].emails.includes(signer.real_email)) {
            acc[key].emails.push(signer.real_email);
        }
        return acc;
    }, {});

    const groupedSignersArray = Object.values(groupedSigners);

    return (
        <>
            {signerData.length > 0 && (
            <Modal
                show={showAuditTrailModal}
                onHide={handleCloseModal}
            >
                <Modal.Header closeButton>
                <Modal.Title>Audit Trail</Modal.Title>
                </Modal.Header>

                <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={(e) => handleSubmit(e, signerID)}>

                    <Row className="mt-3">
                    <Col md="6"><label>Document name</label></Col>
                    <Col md="6" style={{whiteSpace: 'pre-wrap', overflowWrap: 'break-word'}}><p>{signerData[0]?.doc_name}</p></Col>
                    </Row>
                    <Row className="mt-2">
                    <Col md="6"><label>Document ID</label></Col>
                    <Col md="6">{signerData[0]?.id_dokumen}</Col>
                    </Row>
                    <Row className="mt-2">
                    <Col md="6"><label>Status</label></Col>
                    <Col md="6">
                        {signerData[0]?.status === "Pending" && (
                        <FaCircle style={{ color: "orange" }} className="mr-2" />
                        )}
                        {signerData[0]?.status === "Completed" && (
                        <FaCircle style={{ color: "green" }} className="mr-2" />
                        )}
                        {signerData[0]?.status === "Decline" && (
                        <FaCircle style={{ color: "red" }} className="mr-2" />
                        )}
                        {signerData[0]?.status}
                    </Col>
                    </Row>

                    <hr />

                    {groupedSignersArray.length > 0 && 
                    groupedSignersArray 
                    .sort((a,b) => new Date(b.tgl_tt) - new Date(a.tgl_tt))
                    .map((s, idx) => (
                        <Row key={`viewed-${s.id_signers}-${idx}`} className="mt-2">
                            <Col md="6">
                            <FaEye className="mr-3 mt-1" style={{ width: 40, height: 40 }} />
                            {s.accessed_at ? moment(s.accessed_at).format("DD-MM-YYYY HH:mm:ss") : "-"}
                            </Col>
                            <Col md="6">
                            <p className="mb-1 mt-2">Viewed by: {s.nama}</p>
                            {s.emails.map((email, i) => (
                                <p key={i} className="mb-1 multiline-ellipsis">
                                    {email}
                                </p>
                            ))}
                            </Col>
                        </Row>
                    ))
                    }

                    {groupedSignersArray.length > 0 && 
                        groupedSignersArray
                        .sort((a, b) => new Date(b.tgl_tt) - new Date(a.tgl_tt))
                        .map((s, idx) => (
                            <Row key={`sent-${s.id_signers}-${idx}`} className="mt-2">
                                <Col md="6">
                                <FaUpload className="mr-3 mt-1" style={{ width: 40, height: 40 }} />
                                {s.createdAt ? moment(s.createdAt).format("DD-MM-YYYY HH:mm:ss") : "-"}
                                </Col>
                                <Col md="6">
                                <p className="mb-1 mt-2">
                                    Sent for signature to {s.nama} from {senderData.nama}
                                </p>
                                <p>{senderData.email_sender}</p>
                                </Col>
                            </Row>
                        ))
                    }

                    <Row className="mt-2">
                    <Col md="6">
                        <FaCheckCircle className="mr-3 mt-1" style={{ width: 40, height: 40 }} />
                        {signerData[0]?.createdAt
                        ? moment(signerData[0].createdAt).format("DD-MM-YYYY HH:mm:ss")
                        : "-"}
                    </Col>
                    <Col md="6">
                        <p className="mb-1 mt-2">Created by: {senderData.nama}</p>
                        <p>{senderData.email_sender}</p>
                    </Col>
                    </Row>

                    {groupedSignersArray.length > 0 &&
                    groupedSignersArray
                    .sort((a,b) => new Date(b.tgl_tt) - new Date(a.tgl_tt))
                    .filter((s) => s.status === "Completed")
                    .map((s, idx) => (
                        <Row key={`signed-${s.id_signers}-${idx}`} className="mt-2" hidden={s.sign_permission === "Receive a copy"}>
                        <Col md="6">
                            <FaSignature className="mr-3 mt-1" style={{ width: 40, height: 40 }} />
                            {s.tgl_tt ? moment(s.tgl_tt).format("DD-MM-YYYY HH:mm:ss") : "-"}
                        </Col>
                        <Col md="6">
                            <p className="mb-1 mt-2">Signed by: {s.nama}</p>
                            {s.emails.map((email, i) => (
                                <p key={i} className="mb-1 multiline-ellipsis">
                                    {email}
                                </p>
                            ))}
                        </Col>
                        </Row>
                    ))}

                </Form>
                </Modal.Body>
            </Modal>
            )}
        </>
    );

}

export default AuditTrailModal;