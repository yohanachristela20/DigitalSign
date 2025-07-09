import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";

const InitialModal = ({showInitialModal, setShowInitialModal, onSuccess}) => {
    const [initialName, setInitialName] = useState("");
    const [selectedValue, setSelectedValue] = useState('option1');
    const [nama, setNama] = useState("");
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [id_item, setIdItem] = useState("");

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
                setIdSigner(id_signers);

                console.log("ID Dokumen:", id_dokumen);
                console.log("ID Signers:", id_signers);
                const response = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${id_signers}`);
                const data = response.data;

                if (data.length > 0 && data[0].Signerr) {
                setNama(data[0].Signerr.nama);
                setIdItem(data[0].id_item);
                setIdSigner(data[0].id_signers);
                console.log("Nama Signer:", data[0].Signerr.nama);
                console.log("Item:", data[0].id_item);
                console.log("Signer:", id_signers);

            }

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

    useEffect(() => {
        if (nama) {
            setInitialName(nama.toLowerCase());
        }
    }, [nama]);

    const generateImageBase64 = (initialName, fontFamily = "Arial") => {
        console.log("Initial name:", initialName);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        canvas.width = 200;
        canvas.height = 100;

        ctx.clearRect(0,0, canvas.width, canvas.height);
        ctx.font = `48px '${fontFamily}', cursive`;
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(initialName, canvas.width / 2, canvas.height /2);

        return canvas.toDataURL("image/png");
    };

    const fontMap = {
        option1: "Sevillana", 
        option2: "Dancing Script", 
        option3: "Caveat",
        option4: "Satisfy", 
        option5: "Great Vibes",
    };

    const updateInitialSign = async(id_dokumen, id_item, id_signers) => {
        console.log("Data dokumen:", id_dokumen, id_item, id_signers);
        const font = fontMap[selectedValue] || "Arial";
        const sign_base64 = generateImageBase64(initialName, font);
        const today = new Date();

        try {
            const response = await axios.patch(`http://localhost:5000/initialsign/${id_dokumen}/${id_item}/${id_signers}`, {
                sign_base64,
                status: "Completed", 
                tgl_tt: today,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            console.log("Signer logsign updated: ", response.data);
            
            toast.success("InitialSign uploaded successfully.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });
            setShowInitialModal(false);
        } catch (error) {
            console.error("Failed to save InitialSign", error.message);
        };
    }

    const handleSubmit = async(e) => {
        await updateInitialSign(id_dokumen, id_item, id_signers);
    }


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
                <Form onSubmit={handleSubmit}>
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
                                defaultValue={nama.toLowerCase()}
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
                                style={{fontFamily: fontMap["option1"]}}
                            />
                            <Form.Check 
                                type="radio"
                                id={2}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label2"
                                value="option2"
                                checked={selectedValue === 'option2'}
                                onChange={handleRadioChange}
                                style={{fontFamily: fontMap["option2"]}}
                            />
                            <Form.Check 
                                type="radio"
                                id={3}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label3"
                                value="option3"
                                checked={selectedValue === 'option3'}
                                onChange={handleRadioChange}
                                style={{fontFamily: fontMap["option3"]}}
                            />
                            <Form.Check 
                                type="radio"
                                id={4}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label4"
                                value="option4"
                                checked={selectedValue === 'option4'}
                                onChange={handleRadioChange}
                                style={{fontFamily: fontMap["option4"]}}
                            />
                            <Form.Check 
                                type="radio"
                                id={5}
                                label={initialName.toLowerCase()}
                                className="mt-3 radio-label5"
                                value="option5"
                                checked={selectedValue === 'option5'}
                                onChange={handleRadioChange}
                                style={{fontFamily: fontMap["option5"]}}
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
                            // onClick={updateInitialSign}
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