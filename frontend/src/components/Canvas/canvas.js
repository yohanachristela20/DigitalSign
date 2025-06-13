import React, {useRef, useEffect, useState} from "react";
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { pdfjs } from "react-pdf";
import ResizableDragable from "components/ResizeDraggable/rnd.js";
import { useSignature } from "components/Provider/SignatureContext.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

const PDFCanvas = ({pdfUrl}) => {
    const canvasRef = useRef(null);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [canvases, setCanvases] = useState([]);
    const canvasContainerRef = useRef(null);
    const {showSignature} = useSignature();
    const [pageScale, setPageScale] = useState(1);

    const [x_axis, setXAxis] = useState(0);
    const [y_axis, setYAxis] = useState(0);
    const [width, setWidth] = useState(150);
    const [height, setHeight] = useState(200);
    const {signatures, setSignatures} = useSignature();

    // const handleAxisChange = ({x_axis, y_axis, width, height}) => {
    //     setXAxis(x_axis);
    //     setYAxis(y_axis);
    //     setWidth(width);
    //     setHeight(height);
    // };
    const handleAxisChange = (id, updatedValues) => {
    setSignatures(prev =>
        prev.map(sig =>
        sig.id === id ? { ...sig, ...updatedValues } : sig
        )
    );
    };
    
    console.log("x_axis:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height);

    
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

    useEffect(() => {
        localStorage.setItem("x_axis", x_axis.toString());
        localStorage.setItem("y_axis", y_axis.toString());
        localStorage.setItem("width", width.toString());
        localStorage.setItem("height", height.toString());

        window.dispatchEvent(new Event("localStorageUpdated"));
    }, [x_axis, y_axis, width, height]);

    // console.log("x_axis from setItem:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height);


    return(
       <div ref={canvasContainerRef} style={{position: 'relative'}}>
        {canvases.length === 0 && <p>Loading PDF...</p>}
            {canvases.map((imgSrc, index) => (
                <img
                    key={index}
                    src={imgSrc}
                    alt={`Page ${index + 1}`}
                    style={{width: '100%', marginBottom: '1rem', border: '1px solid #ccc'}}
                />
            ))}

            {signatures.map(sig => (
                <ResizableDragable 
                    key={sig.id}
                    x_axis={sig.x_axis}
                    y_axis={sig.y_axis}
                    width={sig.width}
                    height={sig.height}
                    scale={sig.pageScale}
                    onChange={(updated) => handleAxisChange(sig.id, updated)}
                /> 
            ))}
       </div>
    );
};

export default PDFCanvas;