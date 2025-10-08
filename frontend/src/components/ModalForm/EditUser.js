import { Button, Row, Col, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const EditUser = ({showEditModal, setShowEditModal, user, onSuccess}) => {
    const [id_user, setIdUser] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState(""); 
    const [roleError, setRoleError] = useState(""); 

    const token = localStorage.getItem("token");
    useEffect(() => {
        if (user) {
            setIdUser(user.id_user);
            setEmail(user.email);
            setRole(user.role);
        }
    }, [user]);

    const updateUser = async(e) => {
        e.preventDefault();
        try {
            await axios.patch(`http://localhost:5000/user/${user.id_user}`, {
                id_user,
                password,
                role
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowEditModal(false);
            onSuccess();
        } catch (error) {
            toast.error('Failed to update user.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    }

    return (
        <>
            <Modal
            className=" modal-primary"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            >
                <Modal.Header className="text-center">
                    <h3 className="mt-2 mb-0">Update User Data</h3>
                </Modal.Header>
                <Modal.Body className="text-left pt-0 mt-2 my-3">
                    <Form onSubmit={updateUser}>
                    <span className="text-danger required-select">(*) Required.</span>
                    <Row className="mt-3 mb-2">
                    <Col md="12">
                    <Form.Group>
                        <label>Email</label>
                        <Form.Control
                            placeholder="Email"
                            type="text"
                            readOnly
                            disabled
                            value={email}
                        ></Form.Control>
                        </Form.Group>
                    </Col>
                    </Row>

                    <Row>
                    <Col md="12">
                    <Form.Group>
                    <span className="text-danger">*</span>
                        <label>Role</label>
                        <Form.Select
                            placeholder="Role"
                            className="form-control"
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
                        {roleError && <span className="text-danger required-select">Role hasn't been selected.</span>}
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

export default EditUser;