import express from "express";

import {getSigners,
        getSignersById, 
        createSigner, 
        updateSigners, 
        deleteSigner,
        getLastSignerId,
} from "../controllers/SignerController.js"; 

const router = express.Router(); 

router.get('/signer', getSigners); 
router.get('/signer/:id_signers', getSignersById);
router.post('/signer', createSigner);  
router.patch('/signer/:id', updateSigners);
router.delete('/signer/:id', deleteSigner);
router.get('/getLastSignerId', getLastSignerId);

export default router;