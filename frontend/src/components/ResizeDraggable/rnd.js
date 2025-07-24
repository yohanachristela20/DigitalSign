import React, { useRef, useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { FaSignature } from 'react-icons/fa';
import "../../assets/scss/lbd/_rnd.scss";
import SignatureModal from 'components/ModalForm/SignatureModal.js';

function ResizableDragable ({onChange, x_axis=0, y_axis=0, height=50, width=50, scale=1, onDelete}) {
    const [showSignatureModal, setShowSignatureModal] = React.useState(false);

    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [size, setSize] = useState({ width: 50, height: 50 });
    const [clickCount, setClickCount] = useState(0);
    const timeRef = useRef(null);

    const [signClicked, setSignClicked] = useState(false);
    const [initClicked, setInitClicked] = useState(false);
    const [jenis_item, setJenisItem] = useState("");

    const styleRnd = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: 'rgba(25, 230, 25, 0.5)',
        // position: "relative"
    };

    const handleSignatureSuccess = () => {
    toast.success("Document signed successfully.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
    };
    
    const styleIcon = {
        width: "25%",
        height: "25%",
    }

    const handleClickSign = () => {
        setClickCount(clickCount + 1);
        if (clickCount === 1) {
            timeRef.current = setTimeout(() => {
                setClickCount(0);
            }, 300);
        } else if (clickCount === 2){
            clearTimeout(timeRef.current);
            setClickCount(0);
            setShowSignatureModal(true);
        }
    };

    useEffect(() => {
    const handleButtonClicked = () => {
        const signButton = localStorage.getItem("signatureClicked"); 
        const initButton = localStorage.getItem("initialClicked");

        console.log("SignButton clicked from Upload:", signButton);
        console.log("InitialButton clicked from Upload:", initButton);

        setSignClicked(signButton === "true");
        setInitClicked(initButton === "true");
    };

    window.addEventListener("localStorageUpdated", handleButtonClicked);

    handleButtonClicked();

    return() => {
        window.removeEventListener("localStorageUpdated", handleButtonClicked);
    };
    }, []);

    useEffect(() => {
        setPosition({
            x: x_axis * scale,
            y: y_axis * scale
        });
        setSize({
            width: height * scale,
            height: width * scale
        });

        if (signClicked === true) {
            setJenisItem("Signpad");
        } else if (initClicked === true) {
            setJenisItem("Initialpad");
        }

    }, [x_axis, y_axis, height, width, scale, jenis_item]);

    return(
       <>
        <Rnd
            style={styleRnd}
            size={{ width: size.width, height: size.height }}
            position={{x: position.x, y: position.y}}
            onDragStop={(e, d) => {
                onChange({
                x_axis: d.x / scale,
                y_axis: d.y / scale,
                height: size.width / scale,
                width: size.height / scale,
                });
                setPosition({x: d.x, y: d.y});
                setJenisItem({jenis_item});
            }}
            bounds="parent"
            onResizeStop={(e, direction, ref, delta, position) => {
                const newWidth = parseFloat(ref.style.width);
                const newHeight = parseFloat(ref.style.height);
                onChange({
                    x_axis: position.x / scale,
                    y_axis: position.y / scale,
                    height: newWidth / scale,
                    width: newHeight / scale,
                });
                setPosition({ x: position.x, y: position.y });
                setSize({ width: newWidth, height: newHeight });
                setJenisItem({jenis_item});
            }}
            // onClick={handleClickSign}
            minWidth={120}
            minHeight={80}
            // bounds="parent"
        >
             <button
            onClick={(e) => {
            //   e.stopPropagation();
              if (onDelete) onDelete();
            }}
            style={{
              position: "absolute",
              top: -8,
              right: -8,
              background:'rgba(255, 255, 255, 0.65)',
              color: "black",
              border: "none",
              borderRadius: "50%",
              cursor: "pointer",
              fontWeight: "bold",
              zIndex: 10,
            }}
          >
            ×
          </button>
        <FaSignature style={styleIcon}/>
        </Rnd>
        <SignatureModal showSignatureModal={showSignatureModal} setShowSignatureModal={setShowSignatureModal} onSuccess={handleSignatureSuccess} />
       </>
    )
}

export default ResizableDragable; 
