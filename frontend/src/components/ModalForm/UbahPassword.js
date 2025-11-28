import { Button, Row, Col, Card, Table, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import axios from "axios";
import { stopInactivityTimer } from "views/Heartbeat";
import PasswordChecklist from "react-password-checklist";

function UbahPassword({ show, onHide }) {
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newRePassword, setNewRePassword] = useState("");

    const history = useHistory();

    useEffect(() => {
        const storedEmail = localStorage.getItem("email");
        const storedRole = localStorage.getItem("role");

        if (storedEmail) setEmail(storedEmail);
        if (storedRole) setRole(storedRole);
    }, [show]);

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (!oldPassword || !newPassword) {
            alert("Please fill all those fields!");
            return;
        }

        try {
            const response = await axios.post("http://10.70.10.20:5000/change-password", {
                email,
                role,
                oldPassword,
                newPassword,
            });

            alert(response.data.message); 
            

            axios.post("http://10.70.10.20:5000/logout", {}, {
                  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
                }).finally(() => {
                  stopInactivityTimer();
                  localStorage.removeItem("token");
                  localStorage.removeItem("role");
                  history.push("/login");
                  window.location.reload();
                });
        } catch (error) {
            console.error("Failed to change password:", error);
            alert(error.response?.data?.message || "Error occured.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header>
                <Modal.Title>Change Password</Modal.Title>
                <Button
                    variant="close"
                    aria-label="Close"
                    onClick={onHide}
                    style={{
                        background: "none",
                        border: "none",
                        fontSize: "1.5rem",
                        fontWeight: "bold",
                        cursor: "pointer",
                    }}
                >
                    &times;
                </Button>
            </Modal.Header>
            <Modal.Body className="pt-0 mt-2">
                <Form onSubmit={handleChangePassword}>
                <span className="text-danger required-select">(*) Required.</span>
                    <Form.Group className="mt-2 mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            readOnly
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Role</Form.Label>
                        <Form.Control
                            value={role}
                            type="text"
                            placeholder="Role"
                            onChange={(e) => setRole(e.target.value)}
                            required
                            readOnly
                        >
                        </Form.Control>
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <span className="text-danger">*</span>
                        <Form.Label>Old Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <span className="text-danger">*</span>
                        <Form.Label>New Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            // pattern={'(?=^.{9,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*'}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                    <span className="text-danger">*</span>
                        <Form.Label>Confirm Password</Form.Label>
                        <Form.Control
                            type="password"
                            value={newRePassword}
                            onChange={(e) => setNewRePassword(e.target.value)}
                            // pattern={'(?=^.{9,}$)(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[^A-Za-z0-9]).*'}
                            required
                        />
                        <PasswordChecklist 
                            className="mt-3"
                            rules={[ "match"]}
                            // "minLength", "number", "capital",
                            minLength={8}
                            value={newPassword}
                            valueAgain={newRePassword}
                            messages={{
                                // minLength: "Min 8 characters",
                                // number: "Min 1 number",
                                // capital: "Min 1 uppercase letter",
                                match: "New password and confirm password should be match"
                            }}
                        />
                    </Form.Group>

                    <Row>
                        <Col>
                            <Button
                                type="submit"
                                className="btn-fill w-100 mb-4 mt-2"
                                variant="primary"
                                 disabled={newPassword !== newRePassword || !newPassword || !oldPassword}
                            >
                                Change Password
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
        </Modal>
    );
}

export default UbahPassword;
