import React, {useRef, useEffect, useState} from "react";
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { pdfjs } from "react-pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFCanvas = ({pdfUrl}) => {
    const canvasRef = useRef(null);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [canvases, setCanvases] = useState([]);
    
    useEffect(() => {
        const loadPdf = async() => {
            try {
                const loadingTask = pdfjsLib.getDocument(pdfUrl);
                const pdf = await loadingTask.promise;

                const renderedCanvases = [];

                for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                    const page = await pdf.getPage(pageNum);
                    const scale = 1.5;
                    const viewport = page.getViewport({scale});

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');

                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    const renderContext = {
                        canvasContext: context,
                        viewport: viewport,
                    };

                    await page.render(renderContext).promise;
                    renderedCanvases.push(canvas.toDataURL());
                }
                setCanvases(renderedCanvases);
            } catch (error) {
                console.error('Error loading or rendering PDF: ', error);
            }
        };

        if (pdfUrl) {
            loadPdf();
        }
    }, [pdfUrl]);

    return(
        <>
            {canvases.length === 0 && <p>Loading PDF...</p>}
            {canvases.map((imgSrc, index) => (
                <img
                    key={index}
                    src={imgSrc}
                    alt={`Page ${index + 1}`}
                    style={{width: '100%', marginBottom: '1rem', border: '1px solid #ccc'}}
                />
            ))}
        </>
    );
};

export default PDFCanvas;