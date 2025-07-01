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

    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    useEffect(() => {
        const fetchData = async () => {
            if (!token) return;

            try {
                const res = await axios.get(`http://localhost:5000/receive-document?token=${token}`);
                const id_dokumen = res.data.id_dokumen;

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
            <h5>Preview Dokumen</h5>
            {loading && <Spinner animation="border" variant="primary" />}
            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            {!loading && !errorMsg && pdfUrl && (
                <PDFCanvas
                    pdfUrl={pdfUrl}
                    // onLoadSuccess={() => console.log("PDF loaded successfully")}
                />
            )}
        </Container>
    );
}

export default ReceiveDocument;