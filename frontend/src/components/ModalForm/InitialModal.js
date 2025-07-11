import { Badge, Button, Navbar, Nav, Container, Row, Col, Card, Table, Alert, Modal, Form } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from 'react-toastify';
import "../../assets/scss/lbd/_radiobutton.scss";
import html2canvas from "html2canvas";
import { SketchPicker } from "react-color";

const InitialModal = ({showInitialModal, setShowInitialModal, onSuccess, selectedIdItem}) => {
    const [initialName, setInitialName] = useState("");
    const [selectedValue, setSelectedValue] = useState('');
    const [selectedValues, setSelectedValues] = useState({});
    const [nama, setNama] = useState([]);
    const [id_dokumen, setIdDokumen] = useState("");
    const [id_signers, setIdSigner] = useState("");
    const [id_item, setIdItem] = useState("");
    const [fontColor, setFontColor] = useState("#000000");
    const [width, setWidth] = useState("");
    const [height, setHeight] = useState("");
    const [fontSize, setFontSize] = useState(24);
    const [signerData, setSignerData] = useState([]);
    const [activeIdItem, setActiveIdItem] = useState(null);

    const previewRef = useRef(null);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

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

                for (const signer of signerArray) {
                    const response = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`);
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

    // const handleRadioChange = (e) => {
    //     const value = e.target.value;
    //     setSelectedValue(value);
    //     console.log("Selected value:", selectedValue);
    // }

    const handleRadioChange = (e, id_item) => {
        const value = e.target.value;
        setSelectedValues(prev => ({ ...prev, [id_item]: value }));
        console.log(`Selected value ${id_item}:`, value);
    };

    const handleInitialChange = (id_item, value) => {
        const updated = signerData.map((item) =>
            item.id_item === id_item ? { ...item, nama: value } : item
        );
        setSignerData(updated);
    };

    const handleJobChange = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setJob(alphabetValue);
    };

    const handleOrganization = (value) => {
        const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
        setOrganisasi(alphabetValue);
    };

    useEffect(() => {
        if (!id_item || signerData.length === 0) return;
        const found = signerData.find(s => s.id_item === id_item);
        if (found) {
            setInitialName(found.nama);
        }
    }, [id_item, signerData]);

    const generateImageBase64 = (text, fontFamily = "Arial") => {
        return new Promise((resolve, reject) => {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            
            canvas.width = width;
            canvas.height = height;

            const estimatedFontSize = Math.min(canvas.width / text.length * 1.5, canvas.height * 0.6);

            const fontLoad = `${estimatedFontSize}px ${fontFamily}`;

            document.fonts.load(fontLoad).then(() => {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.font = fontLoad;
                ctx.fillStyle = "black";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(text, canvas.width / 2, canvas.height / 2);

                const dataURL = canvas.toDataURL("image/png");
                resolve(dataURL);
            }).catch(err => {
                console.error("Font failed to load:", err);
                reject("Font failed to load");
            });
        });
    };


    const fontMap = {
        option1: "Sevillana", 
        option2: "Dancing Script", 
        option3: "Caveat",
        option4: "Satisfy", 
        option5: "Great Vibes",
    };

    const handleEncode = () => {
        try {
        const encoded = btoa(inputText);
        setEncodedText(encoded);
        } catch (error) {
        console.error("Error encoding to Base64:", error);
        setEncodedText("Error: Could not encode text.");
        }
    };

    const generateImage = async () => {
        if (!previewRef.current) return null;

        const canvas = await html2canvas(previewRef.current, {
            backgroundColor: null, 
            useCORS: true,         
        });

        return canvas.toDataURL("image/png");
    };

    const updateInitialSign = async (id_dokumen, id_item, id_signers, signer) => {
    console.log("Data dokumen:", id_dokumen, id_item, id_signers);
    const fontKey = selectedValues[id_item];
    const font = fontMap[fontKey] || "Arial";
    const today = new Date();

        try {
            const sign_base64 = await generateImageBase64(signer.nama, font);
            console.log("Hasil Base64:", sign_base64?.substring(0, 100));

            if (!sign_base64) {
                toast.error("Failed to generate initial sign.");
                return;
            }

            const response = await axios.patch(`http://localhost:5000/initialsign/${id_dokumen}/${id_item}/${id_signers}`, {
                sign_base64,
                status: "Completed", 
                tgl_tt: today,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            console.log("Signer logsign updated: ", response.data);
            toast.success("InitialSign uploaded successfully.", {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: true,
            });
            setShowInitialModal(false);
        } catch (error) {
            console.error("Failed to save InitialSign", error.message);
        }
    };

    useEffect(() => {
        generateImage().then(img => {
            if (img) {
                console.log("Preview base64:", img);
            }
        });
    }, [initialName, selectedValue, fontColor, fontSize]);


    const handleSubmit = async(e, signer) => {
        e.preventDefault();
        await updateInitialSign(id_dokumen, signer.id_item, signer.id_signers, signer);
        // window.location.reload();
    }

    const handleCloseModal = () => {
        setShowInitialModal(false);
    }

    return (
        <>
            {signerData
                .filter((signer) => signer.id_item === selectedIdItem) 
                .map((signer) => (
                    <Modal
                    key={signer.id_item}
                    show={showInitialModal}
                    onHide={() => handleCloseModal(signer.id_item)}
                    // backdrop="static"
                    // keyboard={false}
                    >
                    <Modal.Header closeButton>
                        <Modal.Title>Make Initial</Modal.Title>
                    </Modal.Header>
                    <Modal.Body className="text-left pt-0 mt-2 my-3">
                        <Form onSubmit={(e) => handleSubmit(e, signer)}>
                            <span className="text-danger required-select">(*) Required.</span>
                            <Row className="mt-3 mb-2">
                                <Col md="12">
                                    <Form.Group>
                                    <span className="text-danger">*</span>
                                    <label>Initials</label>
                                    <Form.Control
                                        type="text"
                                        required
                                        value={signer.nama}
                                        onChange={(e) =>
                                        handleInitialChange(signer.id_item, e.target.value.toLowerCase())
                                        }
                                    />
                                    </Form.Group>
                                </Col>
                                <Col md="12">
                                    <Form.Group>
                                    <Form.Check 
                                        type="radio"
                                        id={1}
                                        label={signer.nama}
                                        className="mt-3 radio-label1"
                                        value="option1"
                                        checked={selectedValues[signer.id_item] === 'option1'}
                                        onChange={(e) => handleRadioChange(e, signer.id_item)}
                                        style={{fontFamily: fontMap["option1"]}}
                                    />
                                    <Form.Check 
                                        type="radio"
                                        id={2}
                                        label={signer.nama}
                                        className="mt-3 radio-label2"
                                        value="option2"
                                        checked={selectedValues[signer.id_item] === 'option2'}
                                        onChange={(e) => handleRadioChange(e, signer.id_item)}
                                        style={{fontFamily: fontMap["option2"]}}
                                    />
                                    <Form.Check 
                                        type="radio"
                                        id={3}
                                        label={signer.nama}
                                        className="mt-3 radio-label3"
                                        value="option3"
                                        checked={selectedValues[signer.id_item] === 'option3'}
                                        onChange={(e) => handleRadioChange(e, signer.id_item)}
                                        style={{fontFamily: fontMap["option3"]}}
                                    />
                                    <Form.Check 
                                        type="radio"
                                        id={4}
                                        label={signer.nama}
                                        className="mt-3 radio-label4"
                                        value="option4"
                                        checked={selectedValues[signer.id_item] === 'option4'}
                                        onChange={(e) => handleRadioChange(e, signer.id_item)}
                                        style={{fontFamily: fontMap["option4"]}}
                                    />
                                    <Form.Check 
                                        type="radio"
                                        id={5}
                                        label={signer.nama}
                                        className="mt-3 radio-label5"
                                        value="option5"
                                        checked={selectedValues[signer.id_item] === 'option5'}
                                        onChange={(e) => handleRadioChange(e, signer.id_item)}
                                        style={{fontFamily: fontMap["option5"]}}
                                    />
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

export default InitialModal;