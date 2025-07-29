import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Modal, Form, Alert } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';

const EditKaryawan = ({showEditModal, setShowEditModal, employee, onSuccess}) => {
    const [id_karyawan, setIdKaryawan] = useState("");
    const [nama, setNama] = useState("");
    const [job_title, setJob] = useState("");
    const [organisasi, setOrganisasi] = useState("");

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (employee) {
            setIdKaryawan(employee.id_karyawan);
            setNama(employee.nama);
            setJob(employee.job_title);
            setOrganisasi(employee.organisasi);
        }
    }, [employee]);

    const updateKaryawan = async(e) => {
        e.preventDefault();
        try {
            await axios.patch(`http://locahost:5000/employee/${employee.id_karyawan}`, {
                id_karyawan,
                nama, 
                job_title, 
                organisasi
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
        } catch (error) {
            console.log(error.message);
            toast.error('Failed to update employee data.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

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
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        >
        <Modal.Header className="text-center">
            <h3 className="mt-2 mb-2">Update Employee</h3>
        </Modal.Header>
        <Modal.Body className="text-left pt-0 mt-2 my-3">
            <Form onSubmit={updateKaryawan}>
            <Row className="mt-3 mb-2">
                <Col md="12">
                    <Form.Group>
                        <label>Employee ID</label>
                        <Form.Control
                            readOnly
                            disabled
                            type="text"
                            value={id_karyawan}
                        ></Form.Control>
                    </Form.Group>
                </Col>
            </Row>
            <Row className="mt-3 mb-2">
                <Col md="12">
                <Form.Group>
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

export default EditKaryawan;