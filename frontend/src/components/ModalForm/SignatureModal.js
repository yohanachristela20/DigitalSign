import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import React, {useRef, useEffect, useState} from "react";
import SignatureCanvas from "react-signature-canvas";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import axios from "axios";
import "../../assets/scss/lbd/_modal.scss";

function SignatureModal ({showSignatureModal, setShowSignatureModal, onSuccess, selectedIdItem, selectedSigner, show, editable}) {
    const signatureRef = useRef();
    const [id_item, setIdItem] = useState("");
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedValues, setSelectedValues] = useState({});
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [signerData, setSignerData] = useState([]);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);

    const [delegated_signers, setDelegatedSigners] = useState("");
    const [is_delegated, setIsDelegated] = useState("");
    const [signerID, setSignerID] = useState("");

    const previewRef = useRef(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                const id_signers = res.data.id_signers;
                const id_item = res.data.id_item;
                const is_delegated = res.data.is_delegated;
                const delegated_signers = res.data.delegated_signers || null;

                setIdDokumen(id_dokumen);
                setIdSigner(id_signers);
                setIdItem(id_item);
                setIsDelegated(is_delegated);
                setDelegatedSigners(delegated_signers);

                const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
                const itemArray = Array.isArray(id_item) ? id_item : [id_item];
                
                const allSignerData = [];

                for (const selectedSigner of signerArray) {
                    for (const itemId of itemArray) {
                        const response = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${selectedSigner}/${itemId}`);
                        const data = response.data;

                        if (data.length > 0 && data[0].Signerr) {
                            allSignerData.push({
                                id_item: data[0].id_item,
                                id_signers: data[0].id_signers, 
                                nama: data[0].Signerr.nama.toLowerCase(),
                            });

                            data.filter(item => item.ItemField).forEach((item) => {
                                const {width, height} = item.ItemField;
                                setWidth(height);
                                setHeight(width);
                            });
                        }
                    }
                }
                setSignerData(allSignerData);
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
            } 
        };

        fetchData();
    }, [token]);

    const getSignatureImageBase64 = () => {
        if (!signatureRef.current || signatureRef.current.isEmpty()) {
            return null;
        }
        return signatureRef.current.toDataURL();
    }

    const updateSignature = async (id_dokumen, id_item, id_signers, selectedSigner) => {
        const today = new Date(); 
        if (!id_dokumen || !id_item || !id_signers) {
            toast.error("Missing document, item, or signer ID.");
            return;
        }

        const sign_base64 = getSignatureImageBase64();

        if (!sign_base64 || typeof sign_base64 !== 'string') {
            toast.error("Signature is empty.");
            return;
        }

        try {
            const response = await axios.patch(
                `http://localhost:5000/initialsign/${id_dokumen}/${id_item}/${id_signers}`,
                {
                    sign_base64,
                    status: "Completed",
                    tgl_tt: today,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setShowSignatureModal(false);

            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Failed to save Initial Sign:", error);
            toast.error("Failed to save Initial Sign.");
        }
    };

    const handleSubmit = async(e, selectedSigner) => {
        e.preventDefault();

        const base64Signature = getSignatureImageBase64();
        if (!base64Signature) {
            alert("Please provide a signature before submitting.");
            return;
        }

        setShowSignatureModal(false);

        await updateSignature(id_dokumen, selectedSigner.id_item, selectedSigner.id_signers, selectedSigner);
        window.location.reload();
    }

    const clearCanvas = () => {
        if (signatureRef.current) {
            signatureRef.current.clear();
        }
    };

    if (!selectedSigner || !selectedSigner.id_item) return null;

    return(
        <>
            {signerData
            .filter((selectedSigner) => selectedSigner.id_item === selectedIdItem) 
            .map((selectedSigner) => (
            <Modal
                key={selectedSigner.id_item}
                // className="modal-backdrop"
                // style={{backgroundColor: "transparent !important"}}
                show={showSignatureModal}
                onHide={() => setShowSignatureModal(false)}
            >
            <Modal.Header className="text-center pb-1"> 
                <h3 className="mt-3 mb-0">Sign</h3>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={(e) => handleSubmit(e, selectedSigner)}>
                    <Row>
                        <Col md="12">
                            <div className="d-flex flex-column"> 
                                <SignatureCanvas 
                                ref={signatureRef}
                                penColor="black"
                                className="w-100"
                                canvasProps={{style: {width: '100%', height: '100%', border: '1px solid black'}}}
                            />
                            </div>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="6">
                            <div className="d-flex flex-column">
                                <Button className="btn-fill w-100 mt-3" type="submit" variant="primary">
                                    Submit
                                </Button>
                            </div>
                        </Col>
                        <Col md="6">
                            <div className="d-flex flex-column">
                                <Button className="btn-fill w-100 mt-3" variant="danger" onClick={clearCanvas}>
                                    Clear
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

export default SignatureModal;