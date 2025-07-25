import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";
import html2canvas from "html2canvas";
import { SketchPicker } from "react-color";

const DeclineModal = ({showDeclineModal, setShowDeclineModal, selectedSigner, selectedDocument}) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [signerData, setSignerData] = useState([]);

    const [selectedValues, setSelectedValues] = useState({});
    const [nama, setNama] = useState("");
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [signerID, setSignerID] = useState("");
    const [reason, setReason] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    // console.log("TOKEN FROM DECLINE MODAL:", token);

    useEffect(() => {
        // console.log("DeclineModal receive id_signers:", selectedSigner);
        // console.log("DeclineModal show DeclineModal:", showDeclineModal);
        // console.log("DeclineModal receive id_dokumen:", selectedDocument);
    }, [selectedSigner, showDeclineModal, selectedDocument]);


    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;
                setIdSigner(id_signers);

                const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];

                const allSigners = [];

                for (const signer of signerArray) {
                    const response = await axios.get(`http://localhost:5000/decline/${id_dokumen}/${signer}`);
                    const data = response.data;

                    if (data.length > 0 && data[0].Signerr) {
                        allSigners.push({
                            id_signers: data[0].id_signers,
                            nama: data[0].Signerr.nama,
                        });
                    }
                }

                // console.log("SIGNER DATA:", allSigners);
                setSignerData(allSigners);
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
            } 
        };

        fetchData();
    }, [token]);

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
            setShowDeclineModal(false);
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
        setShowDeclineModal(false);
        setReason("");
        setSelectedValue("");
        setSelectedValues({});
    }

    return (
        <>
           {signerData.length > 0 && signerData.map((selectedSigner) => (
            <Modal
                key={selectedSigner.id_signers}
                show={showDeclineModal}
                onHide={() => handleCloseModal(selectedSigner.id_signers)}
            >
            <Modal.Header closeButton>
                <Modal.Title>Decline</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={(e) => handleSubmit(e, signerID)}>
                    <Row className="mt-3 mb-2">
                        <Col md="12">
                            <Form.Group>
                            <label>{nama}, Please enter the reason to decline this document.</label>
                            <Form.Control
                                as="textarea"
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                rows={4}
                            ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                    <Col md="12">
                        <div className="d-flex flex-column">
                        <Button className="btn-fill w-100 mt-3" type="submit" variant="primary">
                            Submit
                        </Button>
                        </div>
                    </Col>
                    </Row>
                </Form>

            </Modal.Body>
            </Modal>
           ))}
        </>
    )
}

export default DeclineModal;