import { Modal, Form, Row, Col, Button } from "react-bootstrap";
import React, {useRef, useEffect, useState} from "react";
import SignatureCanvas from "react-signature-canvas";
import { useLocation } from "react-router-dom";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import axios from "axios";

function SignatureModal ({showSignatureModal, setShowSignatureModal, onSuccess, selectedIdItem, selectedSigner}) {
    const signatureRef = useRef(null);
    const [id_item, setIdItem] = useState("");
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedValues, setSelectedValues] = useState({});
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [signerData, setSignerData] = useState([]);
    const [width, setWidth] = useState(200);
    const [height, setHeight] = useState(100);
    
    useEffect(() => {
        console.log("InitialModal receive id_item:", selectedIdItem);
        console.log("InitialModal show initialmodal:", showSignatureModal);
    }, [selectedIdItem, showSignatureModal]);

    useEffect(() => {
        const fetchData = async () => {
            if (!token ) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                setIdDokumen(id_dokumen);
                const id_signers = res.data.id_signers;
                setIdSigner(id_signers);

                console.log("ID Dokumen:", id_dokumen);
                console.log("ID Signers:", id_signers);

                const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
                
                const allSignerData = [];

                for (const selectedSigner of signerArray) {
                    const response = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${selectedSigner}`);
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

        return signatureRef.current.getTrimmedCanvas().toDataURL("image/png");
    }

    // const generateImage = async () => {
    //     if (!signatureRef.current) return null;

    //     const canvas = await html2canvas(signatureRef.current, {
    //         backgroundColor: null, 
    //         useCORS: true,         
    //     });

    //     return canvas.toDataURL("image/png");
    // };

    // const updateInitialSign = async (id_dokumen, id_item, id_signers, selectedSigner) => {
    //     console.log("Data dokumen:", id_dokumen, id_item, id_signers);
    //     const today = new Date();
    
    //         try {
    //             const sign_base64 = getSignatureImageBase64();
    //             console.log("Hasil Base64:", sign_base64?.substring(0, 100));
    
    //             if (!sign_base64) {
    //                 toast.error("Failed to generate initial sign.");
    //                 return;
    //             }
    
    //             const response = await axios.patch(`http://localhost:5000/initialsign/${id_dokumen}/${id_item}/${id_signers}`, {
    //                 sign_base64,
    //                 status: "Completed", 
    //                 tgl_tt: today,
    //             }, {
    //                 headers: {
    //                     Authorization: `Bearer ${token}`,
    //                 },
    //             });
    
    //             console.log("Signer logsign updated: ", response.data);
    //             toast.success("InitialSign uploaded successfully.", {
    //                 position: "top-right",
    //                 autoClose: 5000,
    //                 hideProgressBar: true,
    //             });
    //             setShowSignatureModal(false);
    //         } catch (error) {
    //             console.error("Failed to save InitialSign", error.message);
    //         }
    // };
    

    const updateInitialSign = async (id_dokumen, id_item, id_signers) => {
        const today = new Date().toISOString(); 
        if (!id_dokumen || !id_item || !id_signers) {
            toast.error("Missing document, item, or signer ID.");
            return;
        }

        const sign_base64 = getSignatureImageBase64();

        if (!sign_base64) {
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
            toast.success("Initial Sign uploaded successfully.");
            setShowSignatureModal(false);

            if (onSuccess) {
                onSuccess(); // Trigger any parent action if needed
            }
        } catch (error) {
            console.error("Failed to save Initial Sign:", error.message);
            toast.error("Failed to save Initial Sign.");
        }
    };


    // useEffect(() => {
    //     generateImage().then(img => {
    //         if (img) {
    //             console.log("Preview base64:", img);
    //         }
    //     });
    // }, [selectedValue]);
    
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!signatureRef.current || signatureRef.current.isEmpty()) {
            toast.error("Please sign the document first.");
            return;
        }

        console.log("Selected signer:", selectedSigner);
        console.log("Selected id item:", selectedSigner.id_item);
        console.log("Selected id signers:", selectedSigner.id_signers);

        if (!selectedSigner || !selectedSigner.id_item || !selectedSigner.id_signers) {
            toast.error("Selected signer data is incomplete.");
            console.log("selectedSigner:", selectedSigner);
            return;
        }

        try {
            await updateInitialSign(id_dokumen, selectedSigner.id_item, selectedSigner.id_signers);
            toast.success("Signed document saved successfully.");
            setShowSignatureModal(false);
        } catch (error) {
            console.error("Error submitting sign:", error.message);
        }
    };


    const handleCloseModal = () => {
        setShowSignatureModal(false);
    }

    if (!selectedSigner || !selectedSigner.id_item) return null;
    console.log("Selected signer:", selectedSigner);
    console.log("Selected id item:", selectedSigner.id_item);

    return(
        <>
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
                            <SignatureCanvas 
                                ref={signatureRef}
                                penColor="black"
                                canvasProps={{style: {width: '100%', height: '100%', border: '1px solid black'}}}
                            />
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
        </>
    )
}

export default SignatureModal;