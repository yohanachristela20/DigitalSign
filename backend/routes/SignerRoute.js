import express from "express";
import { getSigner, createSigner, getSignerById, getSignerDetails } from "../controllers/SignersController.js";

const router = express.Router();

router.get('/signer', getSigner);
router.get('/signer/:id_signers', getSignerById);
router.post('/signer', createSigner);
router.get('/getSignerDetails', getSignerDetails);


export default router;