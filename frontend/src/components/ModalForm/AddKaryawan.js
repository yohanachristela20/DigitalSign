import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddKaryawan = ({showAddModal, setShowAddModal, onSuccess}) => {
    const [id_karyawan, setIdKaryawan] = useState("");
    const [nama, setNama] = useState("");
    const [job_title, setJob] = useState("");
    const [organisasi, setOrganisasi] = useState("");

    const token = localStorage.getItem("token");

    const idKaryawan = async(e) => {
        const response = await axios.get('http://localhost:5000/getLastKaryawanId', {
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
            await axios.post('http://localhost:5000/employee', {
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
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setNama(alphabetValue);
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
                <Row className="mt-3 mb-2">
                    <Col md="12">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>Job Title</label>
                        <Form.Control
                            type="text"
                            required
                            value={job_title}
                            uppercase
                            onChange={(e) => handleJobChange(e.target.value.toUpperCase())}
                        ></Form.Control>
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