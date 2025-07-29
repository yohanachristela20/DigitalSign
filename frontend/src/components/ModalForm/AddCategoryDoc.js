import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddCategory = ({showAddModal, setShowAddModal}) => {
    const [kategori, setKategori] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(true);

    const getCategory = async () => {
        try {
        const response = await axios.get("http://localhost:5000/category", {
            headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        console.log("response.data:", response.data);
        setCategory(response.data);
        } catch (error) {
        console.error("Error fetching data:", error.message); 
        } finally {
        setLoading(false);
        }
    };

    const handleAddSuccess = () => {
    getCategory();
    toast.success("New category has been created!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
    window.location.reload();
    };

    const token = localStorage.getItem("token");
    const saveKategori = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.get('http://localhost:5000/getLastCategoryId', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            let newId = "KD00001";
            if (response.data?.lastId) {
                const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
                const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
                newId = `KD${incrementedIdNumber}`;
            }

            await axios.post('http://localhost:5000/category', {
                id_kategoridok: newId,
                kategori
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setShowAddModal(false);
            handleAddSuccess();
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.log(error.message);
            toast.error('Failed to create new category.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
              });
        }
    };

    return (
        <>
            <Modal
            className=" modal-primary"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
            >
            <Modal.Header className="text-center">
                <h3 className="mt-2 mb-0">New Category</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={saveKategori}>
                <span className="text-danger required-select">(*) Required.</span>
                 <Row className="mt-3 mb-2">
                    <Col md="12">
                    <Form.Group>
                        <span className="text-danger">*</span>
                        <label>Category</label>
                        <Form.Control
                            type="text"
                            required
                            value={kategori}
                            onChange={(e) => {
                                setKategori(e.target.value);
                            }}
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

export default AddCategory;