import React, {useState, useEffect} from "react";
import { useLocation } from "react-router-dom";
import PDFCanvas from "components/Canvas/canvas.js";
import {Container, Form} from "react-bootstrap";
import "../assets/scss/lbd/_previewdoc.scss"

function PreviewDocument() {
	const location = useLocation();
	const selectedDoc = location?.state?.selectedDoc || null;
	const [pdfUrl, setPdfUrl] = useState(null);
	const token = localStorage.getItem("token");

  useEffect(() => {
		const fetchPdf = async () => {
			try {
				const url = selectedDoc?.id_dokumen
					? `http://10.70.10.20:5000/pdf-document/${selectedDoc.id_dokumen}`
					: `http://10.70.10.20:5000/pdf-document`;
				const response = await fetch(url, {
					headers: {
							Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
						throw new Error("File not found.");
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

    return(
			<>
				<div>
					<Container fluid className="mt-5 mb-5 px-0">
							<Form>
								<div>
									<h5>Preview</h5>
									<div>
									{pdfUrl? (
									<PDFCanvas pdfUrl={pdfUrl}/>
									) : (
									<p>Loading PDF...</p>  
									)}
									</div>
								</div>
							</Form>
					</Container>
				</div>
			</>
    );
}

export default PreviewDocument;