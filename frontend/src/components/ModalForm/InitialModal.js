import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";

const InitialModal = ({showInitialModal, setShowInitialModal, onSuccess}) => {
    const [initialName, setInitialName] = useState("");
    const [selectedValue, setSelectedValue] = useState('option1');
    const [nama, setNama] = useState([]);
    const [id_dokumen, setIdDokumen] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;

                console.log("ID Dokumen:", id_dokumen);
                console.log("ID Signers:", id_signers);

                // if (!id_dokumen) {
                //     throw new Error("Document not found.");
                // }

                // const fileRes = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`);
                // if (!fileRes.ok) {
                //     throw new Error("Failed to get PDF Document.");
                // }

                // const blob = await fileRes.blob();
                // const url = URL.createObjectURL(blob);
                // setPdfUrl(url);

                const field = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${id_signers}`);

                // const localSignatureFields = [];
                // const localInitialFields = [];
                // const localDateFields = [];
                // const nama = field.data.nama;

                const localNama = [];

                field.data
                .filter(item => item.Signer)
                .forEach((item, idx) => {
                    // const {x_axis, y_axis, width, height, jenis_item} = item.ItemField;
                    const {nama} = item.Signer;

                    // const fieldObj = {
                    //     id: `field-${idx}`, 
                    //     x_axis: x_axis, 
                    //     y_axis: y_axis, 
                    //     width, 
                    //     height, 
                    //     jenis_item, 
                    //     pageScale: 1,
                    //     enableResizing: false,
                    //     disableDragging: true,
                    // };

                    const namaSigner = {
                        nama
                    }
                    console.log("NamaSigner:", namaSigner);

                    // if (jenis_item === "Signpad") {
                    //     localSignatureFields.push(fieldObj);
                    // } else if (jenis_item === "Initialpad") {
                    //     localInitialFields.push(fieldObj);
                    // } else if (jenis_item === "Date") {
                    //     localDateFields.push(fieldObj);
                    // }

                    localNama.push(namaSigner);


                });

                setNama(localNama);
                console.log("Namaa:", nama);

                // setSignatures(localSignatureFields);
                // setInitials(localInitialFields);
                // setDateField(localDateFields);
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
                // setErrorMsg(error.message);
                // toast.error("Failed to load PDF Document.");
            } 
        };

        fetchData();
    }, [token]);

    const handleRadioChange = (e) => {
        setSelectedValue(e.target.value);
    }

    const handleInitialChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setInitialName(alphabetValue);
    };

    const handleJobChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setJob(alphabetValue);
    };

    const handleOrganization = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setOrganisasi(alphabetValue);
    };


    return (
        <>
            <Modal
            className="modal-primary"
            show={showInitialModal}
            onHide={() => setShowInitialModal(false)}
            >
            <Modal.Header className="text-center">
                <h3 className="mt-2 mb-0">Make Initial</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={""}>
                <span className="text-danger required-select">(*) Required.</span>
                <Row className="mt-3 mb-2">
                    <Col md="12">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label>Initials</label>
                            <Form.Control
                                type="text"
                                required
                                value={initialName}
                                lowercase
                                onChange={(e) => handleInitialChange(e.target.value.toLowerCase())}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                    <Col md="12">
                        <Form.Group>
                            <Form.Check 
                                type="radio"
                                id={1}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label1"
                                value="option1"
                                checked={selectedValue === 'option1'}
                                onChange={handleRadioChange}
                            />
                            <Form.Check 
                                type="radio"
                                id={2}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label2"
                                value="option2"
                                checked={selectedValue === 'option2'}
                                onChange={handleRadioChange}
                            />
                            <Form.Check 
                                type="radio"
                                id={3}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label3"
                                value="option3"
                                checked={selectedValue === 'option3'}
                                onChange={handleRadioChange}
                            />
                            <Form.Check 
                                type="radio"
                                id={4}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label4"
                                value="option4"
                                checked={selectedValue === 'option4'}
                                onChange={handleRadioChange}
                            />
                            <Form.Check 
                                type="radio"
                                id={5}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label5"
                                value="option5"
                                checked={selectedValue === 'option5'}
                                onChange={handleRadioChange}
                            />
                        </Form.Group>
                    </Col>
                </Row>
               
                <Row>
                <Col md="12">
                    <div className="d-flex flex-column">
                        <Button
                            className="btn-fill w-100 mt-3"
                            type="submit"
                            variant="primary"
                            >
                            Submit
                        </Button>
                    </div>
                </Col>
                </Row>
                </Form>
            </Modal.Body>
            
            </Modal>
        </>
    )
}

export default InitialModal;