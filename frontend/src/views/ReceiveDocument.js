import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import { FaSignature } from 'react-icons/fa';

import PDFCanvas from "components/Canvas/canvas.js";
import { Rnd } from 'react-rnd';
import SignatureModal from 'components/ModalForm/SignatureModal.js';
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

import { Container, Spinner, Alert } from "react-bootstrap";
import { toast } from "react-toastify";

function ReceiveDocument() {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");
    const [x_axis, setXAxis] = useState(0);
    const [y_axis, setYAxis] = useState(0);
    const [width, setWidth] = useState(0);
    const [height, setHeight] = useState(0);
    const [jenis_item, setJenisItem] = useState("");
    const [fields, setFields] = useState([]);

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const styleRnd = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'rgba(25, 230, 25, 0.5)'
    };

    const styleIcon = {
        width: "25%",
        height: "25%"
    }

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;
                const id_signers = res.data.id_signers;

                // setIdSigner(id_signers);
                // console.log("Id Signer:", idSigner);

                if (!id_dokumen) {
                    throw new Error("Document not found.");
                }

                const fileRes = await fetch(`http://localhost:5000/pdf-document/${id_dokumen}`);
                if (!fileRes.ok) {
                    throw new Error("Failed to get PDF Document.");
                }

                const blob = await fileRes.blob();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);

                const field = await axios.get(`http://localhost:5000/axis-field/${id_dokumen}/${id_signers}`);

                const validFields = field.data
                .filter(item => item.ItemField)
                .map(item => {
                    const {x_axis, y_axis, width, height, jenis_item} = item.ItemField;
                    return {x_axis, y_axis, width, height, jenis_item};
                });

                setFields(validFields);
            } catch (error) {
                console.error("Failed to load PDF:", error.message);
                setErrorMsg(error.message);
                toast.error("Failed to load PDF Document.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [token]);

    return (
        <Container fluid className="mt-3">
            <h5>Preview Document</h5>
            {loading && <Spinner animation="border" variant="primary" />}
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            {!loading && !errorMsg && pdfUrl && (
                <PDFCanvas
                    pdfUrl={pdfUrl}
                />
            )}

            {fields.map((field, index) => (
                <Rnd
                    key={index}
                    style={styleRnd}
                    position={{x: field.x_axis, y: field.y_axis}}
                    size={{width: field.height, height: field.width}}
                    enableResizing={false}
                    disableDragging={true}
                >
                    {console.log("x:", x_axis, "y:", y_axis, "width:", width, "height:", height)}
                    <FaSignature style={styleIcon}/>
                </Rnd>
            ))}
        </Container>
    );
}

export default ReceiveDocument;