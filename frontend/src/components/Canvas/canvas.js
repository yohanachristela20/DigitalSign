// w/ positioning field when clicked

import React, {useRef, useEffect, useState} from "react";
import * as pdfjsLib from 'pdfjs-dist/webpack';
import ResizableDragable from "components/ResizeDraggable/rnd.js";
import ResizableDragableInitial from "components/ResizeDraggable/rndInitial.js";
import ResizableDragableDate from "components/ResizeDraggable/rndDate.js";
import { useInitial } from "components/Provider/InitialContext.js";
import { useSignature } from "components/Provider/SignatureContext.js";
import { useDateField } from "components/Provider/DateContext.js";
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
import { toast } from "react-toastify";


const PDFCanvas = ({pdfUrl, onPagesRendered}) => {
    const canvasContainerRef = useRef(null);
    const [pdfLoaded, setPdfLoaded] = useState(false);
    const [canvases, setCanvases] = useState([]);
    const {showSignature} = useSignature();
    const [pageScale, setPageScale] = useState(1);
    const [x_axis, setXAxis] = useState("");
    const [y_axis, setYAxis] = useState("");
    const [page, setPage] = useState("");
    const [width, setWidth] = useState(100);
    const [height, setHeight] = useState(150);
    const [jenis_item, setJenisItem] = useState("");
    const [selectedSigId, setSelectedSigId] = useState("");
    const [signClicked, setSignClicked] = useState(false);
    const [initClicked, setInitClicked] = useState(false);
    const [dateClicked, setDateClicked] = useState(false);
    const {initials, setInitials} = useInitial();
    const {signatures, setSignatures} = useSignature();
    const {dateField, setDateField} = useDateField();    

    const handleAxisChange = (id, updatedValues) => {
      setSignatures(prev => {
        const updated = prev.map(sig => 
          sig.id === id ? { ...sig, ...updatedValues } : sig 
        ); 
        const updatedSig = updated.find(sig => sig.id === id);
        if (updatedSig) {
          setWidth(updatedSig.width || "");
          setHeight(updatedSig.height || "");
        }
        return updated;
      });
    };

    const handleAxisInitial = (id, updatedValues) => {
      setInitials(prev => {
        const updated = prev.map(sig => 
          sig.id === id ? { ...sig, ...updatedValues } : sig 
        ); 
        const updatedSig = updated.find(sig => sig.id === id);
        if (updatedSig) {
          setWidth(updatedSig.width || "");
          setHeight(updatedSig.height || "");
        }
        return updated;
      });
    };

    const handleAxisDate = (id, updatedValues) => {
      setDateField(prev => {
        const updated = prev.map(sig => 
          sig.id === id ? { ...sig, ...updatedValues } : sig 
        ); 
        const updatedSig = updated.find(sig => sig.id === id);
        if (updatedSig) {
          setWidth(updatedSig.width || "");
          setHeight(updatedSig.height || "");
        }
        return updated;
      });
    };

    useEffect(() => {
      if (Array.isArray(signatures) && signatures.length > 0){
        const lastSig = signatures[signatures.length - 1];
      } else if (Array.isArray(initials) && initials.length > 0){
        const lastIn = initials[initials.length - 1];
      } else if (Array.isArray(dateField) && dateField.length > 0){
        const lastDate = dateField[dateField.length - 1];
      }

    }, [signatures, initials, dateField, width, height]);

    
    useEffect(() => {
    const handleButtonClicked = () => {
        const signButton = localStorage.getItem("signatureClicked"); 
        const initButton = localStorage.getItem("initialClicked");
        const dateButton = localStorage.getItem("dateFieldClicked");
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
    

  const handleCanvasClick = (e, pageNum) => {
    const activeTool = localStorage.getItem('currentTool');
    
    const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

    if (!activeTool) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x_axis = e.clientX - rect.left;
    const y_axis = e.clientY - rect.top;

    setXAxis(x_axis);
    setYAxis(y_axis);
    setPage(pageNum);


    const signer = localStorage.getItem('currentSigner');
    if (!signer) {
      alert("Signer should have an item before adding a field.");
      return;
    }

    const fieldData = {
      id: generateId(),
      page: pageNum,
      x_axis,
      y_axis,
      width, 
      height, 
      id_karyawan: signer,
      jenis_item: activeTool,
    }

    if (activeTool === "Signpad") {
      const newField = { ...fieldData };
      setSignatures(prev => {
        const updated = [...prev, newField];
        localStorage.setItem("signatures", JSON.stringify(updated));
        return updated;
      });
    } else if (activeTool === "Initialpad") {
      const newField = { ...fieldData };
      setInitials(prev => {
        const updated = [...prev, newField];
        localStorage.setItem("initials", JSON.stringify(updated));
        return updated;
      });
    } else if (activeTool === "Date") {
      const newField = { ...fieldData };
      setDateField(prev => {
        const updated = [...prev, newField];
        localStorage.setItem("dateField", JSON.stringify(updated));
        return updated;
      });
    }
  };

    
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
                    context.font = '14px Arial';
                    context.textAlign = 'right'; 
                    context.fillText(`Page ${pageNum} of ${pdf.numPages}`, canvas.width - 20, canvas.height - 10);
                    renderedCanvases.push({pageNum, imgSrc: canvas.toDataURL()});
                    if (onPagesRendered) {
                      onPagesRendered(pageNum);
                    }
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
        localStorage.setItem("page", {page});

        window.dispatchEvent(new Event("localStorageUpdated"));
    }, [x_axis, y_axis, width, height, jenis_item, page]);

    const deleteObject = (id) => {
        setSignatures(prev => prev.filter(sig => sig.id !== id));
    };

    const deleteInitials = (id) => {
        setInitials(prev => prev.filter(sig => sig.id !== id));
    };

    const deleteDateField = (id) => {
        setDateField(prev => prev.filter(sig => sig.id !== id));
    };


    useEffect(() => {
      const handleCopyAll = () => {
        const fieldData = JSON.parse(localStorage.getItem("copyToAllPagesField"));
        if (!fieldData || canvases.length === 0) return;

        const {x_axis, y_axis, jenis_item, page, id_karyawan} = fieldData;
        const generateId = () => `${Date.now()}-${Math.floor(Math.random() * 100000)}`;

        const newFields = canvases.map((_, idx) => {
          const currentPage = idx + 1;
          if (currentPage === page) return null;
          return {
            id: generateId(),
            page: currentPage, 
            x_axis, 
            y_axis, 
            width, 
            height, 
            jenis_item, 
            id_karyawan,
          }
        }).filter(Boolean);

        if (jenis_item === "Signpad") {
          setSignatures(prev => {
            const updated = [...prev, ...newFields];
            localStorage.setItem("signatures", JSON.stringify(updated));
            return updated;
          });
        } else if (jenis_item === "Initialpad") {
          setInitials(prev => {
            const updated = [...prev, ...newFields];
            localStorage.setItem("initials", JSON.stringify(updated));
            return updated;
          });
        } else if (jenis_item === "Date") {
          setDateField(prev => {
            const updated = [...prev, ...newFields];
            localStorage.setItem("dateField", JSON.stringify(updated));
            return updated;
          });
        }
        toast.success(`Copied ${jenis_item} to all ${canvases.length} pages.`);
      };

      window.addEventListener("copyToAllPages", handleCopyAll);
      return () => window.removeEventListener("copyToAllPages", handleCopyAll);
    }, [canvases, signatures, initials, dateField]);

    return(
       <div ref={canvasContainerRef}>
        {canvases.length === 0 && <p>Loading PDF...</p>}
            {canvases.map((canvas, index) => {
            const pageNumber = index + 1;
            return (
              <div key={pageNumber} className="pdf-page-container" style={{ position: "relative", marginBottom: "1rem" }} data-pagenumber={pageNumber}>
                <img
                  src={canvas.imgSrc}
                  alt={`Page ${canvas.pageNum}`}
                  style={{
                    marginBottom: "1rem",
                    border: "1px solid #ccc",
                    boxShadow: "4px 4px 15px rgba(151, 151, 151, 0.5)",
                  }}
                  onClick={(e) => handleCanvasClick(e, pageNumber)}
                />
                                
                {Array.isArray(signatures) && signatures.length > 0 && signatures
                  .filter(sig => {
                    return Number(sig.page) === Number(pageNumber);
                  })
                  .map(sig => (
                    <ResizableDragable
                      key={sig.id}
                      id={sig.id}
                      x_axis={Number(sig.x_axis)}
                      y_axis={Number(sig.y_axis)}
                      width={Number(sig.width)}
                      height={Number(sig.height)}
                      jenis_item="Signpad"
                      scale={pageScale}
                      page={Number(sig.page)}                 
                      isSelected={selectedSigId === sig.id}
                      onClick={() => setSelectedSigId(sig.id)}
                      onChange={(updated) => handleAxisChange(sig.id, updated)}
                      onDelete={() => deleteObject(sig.id)}
                    />
                ))}

                {Array.isArray(initials) && initials.length > 0 && initials
                  .filter(sig => {
                    return Number(sig.page) === Number(pageNumber);
                  })                  
                  .map(sig => (
                    <ResizableDragableInitial
                      key={sig.id}
                      id={sig.id}
                      x_axis={Number(sig.x_axis)}
                      y_axis={Number(sig.y_axis)}
                      width={Number(sig.width)}
                      height={Number(sig.height)}
                      jenis_item="Initialpad"
                      scale={pageScale}
                      page={Number(sig.page)} 
                      isSelected={selectedSigId === sig.id}
                      onClick={() => setSelectedSigId(sig.id)}
                      onChange={(updated) => handleAxisInitial(sig.id, updated)}
                      onDelete={() => deleteInitials(sig.id)}
                    />
                  ))}

                {Array.isArray(dateField) && dateField.length > 0 && dateField
                  .filter(sig => {
                    return Number(sig.page) === Number(pageNumber);
                  })                  
                  .map(sig => (
                    <ResizableDragableDate
                      key={sig.id}
                      id={sig.id}
                      x_axis={Number(sig.x_axis)}
                      y_axis={Number(sig.y_axis)}
                      width={Number(sig.width)}
                      height={Number(sig.height)}
                      jenis_item="Date"
                      scale={pageScale}
                      page={Number(sig.page)} 
                      isSelected={selectedSigId === sig.id}
                      onClick={() => setSelectedSigId(sig.id)}
                      onChange={(updated) => handleAxisDate(sig.id, updated)}
                      onDelete={() => deleteDateField(sig.id)}
                    />
                  ))}
              </div>
            );
            })}

       </div>
    );
};

export default PDFCanvas;
