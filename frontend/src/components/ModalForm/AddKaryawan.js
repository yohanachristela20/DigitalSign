import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddKaryawan = ({showAddModal, setShowAddModal, onSuccess}) => {
    const [id_karyawan, setIdKaryawan] = useState("");
    const [nama, setNama] = useState("");
    const [job_title, setJob] = useState("");
    const [organisasi, setOrganisasi] = useState("");
    const [jobTitleError, setJobTitleError] = useState("");

    const token = localStorage.getItem("token");

    const idKaryawan = async(e) => {
        const response = await axios.get('http://10.70.10.20:5000/getLastKaryawanId', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        const newId = response.data?.nextId || "K00001";
        setIdKaryawan(newId);
    };

    useEffect(() => {
        idKaryawan();
    });

    const saveKaryawan = async(e) => {
        e.preventDefault();
        try {
            await axios.post('http://10.70.10.20:5000/employee', {
                id_karyawan,
                nama, 
                job_title,
                organisasi, 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setShowAddModal(false);
            onSuccess();
            window.location.reload();
        } catch (error) {
            console.log(error.message);
        }
    
    };

    const handleNamaChange = (value) => {
        // const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNama(value);
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
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            >
            <Modal.Header className="text-center">
                <h3 className="mt-2 mb-0">Add New Employee</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={saveKaryawan}>
                <span className="text-danger required-select">(*) Required.</span>
                <Row className="mt-3 mb-2">
                    <Col md="12">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label>Employee ID</label>
                            <Form.Control
                                type="text"
                                readOnly
                                disabled
                                value={id_karyawan}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mt-3 mb-2">
                    <Col md="12">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label>Name</label>
                            <Form.Control
                                type="text"
                                required
                                value={nama}
                                uppercase
                                onChange={(e) => handleNamaChange(e.target.value.toUpperCase())}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row>
                    <Col md="12" className="mb-2">
                        <Form.Group>
                        <span className="text-danger">*</span>
                        <label>Job Title</label>
                        <Form.Select 
                        className="form-control"
                        required
                        value={job_title}
                        onChange={(e) => {
                            setJob(e.target.value);
                            setJobTitleError(false);
                        }}
                        >
                            <option className="placeholder-form" key='blankChoice' hidden value>Choose Job Title</option>

                            <option value="FINANCE DIRECTOR">FINANCE DIRECTOR</option>
                            <option value="PRODUCTION DIRECTOR">PRODUCTION DIRECTOR</option>
                            <option value="PURCHASING">PURCHASING</option>
                            <option value="FINANCE">FINANCE</option>
                            <option value="LOGISTIC">LOGISTIC</option>
                            <option value="ACCOUNTING">ACCOUNTING</option>
                            <option value="TAX">TAX</option>
                            <option value="FREEZER MANAGEMENT">FREEZER MANAGEMENT</option>
                            <option value="PRODUCT COST">PRODUCT COST</option>
                            <option value="DELIVERY VAN REPAIR">DELIVERY VAN REPAIR</option>
                            <option value="INTERNAL AUDIT">INTERNAL AUDIT</option>
                            <option value="PRODUCTION">PRODUCTION</option>
                            <option value="PPC">PPC</option>
                            <option value="R&D">R&D</option>
                            <option value="QC">QC</option>
                            <option value="QS">QS</option>
                            <option value="MARKETING OPERATIONAL">MARKETING OPERATIONAL</option>
                            <option value="IT SUPPORT">IT SUPPORT</option>
                            <option value="HR & GENERAL AFFAIR">HR & GENERAL AFFAIR</option>
                            <option value="TEKNIK & ADM. MEKANIK">TEKNIK & ADM. MEKANIK</option>
                        </Form.Select>
                        {jobTitleError && <span className="text-danger required-select">Please choose Job Title first</span>}
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3 mb-2">
                    <Col md="12">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>Organization</label>
                        <Form.Control
                            type="text"
                            required
                            value={organisasi}
                            uppercase
                            onChange={(e) => handleOrganization(e.target.value.toUpperCase())}
                        ></Form.Control>
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

export default AddKaryawan;