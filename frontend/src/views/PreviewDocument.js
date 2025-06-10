import React, {useState, useEffect} from "react";
import { useLocation, useHistory } from "react-router-dom";
import axios from "axios";
import PDFCanvas from "components/Canvas/canvas.js";
import {Button, Container, Row, Col, Card, Table, Spinner, Badge, Form} from "react-bootstrap";
import { Document, Page } from "react-pdf";

function PreviewDocument() {
    const location = useLocation();
    const selectedDoc = location?.state?.selectedDoc || null;
    const [pdfUrl, setPdfUrl] = useState(null);
    const token = localStorage.getItem("token");
    const [x_axis, setXAxis] = useState(0);
    const [y_axis, setYAxis] = useState(0);
    const [panjang, setPanjang] = useState(250);
    const [lebar, setLebar] = useState(150);
    const [pageScale, setPageScale] = useState(1);
    const [id_dokumen, setIdDokumen] = useState("");

  useEffect(() => {
        const fetchPdf = async () => {
            try {
                const url = selectedDoc?.id_dokumen
                    ? `http://localhost:5000/pdf-document/${selectedDoc.id_dokumen}`
                    : `http://localhost:5000/pdf-document`;

                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error("File tidak ditemukan atau gagal diambil");
                }

                const blob = await response.blob();
                const pdfUrl = URL.createObjectURL(blob);
                setPdfUrl(pdfUrl);
            } catch (error) {
                console.error("Error fetching PDF:", error);
            }
        };

        fetchPdf();
    }, [selectedDoc]);


    // useEffect(() => {
    //     if (selectedDoc && selectedDoc.id_dokumen) {
    //         setIdDokumen(selectedDoc.id_dokumen);
    //     }
    // }, [selectedDoc]);

    

    return(
        <>
            <Container fluid>
                <Form>
                    <div>
                        <h5>Preview</h5>
                        {pdfUrl? (
                          <PDFCanvas pdfUrl={pdfUrl} />
                        ) : (
                          <p>Loading PDF...</p>
                          
                        )}
                    </div>
                </Form>
            </Container>
        </>
    );
}

export default PreviewDocument;