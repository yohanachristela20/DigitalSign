import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";
import html2canvas from "html2canvas";
import { SketchPicker } from "react-color";

const DocInfoModal = ({showDocInfoModal, setShowDocInfoModal, selectedSigner, selectedDocument, selectedKaryawan, signerInfo}) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [signerData, setSignerData] = useState([]);
    const [senderData, setSenderData] = useState([]);

    const [selectedValues, setSelectedValues] = useState({});
    const [nama, setNama] = useState("");
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [signerID, setSignerID] = useState("");
    const [reason, setReason] = useState("");
    const [id_karyawan, setIdKaryawan] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    // console.log("TOKEN FROM DOCINFO MODAL:", token);

    useEffect(() => {
        console.log("DocInfoModal receive id_signers:", selectedSigner);
        console.log("DocInfoModal show DocInfoModal:", showDocInfoModal);
        console.log("DocInfoModal receive id_dokumen:", selectedDocument);
        console.log("DocInfoModal receive id_karyawan:", selectedKaryawan);
        console.log("DocInfoModal signerInfo:", signerInfo);
    }, [selectedSigner, showDocInfoModal, selectedDocument, selectedKaryawan, signerInfo]);


    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;
                setIdSigner(id_signers);
                const idKaryawan = res.data.id_karyawan;
                // console.log("ID KARYAWAN (SENDER): ", idKaryawan);
                setIdKaryawan(idKaryawan);

                const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
                const karyawanArray = Array.isArray(idKaryawan) ? idKaryawan : [idKaryawan];

                // console.log("karyawanArray DOC INFO:", karyawanArray);

                const signerData = [];

                for (const signer of signerArray) {
                    for (const sender of karyawanArray) {
                        const response = await axios.get(`http://localhost:5000/doc-info/${id_dokumen}/${signer}`);
                        // console.log("RESPONSE DOC INFO:", response);
                        const data = response.data;
                        // console.log("DATA DOC INFO:", data);

                        if (data.length > 0 && data[0]?.Signerr && data[0]?.DocName) {
                            const signerInfo = {
                                id_signers: data[0].id_signers,
                                nama: data[0].Signerr.nama,
                                organisasi: data[0].Signerr.organisasi,
                                doc_name: data[0].DocName.nama_dokumen,
                                email_signer: data[0].Signerr.Penerima?.email,
                                // id_sender: data[0].id_karyawan,
                                createdAt: data[0].createdAt,
                            };
                            // console.log("SIGNER INFO DOC INFO:", signerInfo);
                            signerData.push(signerInfo);
                        }

                        const resSender = await axios.get(`http://localhost:5000/email-sender/${sender}`);
                        // console.log("RESPONSE SENDER DOC INFO:", resSender);
                        const resSenderData = resSender.data;
                        // console.log("SENDER DATA DOC INFO:", resSenderData);

                        if (resSenderData.length > 0 && resSenderData[0]?.Pemohon && resSenderData[0]?.Pemohon?.Penerima) {
                            const senderInfo = {
                                id_sender: resSenderData[0].id_karyawan,
                                nama: resSenderData[0].Pemohon.nama,
                                organisasi: resSenderData[0].Pemohon.organisasi,
                                email_sender: resSenderData[0].Pemohon.Penerima.email,
                            };
                            // console.log("SENDER INFO DOC INFO:", senderInfo);
                            setSenderData(senderInfo);
                        }
                    }
                }

                setSignerData(signerData);
                // console.log("DOC INFOOOO:", signerData);
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
            } 
        };

        fetchData();
    }, [token]);

    // console.log("DOC NAME:", signerData.doc_name);


    useEffect(() => {
        if (!selectedSigner || signerData.length === 0) return;
        const found = signerData.find(s => s.id_signers === selectedSigner);
        // console.log("FOUND SIGNER:", found);
        if (found) {
            setNama(found.nama);
            setSignerID(found.id_signers)
        }
    }, [id_signers, selectedSigner, signerData]);


    const handleSubmit = async(e, signerID) => {
        e.preventDefault();
        await updateStatus(id_dokumen, signerID);
        // window.location.reload();
    }

    const updateStatus = async(id_dokumen, signerID) => {
        // console.log("Data update status:", id_dokumen, signerID);

        try {
            const response = await axios.patch(`http://localhost:5000/update-status/${id_dokumen}/${signerID}`, {
                status: "Decline",
            }); 

            sendEmailDecline(id_dokumen, signerID, reason, token);

            // console.log("Signer status updated:", response.data);
            toast.success("Decline document successful.", {
                position: "top-right", 
                autoClose: 5000,
                hideProgressBar: true, 
            }); 
            setShowDocInfoModal(false);
            window.location.reload();
        } catch (error) {
            console.error("Failed to update status document.", error.message);
        }
    };

    const sendEmailDecline = async(id_dokumen, signerID, reason) => {
        // console.log("sendEmailDecline: ", id_dokumen, signerID, reason, token);

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

            // console.log("Decline sign document successfully.", responseDecline);
        } catch (error) {
            console.error("Failed to send decline email:", error.message);
            toast.error("Failed to send decline email.");
        }
    }

    const handleCloseModal = () => {
        setShowDocInfoModal(false);
        setReason("");
        setSelectedValue("");
        setSelectedValues({});
    }

    return (
       <>
        {signerData.length > 0 && signerData.map((selectedSigner) => (
            <Modal
                key={selectedSigner.id_signers}
                show={showDocInfoModal}
                onHide={handleCloseModal}
            >
            <Modal.Header closeButton>
                <Modal.Title>Document Info</Modal.Title>
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
                                <label>Sender</label>
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            <p className="mb-1">{senderData.nama}</p>
                            <p>{senderData.email_sender}</p>
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md="6">
                            <Form.Group>
                                <label>Organization name</label>
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            {senderData.organisasi}
                        </Col>
                    </Row>
                    <Row className="mt-2">
                        <Col md="6">
                            <Form.Group>
                                <label>Sent on</label>
                            </Form.Group>
                        </Col>
                        <Col md="6">
                            {selectedSigner.createdAt ? new Date(selectedSigner.createdAt).toLocaleDateString() : "N/A"}
                        </Col>
                    </Row>

                    
                </Form>

            </Modal.Body>
            </Modal>
       ))}
       </>
    )
}

export default DocInfoModal;