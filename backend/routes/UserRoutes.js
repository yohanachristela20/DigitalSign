import express from "express";
import multer from 'multer'; // Import multer for file upload handling
import path from 'path';
import fs from 'fs';
import csvParser from "csv-parser";
import bcrypt from 'bcrypt';
import db from "../config/database.js";
import User from "../models/UserModel.js";
import Karyawan from "../models/KaryawanModel.js";
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import verifyToken from '../middlewares/authMiddleware.js';
import { clearUserSession } from "../middlewares/checkSessionTimeout.js";

dotenv.config();

import {getUser,
        getUserById, 
        createUser, 
        updateUser, 
        deleteUser, 
        getUserDetails, 
        getLastUserId,
        checkUserActivity,
} from "../controllers/UserController.js"; 

const router = express.Router(); 

const uploadDirectory = './uploads/user'

const jwtSecret = process.env.JWT_SECRET_KEY;

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

const activeUsers = {};

router.get('/user', getUser); 
router.get('/user/:id_user', getUserById);
router.post('/user', createUser);  
router.patch('/user/:id_user', updateUser);
router.delete('/user/:id_user', deleteUser);
router.get('/user-details/:email', getUserDetails); 
router.get('/last-id', getLastUserId); 


router.post('/change-password', async (req, res) => {
  const { email, role, oldPassword, newPassword } = req.body;

  // Validasi input
  if (!email || !role || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "Please fill all those fields!" });
  }

  try {
      // Cari user berdasarkan id_user dan role
      const user = await User.findOne({ where: { email, role } });

      if (!user) {
          return res.status(404).json({ message: "User not found!" });
      }

      // Validasi password lama
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
          return res.status(400).json({ message: "Incorrect old password!" });
      }

      // Hash password baru
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await User.update({ password: hashedNewPassword }, { where: { email, role } });

      res.status(200).json({ message: "Password successfully updated!" });

      // history.push("/login"); 
  } catch (error) {
      console.error("Error to change password:", error.message);
      res.status(500).json({ message: "Server error.", error: error.message });
  }
});

// router.post('/user/import-csv', upload.single("csvfile"), (req,res) => {
//         if (!req.file) {
//           return res.status(400).json({ success: false, message: 'No file uploaded' });
//         }
        
//         const filePath = req.file.path;
//         const data_user = [];
//         const defaultPassword = process.env.DEFAULT_PASS; 
        
//         if (!fs.existsSync('./uploads/user')) {
//           fs.mkdirSync('./uploads/user');
//         }    
        
//         fs.createReadStream(filePath)
//         .pipe(csvParser())
//         .on("data", (row) => {
//           const salt =  bcrypt.genSaltSync(10); //salt: data acak untuk hashing/ enkripsi pass
//           const hashedPassword =  bcrypt.hashSync(defaultPassword, salt); 
      
//           data_user.push({
//             id_user: row.id_user,
//             email: row.email,
//             password: hashedPassword, 
//             role: row.role
//           });
//         })
//         .on("end", async () => {
//           try {
//             if (data_user.length === 0) {
//               throw new Error("File not found!");
//             }
            
//             await User.bulkCreate(data_user);
        
//             res.status(200).json({
//               success: true,
//               message: "User data imported to database.",
//             });
//           } catch (error) {
//             console.error("Error importing data:", error);
//             res.status(500).json({
//               success: false,
//               message: "Failed to import data.",
//               error: error.message,
//             });
//           } finally {
//             fs.unlinkSync(filePath);
//           }
//         })
//         .on("error", (error) => {
//           console.error("Error parsing file:", error);
//           res.status(500).json({ success: false, message: "Error parsing file" });
//         });
        
// });

router.post('/user/import-csv', upload.single("csvfile"), async (req,res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  
  const filePath = req.file.path;
  const data_user = [];
  const defaultPassword = process.env.DEFAULT_PASS; 
  
  try {
    if (!fs.existsSync('./uploads/user')) {
      fs.mkdirSync('./uploads/user');
    }    
    
    fs.createReadStream(filePath)
    .pipe(csvParser())
    .on("data", async (row) => {
      const karyawan = await Karyawan.findByPk(row.id_karyawan);
      if (!karyawan) {
        return res.status(400).json({ success: false, message: 'Employee ID not found.' });
      }
      const salt =  bcrypt.genSaltSync(10); //salt: data acak untuk hashing/ enkripsi pass
      const hashedPassword =  bcrypt.hashSync(defaultPassword, salt); 

      // const existingUser = await User.findOne({ where: { email: row.email } });
      // if (existingUser) {
      //   return res.status(400).json({ success: false, message: 'Employee ID not found.' });
      // }

      data_user.push({
        email: row.email,
        password: hashedPassword, 
        role: row.role,
        // user_active: true,
        id_karyawan: row.id_karyawan,
      });
    })
    .on("end", async () => {
      try {
        if (data_user.length === 0) {
          throw new Error("No valid user data to import.");
        }
        
        await User.bulkCreate(data_user);
    
        res.status(200).json({
          success: true,
          message: `${data_user.length} users imported successfully.`,
        });
      } catch (error) {
        console.error("Error importing data:", error);
        res.status(500).json({
          success: false,
          message: "Failed to import data.",
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
  } catch (error) {
    
  }
        
});

router.post('/user-login', async (req, res) => {
    const { email, password, role, user_active} = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: "Please fill all those fields!" });
    }

    try {
        const user = await User.findOne({
            where: {email, role}, 
        }); 

        if (user.user_active === true) {
          return res.status(400).json({message: "User is already sign in. Please sign out first!"}); 
        }

        if (!user) {
          return res.status(400).json({message: "User not found!."}); 
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return res.status(400).json({ message: 'Incorrect password.' });
        }

        const jwtSecret = process.env.JWT_SECRET_KEY;

        if (!jwtSecret) {
            return res.status(500).json({ message: "The JWT Secret key is not set in the .env file." });
        }

        const token = jwt.sign(
            { id: user.id_user, role: user.role },
            jwtSecret, 
        );


        await User.update(
          {user_active: true},
          { 
            where: {id_user: user.id_user},
          }
        );
    
        res.status(200).json({ token, role, email, user_active});
 
    } catch (error) {
        console.error("Error sign in:", error);
        res.status(500).json({ message: "Server error.", error: error.message });
    }
});

router.put('/user/:id_user', async (req, res) => {
  const { id_user } = req.params;
  const defaultPassword = process.env.DEFAULT_PASS; 
  let { password } = req.body;

  try {

    const user = await User.findByPk(id_user);

    user.password = defaultPassword;

    if (user.password) {
      const salt = await bcrypt.genSalt(10); //salt: data acak untuk hashing/ enkripsi pass
      user.password = await bcrypt.hash(user.password, salt); 
  }

    await user.save();

    res.status(200).json({ message: 'Password updated succesfully!', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/heartbeat', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1]; 

  if (!token) {
    return res.status(401).json({ message: 'Token not found, please sign in again.' });
  }

  const jwtSecret = process.env.JWT_SECRET_KEY;

  try {
    const decoded = jwt.verify(token, jwtSecret); 
    const userId = decoded?.id_user;
    // console.log("userId:", userId);

    const currentTime = new Date();
    activeUsers[userId] = currentTime;

    // await User.update(
    //   {user_active: false},
    //   { 
    //     where: {userId},
    //   }
    // );

    // console.log(`Aktivitas terbaru pengguna ${userId}: ${currentTime}`); 
    res.status(200).json({ message: 'Received Heartbeat' }); 
  } catch (error) {
    console.error("Token error: ", error.message); 
    res.status(401).json({message: 'Expired token.'});
  }
});

router.post('/logout', async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token not found." });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
  const userId = decoded?.id;
  // const idUser = decoded?.id;


  await User.update(
    {user_active: false}, 
    {
      where: {id_user: userId},
    }
  )

  clearUserSession(userId);
  console.log(`User session ${userId} was deleted.`);

  return res.status(200).json({ message: "Sign out was successful!" });

});

router.patch('/delete-session/:id_user', async (req, res) => {
  try {
      const { id_user } = req.params;

      const user = await User.findOne({ where: { id_user } });

      if (!user) {
          return res.status(404).json({ msg: "User not found!" });
      }

      await User.update(
        {user_active: false}, 
        {
          where: {id_user: id_user}
        }
      );

      clearUserSession(id_user);
      console.log(`User session ${id_user} was deleted.`);

      res.status(200).json({ 
        msg: "User session was successfully deleted.",
        redirect: "/login" });
      
  } catch (error) {
      console.error("Failed to delete user session:", error.message);
      res.status(500).json({ message: "Failed to delete user session." });
  }
});

router.post('/logout-user/:id_user', async(req,res) => {
  try {
    const { id_user } = req.params;

    const user = await User.findOne({ where: { id_user } });

    if (!user) {
        return res.status(404).json({ msg: "User not found." });
    }

    await User.update(
      {user_active: false}, 
      {
        where: {id_user: id_user}
      }
    );

    clearUserSession(id_user);
    console.log(`User session ${id_user} was successfully deleted.`);

    res.status(200).json({ 
    msg: "User session was successfully deleted."});

    // console.log("user active:", user.user_active);

    // res.redirect('/');
    
} catch (error) {
    console.error("Failed to delete user session:", error.message);
    res.status(500).json({ message: "Failed to delete user session." });
}
});

export default router;
