import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import db from "../config/database.js";
import Karyawan from "../models/KaryawanModel.js";


import {getKaryawan,
        getKaryawanById, 
        createKaryawan, 
        updateKaryawan, 
        deleteKaryawan,
        getLastKaryawanId, 
        getKaryawanDetails,
        karyawanDetails
} from "../controllers/KaryawanController.js"; 

const router = express.Router(); 

const uploadDirectory = './uploads/karyawan';

if (!fs.existsSync(uploadDirectory)) {
        fs.mkdirSync(uploadDirectory, {recursive: true});
}  

const storage = multer.diskStorage({
        destination: (req, file, cb) => {
                cb(null, uploadDirectory);
        },
        filename: (req, file, cb) => {
                cb(null, Date.now() + path.extname(file.originalname));
        }
});

const upload = multer({ storage: storage });

router.get('/employee', getKaryawan); 
router.get('/employee/:id_karyawan', getKaryawanById);
router.post('/employee', createKaryawan);  
router.patch('/employee/:id_karyawan', updateKaryawan);
router.delete('/employee/:id_karyawan', deleteKaryawan);
router.get('/getLastKaryawanId', getLastKaryawanId);
router.get('/employee-details', getKaryawanDetails);
router.get('/detailKaryawan', karyawanDetails);

router.post('/employee/import-csv', upload.single("csvfile"), (req,res) => {
        if (!req.file) {
          return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        
        const filePath = req.file.path;
        const data_karyawan = [];
        
        if (!fs.existsSync('./uploads/karyawan')) {
          fs.mkdirSync('./uploads/karyawan');
        }    
        
        fs.createReadStream(filePath)
        .pipe(csvParser())
        .on("data", (row) => {
          data_karyawan.push({
            id_karyawan: row.id_karyawan,
            nama: row.nama,
            job_title: row.job_title,
            organisasi: row.organisasi,
            sign_base64: row.sign_base64,
          });
        })
        .on("end", async () => {
          try {
            if (data_karyawan.length === 0) {
              throw new Error("File not found.");
            }
        
            await Karyawan.bulkCreate(data_karyawan);
        
            res.status(200).json({
              success: true,
              message: "Employees data have been imported!",
            });
          } catch (error) {
            console.error("Error importing data:", error);
            res.status(500).json({
              success: false,
              message: "Error importing data",
              error: error.message,
            });
          } finally {
            fs.unlinkSync(filePath);
          }
        })
        .on("error", (error) => {
          console.error("Error parsing file:", error);
          res.status(500).json({ success: false, message: "Error parsing file" });
        });
        
});

export default router;