import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddUser = ({showAddModal, setShowAddModal, onSuccess}) => {
    const [id_user, setIdUser] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState(""); 
    const [id_karyawan, setIdKaryawan] = useState("");


    const token = localStorage.getItem("token");
    const saveUser = async(e) => {
        e.preventDefault();
        try {
            const defaultPassword = "cmpi"; 

            const response = await axios.get('http://localhost:5000/last-id', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            let newId = "US00001";
            if (response.data?.lastId) {
                const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `US${incrementedIdNumber}`;
            }

            await axios.post('http://localhost:5000/user', {
                id_user: newId,
                email, 
                password: defaultPassword,
                role, 
                id_karyawan,
                user_active: 0,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowAddModal(false);
            onSuccess();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.log(error.message);
            toast.error('Failed to create new user.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    
    };

    // const handleUsernameChange = (value) => {
    //     const numericValue = value.replace(/\D/g, "");
    //     setIdUser(numericValue);
    // };


    return (
        <>
            {/* Mini Modal */}
            <Modal
            className=" modal-primary"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            >
            <Modal.Header className="text-center">
                <h3 className="mt-2 mb-0">Add New User</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={saveUser}>
                <span className="text-danger required-select">(*) Required.</span>
                <Row>
                    <Col md="12">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>Employee ID</label>
                        <Form.Control
                            type="text"
                            required
                            value={id_karyawan}
                            onChange={(e) => {
                                setIdKaryawan(e.target.value);
                            }}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mt-3 mb-2">
                    <Col md="12">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>Email</label>
                        <Form.Control
                            type="text"
                            required
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                            }}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>

                <Row className="mb-2">
                    <Col md="12">
                        <Form.Group>
                            <span className="text-danger">*</span>
                            <label>Role</label>
                            <Form.Select
                                placeholder="Role"
                                className="form-control"
                                type="text"
                                value={role}
                                required
                                onChange={(e) => {
                                    setRole(e.target.value);
                                }}
                                >
                                    <option className="placeholder-form" key='blankChoice' hidden value>Choose Role</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Super Admin">Super Admin</option>
                                    <option value="User">User</option>
                            </Form.Select>
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

export default AddUser;