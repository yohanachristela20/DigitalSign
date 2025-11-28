import KategoriDokumen from "../models/KategoriDokModel.js";
import LogSign from "../models/LogSignModel.js";
import Karyawan from "../models/KaryawanModel.js";
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Op } from "sequelize";
import Dokumen from "../models/DokumenModel.js";
import jwt from 'jsonwebtoken';

const sendEmailToSigner = async (log, subject = [], message = [], token = null) => {
    const now = new Date();

    let receiverEmail;
    let receiverName;
    let senderName;
    let delegateSenderName;

    if (log.is_delegated) {
      const delegatedSigner = await Karyawan.findOne({
        where: { id_karyawan: log.delegated_signers },
        include: [
          { 
            model: User, 
            as: "Penerima",
            attributes: ["email"],
          },
        ],
      }); 

      const delegateSender = await Karyawan.findOne({
        where: {id_karyawan: log.id_signers},
      })

      receiverEmail = delegatedSigner?.Penerima?.email;
      receiverName = delegatedSigner?.nama;
      senderName = delegateSender?.nama;
      token = log.delegate_token;
    } else {
      const mainSigner = await Karyawan.findOne({
        where: { id_karyawan: log.id_signers },
        include: [
          { 
            model: User,
            as: "Penerima",
            attributes: ["email"],
          },
        ],
      });

      const mainSender = await Karyawan.findOne({
        where: {id_karyawan: log.id_karyawan},
      })

      receiverEmail = mainSigner?.Penerima?.email;
      receiverName = mainSigner?.nama;
      senderName = mainSender?.nama;
      token = log.main_token;
    }
    
    if (!receiverEmail) {
      console.warn(`Email doesn't exist for signer ${log.is_delegated ? log.delegated_signers : log.id_signers}`);
      return;
    }

    const jwtSecret = process.env.JWT_SECRET_KEY;
    // token = token;

    const signLink = `http://10.70.10.20:3000/user/envelope?token=${token}`;

    // const senderName = await Karyawan.findOne({where: {id_karyawan: log.id_karyawan}});
  
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
          user: process.env.EMAIL_ADMIN,
          pass: process.env.EMAIL_PASS_ADMIN,
      }
      });

    const mailOptions = {
      from: process.env.EMAIL_ADMIN,
      to: receiverEmail,
      subject: subject.length ? subject.join(', ') : `Reminder to sign document ${log.DocName?.nama_dokumen || ""}`,
      text: `${receiverName || "Signer"}, Please sign a document ${log.DocName?.nama_dokumen || log.id_dokumen } from ${senderName || "Sender"}.\n
          ${ message.length ? message.join(', ') : "Please review and check the document before signing it."}\n
          Click link to sign the document ${signLink}\n\n
          Please do not share this email and the link attached with others.\n
          Regards, \n
          Campina Sign.`
    };

    await transporter.sendMail(mailOptions);
}

export default sendEmailToSigner;