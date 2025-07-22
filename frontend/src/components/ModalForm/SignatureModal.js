import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import React, {useRef, useEffect, useState} from "react";
import SignatureCanvas from "react-signature-canvas";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import axios from "axios";

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
    const previewRef = useRef(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        console.log("SignatureModal receive id_item:", selectedIdItem);
        console.log("show SignatureModal:", showSignatureModal);
        console.log("Selected signer:", selectedSigner);
        console.log("Show from initial modal:", show);
        console.log("Editable from initial modal:", editable);
    }, [selectedIdItem, showSignatureModal, selectedSigner, show, editable]);

    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;
                setIdSigner(id_signers);
                const id_item = res.data.id_item;
                setIdItem(id_item);

                console.log("ID Dokumen:", id_dokumen);
                console.log("ID Signers:", id_signers);
                console.log("ID Item: ", id_item);

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
                console.log("Signer data:", signerData);
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
        console.log("Data update signature:", "id_dokumen:", id_dokumen, "id_item:",id_item, "id_signers:", id_signers, "selectedSigner:", selectedSigner);

        const today = new Date(); 
        if (!id_dokumen || !id_item || !id_signers) {
            toast.error("Missing document, item, or signer ID.");
            return;
        }

        const sign_base64 = getSignatureImageBase64();

        console.log("Signbase64:", sign_base64);
        console.log("sign_base64 type:", typeof sign_base64);
        console.log("sign_base64 size:", sign_base64?.length);

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

            console.log("Signer logsign updated:", response.data);
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

        console.log("type of base64Signature:", typeof base64Signature);
        console.log("base64Signature size:", base64Signature.length);
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
    console.log("Selected signer:", selectedSigner);
    console.log("Selected id item:", selectedSigner.id_item);

    return(
        <>
            {signerData
            .filter((selectedSigner) => selectedSigner.id_item === selectedIdItem) 
            .map((selectedSigner) => (
                <Modal
                key={selectedSigner.id_item}
                className="modal-primary"
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