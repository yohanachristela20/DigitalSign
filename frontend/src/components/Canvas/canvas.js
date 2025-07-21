import React, {useRef, useEffect, useState} from "react";
import * as pdfjsLib from 'pdfjs-dist/webpack';
import { Document, Page, pdfjs } from "react-pdf";
import ResizableDragable from "components/ResizeDraggable/rnd.js";
import ResizableDragableInitial from "components/ResizeDraggable/rndInitial.js";
import ResizableDragableDate from "components/ResizeDraggable/rndDate.js";
import { useInitial } from "components/Provider/InitialContext.js";
import { useSignature } from "components/Provider/SignatureContext.js";
import { useDateField } from "components/Provider/DateContext.js";

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
    const [width, setWidth] = useState(200);
    const [height, setHeight] = useState(250);
    const [jenis_item, setJenisItem] = useState("");
    const [selectedSigId, setSelectedSigId] = useState("");

    const [signClicked, setSignClicked] = useState(false);
    const [initClicked, setInitClicked] = useState(false);
    const [dateClicked, setDateClicked] = useState(false);

    const {initials, setInitials} = useInitial();
    const {signatures, setSignatures} = useSignature();
    const {dateField, setDateField} = useDateField();

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

    const handleAxisInitial = (id, updatedValues) => {
    setInitials(prev =>
        prev.map(sig =>
        sig.id === id ? { ...sig, ...updatedValues } : sig
        )
    );
    };

    const handleAxisDate = (id, updatedValues) => {
    setDateField(prev =>
        prev.map(sig =>
        sig.id === id ? { ...sig, ...updatedValues } : sig
        )
    );
    };
    
    
    console.log("x_axis:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height);

    useEffect(() => {
    const handleButtonClicked = () => {
        const signButton = localStorage.getItem("signatureClicked"); 
        const initButton = localStorage.getItem("initialClicked");
        const dateButton = localStorage.getItem("dateFieldClicked");

        console.log("signButton clicked from canvas:", signButton);
        console.log("initialButton clicked from canvas:", initButton);
        console.log("dateButton clicked from canvas", dateButton);

        setSignClicked(signButton === "true");
        setInitClicked(initButton === "true");
        setDateClicked(dateButton === "true");
    };

    window.addEventListener("localStorageUpdated", handleButtonClicked);

    handleButtonClicked();

    return() => {
        window.removeEventListener("localStorageUpdated", handleButtonClicked);
    };
    }, []);

    
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
        localStorage.setItem("x_axis", {x_axis});
        localStorage.setItem("y_axis", {y_axis});
        localStorage.setItem("width", {width});
        localStorage.setItem("height", {height});
        localStorage.setItem("jenis_item", {jenis_item});

        window.dispatchEvent(new Event("localStorageUpdated"));
    }, [x_axis, y_axis, width, height, jenis_item]);

    // console.log("x_axis from setItem:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height);

    const deleteObject = (id) => {
        setSignatures(prev => prev.filter(sig => sig.id !== id));
        console.log(`Deleted object with id: ${id}`);
    };

    const deleteInitials = (id) => {
        setInitials(prev => prev.filter(sig => sig.id !== id));
        console.log(`Deleted initials with id: ${id}`);
    };

    const deleteDateField = (id) => {
        setDateField(prev => prev.filter(sig => sig.id !== id));
        console.log(`Deleted date field with id: ${id}`);
    };


    return(
       <div ref={canvasContainerRef}>
        {canvases.length === 0 && <p>Loading PDF...</p>}
            {canvases.map((imgSrc, index) => (
                <img
                    key={index}
                    src={imgSrc}
                    alt={`Page ${index + 1}`}
                    style={{marginBottom: '1rem', border: '1px solid #ccc', boxShadow:"4px 4px 15px rgba(151, 151, 151, 0.5)",}}
                />
            ))}

            {signatures.map(sig => (
                <ResizableDragable 
                    key={sig.id}
                    id={sig.id}
                    x_axis={sig.x_axis}
                    y_axis={sig.y_axis}
                    width={sig.width}
                    height={sig.height}
                    jenis_item={"Signpad"}
                    scale={sig.pageScale}
                    isSelected={selectedSigId === sig.id}
                    onClick={() => setSelectedSigId(sig.id)}
                    onChange={(updated) => handleAxisChange(sig.id, updated)}
                    onDelete={() => deleteObject(sig.id)}
                /> 
            ))}

            {initials.map(sig => (
                <ResizableDragableInitial 
                    key={sig.id}
                    id={sig.id}
                    x_axis={sig.x_axis}
                    y_axis={sig.y_axis}
                    width={sig.width}
                    height={sig.height}
                    jenis_item={"Initialpad"}
                    scale={sig.pageScale}
                    isSelected={selectedSigId === sig.id}
                    onClick={() => setSelectedSigId(sig.id)}
                    onChange={(updated) => handleAxisInitial(sig.id, updated)}
                    onDelete={() => deleteInitials(sig.id)}
                /> 
            ))}

            {dateField.map(sig => (
                <ResizableDragableDate
                    key={sig.id}
                    id={sig.id}
                    x_axis={sig.x_axis}
                    y_axis={sig.y_axis}
                    width={sig.width}
                    height={sig.height}
                    jenis_item={"Date"}
                    scale={sig.pageScale}
                    isSelected={selectedSigId === sig.id}
                    onClick={() => setSelectedSigId(sig.id)}
                    onChange={(updated) => handleAxisDate(sig.id, updated)}
                    onDelete={() => deleteDateField(sig.id)}
                /> 
            ))}
       </div>
    );
};

export default PDFCanvas;