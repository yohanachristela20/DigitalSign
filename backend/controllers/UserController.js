import User from "../models/UserModel.js";
import Karyawan from "../models/KaryawanModel.js";
import bcrypt from "bcrypt";


export const getUser = async(req, res) => {
    try {
        const response = await User.findAll();
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const getUserById = async(req, res) => {
    try {
        const response = await User.findOne({
            where:{
                id_user: req.params.id_user 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}

export const createUser = async(req, res) => {
    try {
        await User.create(req.body);
        res.status(201).json({msg: "New user has been created!"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const updateUser = async (req, res) => {
    try {
        const { id_user } = req.params;
        const { password, role } = req.body;

        const user = await User.findOne({ where: { id_user } });

        if (!user) {
            return res.status(404).json({ msg: "User not found." });
        }

        const updatedData = { role };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updatedData.password = hashedPassword;
        }

        await User.update(updatedData, { where: { id_user } });

        res.status(200).json({ msg: "User data was updated successfully." });
    } catch (error) {
        console.error("Failed to update user:", error.message);
        res.status(500).json({ message: "Failed to update user." });
    }
};



export const deleteUser = async(req, res) => {
    try {
        await User.destroy({
            where:{
                id_user: req.params.id_user
            }
        });
        res.status(200).json({msg: "User was deleted successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

  export const getUserDetails = async (req, res) => {
    const { email } = req.params;
  
    try {
      const userData = await User.findOne({
        where: { email },
        include: [
          {
            model: Karyawan,
            as: 'Pengguna',
            attributes: ['id_karyawan', 'nama', 'organisasi'],
          },
        ],
      });
  
      if (!userData) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const { id_karyawan, nama, organisasi } = userData.Pengguna;
  
      res.json({
        id_karyawan,
        nama,
        organisasi
      });
    //   console.log("User data: ", userData);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching user details" });
    }
  };

  export const getLastUserId = async (req, res) => {
    try {
        const lastRecord = await User.findOne({
            order: [['id_user', 'DESC']],
        });

        if (lastRecord) {
            return res.status(200).json({ lastId: lastRecord.id_user });
        }
        return res.status(200).json({ lastId: null });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error retrieving last user ID.' });
    }
  }; 

const activeUsers = {};
export const checkUserActivity = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
  
    if (!token) {
      return res.status(401).json({ message: 'Token not found, please sign in again.' });
    }
  
    const jwtSecret = process.env.JWT_SECRET_KEY;
  
    try {
        const decoded = jwt.verify(token, jwtSecret);
        const userId = decoded.id_user;

        // Update aktivitas pengguna
        activeUsers[userId].lastActivity = new Date();
        console.log(`User ${userId} has been active.`);
        next();
    } catch (error) {
        console.error("Error token:", error.message);
        res.status(401).json({ message: 'Expired token.' });
    }
  };