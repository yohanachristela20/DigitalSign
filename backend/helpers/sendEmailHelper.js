import KategoriDokumen from "../models/KategoriDokModel.js";
import LogSign from "../models/LogSignModel.js";
import Sign from "../models/SignModel.js";
import Karyawan from "../models/KaryawanModel.js";
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { Op } from "sequelize";
import Dokumen from "../models/DokumenModel.js";
import jwt from 'jsonwebtoken';

const sendEmailToSigner = async (log, subject = [], message = [], token = null) => {
    const now = new Date();
    const receiverEmail = log.Signerr?.Penerima?.email;
      if (!receiverEmail) {
        console.warn(`Email doesn't exist for signer ${log.id_signers}`);
        return;
      }

      const jwtSecret = process.env.JWT_SECRET_KEY;
      token = token;

      const signLink = `http://localhost:3000/user/envelope?token=${token}`;

      const senderName = await Karyawan.findOne({where: {id_karyawan: log.id_karyawan}});
      const receiverName = await Karyawan.findOne({where: {id_karyawan: log.id_signers}});

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
        text: `${receiverName?.nama || "Signer"}, Please sign a document ${log.DocName?.nama_dokumen } from ${senderName?.nama || "Sender"}.\n
            ${ message.length ? message.join(', ') : "Please review and check the document before signing it."}\n
            Click link to sign the document ${signLink}\n\n
            Please do not share this email and the link attached with others.\n
            Regards, \n
            Campina Sign.`
      };

      await transporter.sendMail(mailOptions);
      console.log("Now:", now);

      console.log(`Email sent to ${receiverEmail} for signer ${log.id_signers}`);
}

// module.exports = { sendEmailToSigner };

export default sendEmailToSigner;