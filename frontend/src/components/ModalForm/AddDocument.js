import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from 'react-toastify';

const AddDocument = ({showAddDoc, setShowAddDoc, onSuccess}) => {
    const [id_dokumen, setIdDokumen] = useState("");
    const [nama_dokumen, setNamaDokumen] = useState("");
    const [file, setFile] = useState(null);
    const [category, setCategory] = useState([]);
    const [id_kategoridok, setIdKategoriDok] = useState("");

    const token = localStorage.getItem("token");

    const lastIdDokumen = async(e) => {
        const response = await axios.get('http://10.70.10.20:5000/getLastDocumentId', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        let newId = "D00001";
        if (response.data?.lastId) {
            const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
            const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
            newId = `D${incrementedIdNumber}`;
        }
        setIdDokumen(newId);
    };

    const categoryDoc = async() => {
        try {
            const response = await axios.get('http://10.70.10.20:5000/category', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            const newCategory = response.data.map(item => ({
                value: item.id_kategoridok,
                label: item.kategori
            }));
            setCategory(newCategory);
        } catch (error) {
            console.error("Error fetching data:", error.message); 
        }
    }

    useEffect(() => {
        lastIdDokumen();
        categoryDoc();
    }, []);

    // console.log("Categories: ", category);

    const saveDocument = async(e) => {
        e.preventDefault();
            if (!file) {
                toast.error("Please choose PDF file.");
                return;
            }

            const formData = new FormData();
            formData.append("pdf-file", file);
            formData.append("id_dokumen", id_dokumen);
            formData.append("nama_dokumen", nama_dokumen);
            formData.append("id_kategoridok", id_kategoridok);
        try {
            const response = await axios.post('http://10.70.10.20:5000/document', formData,
               {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data",
                },
            });

            setShowAddDoc(false);
            onSuccess();
        } catch (error) {
            console.log(error.message);
        }
    
    };

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleCategoryChange = (event) => {
        setIdKategoriDok(event.target.value);
    }


    return (
        <>
            <Modal
            className="modal-primary"
            show={showAddDoc}
            onHide={() => setShowAddDoc(false)}
            >
            <Modal.Header className="text-center">
                <h3 className="mt-2 mb-0">Upload New Document</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={saveDocument}>
                <span className="text-danger required-select">(*) Required.</span>
                <Row className="mt-3 mb-2">
                    <Col md="12">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label>Document ID</label>
                            <Form.Control
                                type="text"
                                readOnly
                                disabled
                                value={id_dokumen}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mt-3 mb-2">
                    <Col md="12">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label>File Name</label>
                            <Form.Control
                                type="text"
                                required
                                value={nama_dokumen}
                                onChange={(e) => setNamaDokumen(e.target.value)}
                            ></Form.Control>
                        </Form.Group>
                    </Col>
                </Row>
                <Row className="mt-3 mb-2">
                    <Col md="12">
                    <Form.Group>
                        <span className="text-danger">*</span>
                        <label>Upload Document</label><br />
                        <input type="file" accept=".pdf" onChange={handleFileChange} />
                    </Form.Group>
                    </Col>
                </Row>
                <Row className="mt-3 mb-2">
                    <Col md="12">
                        <Form.Group>
                        <span className="text-danger">*</span>
                            <label>Category</label>
                            <Form.Select 
                            className="form-control"
                            required
                            value={id_kategoridok}
                            onChange={handleCategoryChange}
                            >
                            <option className="placeholder-form" key="blankChoice" hidden value="">
                                Choose Category
                            </option>
                            {category.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
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

export default AddDocument;