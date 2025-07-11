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
    const [selectedValue, setSelectedValue] = useState('option1');
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

    // useEffect(() => {
    //     const fetchData = async () => {
    //         if (!token) return;

    //         try {
    //             const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
    //             const id_dokumen = res.data.id_dokumen;
    //             setIdDokumen(id_dokumen);
    //             const id_signers = res.data.id_signers;
    //             setIdSigner(id_signers);

    //             console.log("ID Dokumen:", id_dokumen);
    //             console.log("ID Signers:", id_signers);

    //             const signerArray = Array.isArray(id_signers) ? id_signers : [id_signers];
    //             const namaArray = [];

    //             for (const signer of signerArray) {
    //                 const response = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${signer}`);
    //                 const data = response.data;

    //                 if (data.length > 0 && data[0].Signerr) {
    //                     // setNama(data[0].Signerr.nama);
    //                     namaArray.push(data[0].Signerr.nama);


    //                     setIdItem(data[0].id_item);
    //                     setIdSigner(data[0].id_signers);
    //                     // console.log("Nama Signer:", data[0].Signerr.nama);
    //                     console.log("Item:", data[0].id_item);
    //                     console.log("Signer:", id_signers);
    //                 }

    //                 data.filter(item => item.ItemField)
    //                 .forEach((item, idx) => {
    //                     const {width, height} = item.ItemField;

    //                     setWidth(height);
    //                     setHeight(width)

    //                     console.log("Widthhhh:", width);
    //                     console.log("Height: ", height);

    //                 });
    //             }
    //             setNama(namaArray);
    //             console.log("Nama array:", nama)
    //         } catch (error) {
    //             console.error("Failed to load PDF:", error.message);
    //             // setErrorMsg(error.message);
    //             // toast.error("Failed to load PDF Document.");
    //         } 
    //     };

    //     fetchData();
    // }, [token]);

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
                        // setNama(data[0].Signerr.nama);
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
                // if (allSignerData.length > 0) {
                //     setIdItem(allSignerData[0].id_item);
                // }
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
                // setErrorMsg(error.message);
                // toast.error("Failed to load PDF Document.");
            } 
        };

        fetchData();
    }, [token]);

    const handleRadioChange = (id_item, selectedValue) => {
        const updated = signerData.map((item) =>
            item.id_item === id_item ? { ...item, selectedValue } : item
        );
        setSignerData(updated);
    }

    // const handleInitialChange = (value) => {
    //     const alphabetValue = value.replace(/[^a-zA-Z\s]/g, "");
    //     setInitialName(alphabetValue);
    // };

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

    // useEffect(() => {
    //     if (nama) {
    //         setInitialName(nama);
    //     }
    // }, [nama]);

    useEffect(() => {
        if (!id_item || signerData.length === 0) return;
        const found = signerData.find(s => s.id_item === id_item);
        if (found) {
            setInitialName(found.nama);
        }
    }, [id_item, signerData]);

    // const generateImageBase64 = (initialName, fontFamily = "Arial") => {
    //     console.log("Initial name:", initialName);
    //     const canvas = document.createElement("canvas");
    //     const ctx = canvas.getContext("2d");

    //     canvas.width = 200;
    //     canvas.height = 100;

    //     ctx.clearRect(0,0, canvas.width, canvas.height);
    //     ctx.font = `48px '${fontFamily}', cursive`;
    //     ctx.fillStyle = "black";
    //     ctx.textAlign = "center";
    //     ctx.textBaseline = "middle";
    //     ctx.fillText(initialName, canvas.width / 2, canvas.height /2);

    //     return canvas.toDataURL("image/png");
    // };

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

    const updateInitialSign = async (id_dokumen, id_item, id_signers) => {
    console.log("Data dokumen:", id_dokumen, id_item, id_signers);
    const font = fontMap[selectedValue] || "Arial";
    const today = new Date();

        try {
            const sign_base64 = await generateImageBase64(initialName, font);
            console.log("Hasil Base64:", sign_base64?.substring(0, 100));

            if (!sign_base64) {
                toast.error("Gagal membuat tanda tangan (canvas kosong).");
                return;
            }

            const response = await axios.patch(`http://localhost:5000/initialsign/${id_dokumen}/${id_item}/${id_signers}`, {
                sign_base64: sign_base64,
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


    const handleSubmit = async(e) => {
        e.preventDefault();
        await updateInitialSign(id_dokumen, id_item, id_signers);
        window.location.reload();
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
                    backdrop="static"
                    keyboard={false}
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
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <Form.Check
                                        key={val}
                                        type="radio"
                                        id={`${signer.id_item}-option${val}`}
                                        label={signer.nama}
                                        className={`mt-3 radio-label${val}`}
                                        value={`option${val}`}
                                        checked={signer.selectedValue === `option${val}`}
                                        onChange={(e) =>
                                            handleRadioChange(signer.id_item, e.target.value)
                                        }
                                        style={{ fontFamily: fontMap[`option${val}`] }}
                                        />
                                    ))}
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