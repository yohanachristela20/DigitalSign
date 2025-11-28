import { Button, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";

const DelegateModal = ({showDelegateModal, setShowDelegateModal, selectedSigner, selectedDocument}) => {
    const [selectedValue, setSelectedValue] = useState('');
    const [signerData, setSignerData] = useState([]);
    const [selectedEmployee, setselectedEmployee] = useState(null);

    const [selectedValues, setSelectedValues] = useState({});
    const [nama, setNama] = useState("");
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [signerID, setSignerID] = useState("");
    const [reason, setReason] = useState("");
    const [employeeName, setEmployeeName] = useState([]);
    const [employeeList, setEmployeeList] = useState([]);
    const [email, setEmail] = useState([]);
    const [delegated_signers, setDelegatedSigners] = useState("");

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://10.70.10.20:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;
                setIdSigner(id_signers);

                const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];

                const allSigners = [];

                for (const signer of signerArray) {
                    const response = await axios.get(`http://10.70.10.20:5000/decline/${id_dokumen}/${signer}`);
                    const data = response.data;

                    if (data.length > 0 && data[0].Signerr) {
                        allSigners.push({
                            id_signers: data[0].id_signers,
                            nama: data[0].Signerr.nama,
                        });
                    }
                }

                setSignerData(allSigners);
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
            } 
        };

        fetchData();
    }, [token]);

    useEffect(() => {
        if (!selectedSigner || signerData.length === 0) return;
        const found = signerData.find(s => s.id_signers === selectedSigner);
        if (found) {
            setNama(found.nama);
            setSignerID(found.id_signers)
        }
    }, [id_signers, selectedSigner, signerData]);


    const handleSubmit = async(e, signerID) => {
        e.preventDefault();

        if (!selectedEmployee?.value){
            toast.error("Please choose a delegate signer.");
            return;
        }
        await updateDelegate(id_dokumen, signerID);
    }

    const getName = async() => {
        try {
            const response = await axios.get('http://10.70.10.20:5000/detailKaryawan', {
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });

            const uniqueMap = new Map();

            response.data.forEach(item => {
                if (!uniqueMap.has(item.id_karyawan)) {
                    uniqueMap.set(item.id_karyawan, {
                        value: item.id_karyawan,
                        label: item.nama || "No Name",
                        email: item.Penerima?.email || "No Email",
                    });
                }
            });

            const uniqueEmployees = Array.from(uniqueMap.values());

            setEmployeeName(uniqueEmployees);
        } catch (error) {
            console.error("Error fetching data:", error.message);
        }
    }

    const updateDelegate = async(id_dokumen, signerID) => {
        const delegateId = selectedEmployee?.value;

        try {
            const response = await axios.patch(`http://10.70.10.20:5000/delegate-doc/${id_dokumen}/${signerID}`, {
                is_delegated: true,
                delegated_signers: delegateId,
            }); 

            localStorage.setItem("id_dokumen", id_dokumen);
            localStorage.setItem("is_delegated", "true");

            sendEmailDelegate(id_dokumen, delegateId, token);

            toast.success("Delegate document successful.", {
                position: "top-right", 
                autoClose: 5000,
                hideProgressBar: true, 
            }); 
            window.location.reload();
            setShowDelegateModal(false);
        } catch (error) {
            console.error("Failed to update status document.", error.message);
        }
    };

    const sendEmailDelegate = async(id_dokumen, delegated_signers) => {

        try {
            const responseDecline = await axios.post('http://10.70.10.20:5000/send-delegate-email', {
                id_dokumen, 
                delegated_signers, 
                token
            });

            toast.success("Delegate email sent!", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });

            window.location.reload();

            
        } catch (error) {
            console.error("Failed to send delegate email:", error.message);
            toast.error("Failed to send delegate email.");
        }
    }

    const handleCloseModal = () => {
        setShowDelegateModal(false);
        setReason("");
        setSelectedValue("");
        setSelectedValues({});
    }

    useEffect(() => {
        getName();
    }, []);

    useEffect(() => {
        if (!selectedEmployee) return;
        setEmail(selectedEmployee.email || "");
    }, [ selectedEmployee]);


    return (
        <>
           {signerData.length > 0 && signerData.map((selectedSigner) => (
            <Modal
                key={selectedSigner.id_signers}
                show={showDelegateModal}
                onHide={() => handleCloseModal(selectedSigner.id_signers)}
            >
            <Modal.Header closeButton>
                <Modal.Title>Delegate Document</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-left pt-0 mt-2 my-3">
                <Form onSubmit={(e) => handleSubmit(e, signerID)}>
                    <p className="mt-2 user-font">*Choose another signer to delegate the document.</p>
                    <Row className="mt-3 mb-2">
                        <Col md="12">
                            <Form.Group>
                            <label>Another Signer</label>
                            <Form.Select 
                                className="form-control"
                                required
                                value={selectedEmployee?.value}
                                onChange={(e) => 
                                    {const selected = employeeName.find(emp => emp.value === e.target.value);
                                    setselectedEmployee(selected || null)
                                    setDelegatedSigners(selected.value)
                                }
                                }
                                >
                                <option className="placeholder-form" key="blankChoice" hidden value="">
                                    Choose Signer
                                </option>
                                {employeeName.map(option => (
                                    <option key={option.value} value={option.value} hidden={option.value == signerID}>
                                        {option.label}
                                    </option>
                                ))}
                            </Form.Select>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <Form.Group>
                                <label>Email</label>
                                <Form.Control
                                    type="text"
                                    readOnly
                                    value={email}
                                ></Form.Control>
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                    <Col md="12">
                        <div className="d-flex flex-column">
                        <Button className="btn-fill w-100 mt-3" type="submit" variant="primary">
                            Submit
                        </Button>
                        </div>
                    </Col>
                    </Row>
                </Form>

            </Modal.Body>
            </Modal>
           ))}
        </>
    )
}

export default DelegateModal;