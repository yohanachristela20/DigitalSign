import express from "express";

import {
    getLastLogsignId,
    getLogSign,
    updateItem,
    updateLogsign,
    updatePermission,
    // updateReminder, 
} from "../controllers/LogSignController.js";
import LogSign from "../models/LogSignModel.js";
import Dokumen from "../models/DokumenModel.js";

const router = express.Router();

router.get('/logsign', getLogSign);
router.patch('/logsign/:id_dokumen/:id_item/:id_signers', updateLogsign);
// router.patch('/update-reminder/:id_dokumen', updateReminder);
router.get('/getLastLogsignId', getLastLogsignId);

router.patch('/update-permission/:id_dokumen/:id_signers', updatePermission);
router.post('/newItem/:id_dokumen/:id_signers', updateItem);

router.get('/count-needsToSign', async (req, res) => {
	try {
		const jumlahNeedsToSign = await LogSign.count({
			distinct : true, 
			col: 'id_logsign',
			where: {
				sign_permission: "Needs to sign"
			}
		});

		if (jumlahNeedsToSign === null || jumlahNeedsToSign === undefined) {
			return res.status(404).json({ message: "Null document to sign." });
		} 

		const jumlah_needsToSign = jumlahNeedsToSign || 0;
		res.status(200).json({ jumlahNeedsToSign: jumlah_needsToSign });

	} catch (error) {
		console.error("Error fetching Needs to sign:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
});

router.get('/count-needsToSign/:id_kategoridok', async (req, res) => {
	const {id_kategoridok} = req.params;
	try {
		const jumlahNeedsToSign = await LogSign.count({
			distinct : true, 
			col: 'id_logsign',
			include: [
				{
						model: Dokumen,
						as: 'Dokumen',
						attributes: ['id_kategoridok'], 
						where: {id_kategoridok}
				}
			],
			where: {
				sign_permission: "Needs to sign"
			}
		});

		if (jumlahNeedsToSign === null || jumlahNeedsToSign === undefined) {
			return res.status(404).json({ message: "Null document to sign." });
		} 

		const jumlah_needsToSign = jumlahNeedsToSign || 0;
		res.status(200).json({ jumlahNeedsToSign: jumlah_needsToSign });

	} catch (error) {
		console.error("Error fetching Needs to sign:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
});

router.get('/count-pendingDoc', async (req, res) => {
	try {
		const jumlahPending = await LogSign.count({
			distinct : true, 
			col: 'id_logsign',
			where: {
				sign_permission: "Needs to sign", status: "Pending"
			}
		});

		if (jumlahPending === null || jumlahPending === undefined) {
			return res.status(404).json({ message: "Null document to sign." });
		} 

		const jumlah_pending = jumlahPending || 0;
		res.status(200).json({ jumlahPending: jumlah_pending });

	} catch (error) {
		console.error("Error fetching Needs to sign:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
});

router.get('/count-pendingDoc/:id_kategoridok', async (req, res) => {
	const {id_kategoridok} = req.params;
	try {
		const jumlahPending = await LogSign.count({
			distinct : true, 
			col: 'id_logsign',
			include: [
				{
						model: Dokumen,
						as: 'Dokumen',
						attributes: ['id_kategoridok'], 
						where: {id_kategoridok}
				}
			],
			where: {
				sign_permission: "Needs to sign", status: "Pending"
			}
		});

		if (jumlahPending === null || jumlahPending === undefined) {
			return res.status(404).json({ message: "Null document to sign." });
		} 

		const jumlah_pending = jumlahPending || 0;
		res.status(200).json({ jumlahPending: jumlah_pending });

	} catch (error) {
		console.error("Error fetching Needs to sign:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
});

router.get('/count-completed', async (req, res) => {
	try {
		const jumlahCompleted = await LogSign.count({
			distinct : true, 
			col: 'id_logsign',
			where: {
				sign_permission: "Needs to sign", status: "Completed"
			}
		});

		if (jumlahCompleted === null || jumlahCompleted === undefined) {
			return res.status(404).json({ message: "Null document to sign." });
		} 

		const jumlah_completed = jumlahCompleted || 0;
		res.status(200).json({ jumlahCompleted: jumlah_completed });

	} catch (error) {
		console.error("Error fetching Needs to sign:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
});

router.get('/count-completed/:id_kategoridok', async (req, res) => {
	const {id_kategoridok} = req.params;
	try {
		const jumlahCompleted = await LogSign.count({
			distinct : true, 
			col: 'id_logsign',
			include: [
				{
						model: Dokumen,
						as: 'Dokumen',
						attributes: ['id_kategoridok'], 
						where: {id_kategoridok}
				}
			],
			where: {
				sign_permission: "Needs to sign", status: "Completed"
			}
		});

		if (jumlahCompleted === null || jumlahCompleted === undefined) {
			return res.status(404).json({ message: "Null document to sign." });
		} 

		const jumlah_completed = jumlahCompleted || 0;
		res.status(200).json({ jumlahCompleted: jumlah_completed });

	} catch (error) {
		console.error("Error fetching Needs to sign:", error.message);
		res.status(500).json({ message: "Internal server error" });
	}
});

export default router;