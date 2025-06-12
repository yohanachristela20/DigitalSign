import { Modal } from "react-bootstrap";
import React, {useRef} from "react";
import SignatureCanvas from "react-signature-canvas";

function SignatureModal ({showSignatureModal, setShowSignatureModal, onSuccess}) {
    const signatureRef = useRef(null);

    return(
        <>
            <Modal
                className="modal-primary"
                show={showSignatureModal}
                onHide={() => setShowSignatureModal(false)}
            >
            <Modal.Header className="text-center pb-1"> 
                <h3 className="mt-3 mb-0">Sign</h3>
            </Modal.Header>
            <Modal.Body>
                <hr />
                <SignatureCanvas 
                    ref={signatureRef}
                    penColor="black"
                    canvasProps={{style: {width: '100%', height: '100%', border: '1px solid black'}}}
                />
            </Modal.Body>

            </Modal>
        </>
    )
}

export default SignatureModal;