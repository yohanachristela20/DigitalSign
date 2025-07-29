import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const EditCategory = ({showEditModal, setShowEditModal, category, onSuccess}) => {
    // const [id_kategoridok, setIdKategori] = useState("");
    const [kategori, setKategori] = useState("");
    const token = localStorage.getItem("token");

    useEffect(() => {
    // if (!category) return null;
        if (category) {
            setKategori(category.kategori);
        }
    }, [category]);

    const handleUpdate = async () => {
        try {
        if (!category?.id_kategoridok) {
            console.error("Missing category ID!");
            return;
        }

        await axios.patch(
            `http://localhost:5000/category/${category.id_kategoridok}`,
            { kategori },
            {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            }
        );
        onSuccess();
        } catch (err) {
        console.error("Failed to update category:", err);
        }
    };


    return (
        <>
            <Modal
            className=" modal-primary"
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            >
            <Modal.Header className="text-center">
                <h3 className="mt-2 mb-0">Update Category</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={handleUpdate}>
                <span className="text-danger required-select">(*) Required.</span>
                <Row className="mt-3 mb-2">
                <Col md="12">
                <Form.Group>
                    <label>Category</label>
                    <Form.Control
                        // placeholder="Kategori"
                        type="text"
                        value={kategori}
                        onChange={(e) => setKategori(e.target.value)}
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

export default EditCategory;