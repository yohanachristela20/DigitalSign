import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";

const InitialModal = ({showAddModal, setshowAddModal, onSuccess}) => {
    const [initialName, setInitialName] = useState("");
    const [selectedValue, setSelectedValue] = useState('option1');

    const token = localStorage.getItem("token");

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
            show={showAddModal}
            onHide={() => setshowAddModal(false)}
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