import KategoriDokumen from "../models/KategoriDokModel.js";
import LogSign from "../models/LogSignModel.js";
import Sign from "../models/SignModel.js";
import Karyawan from "../models/KaryawanModel.js";
import User from "../models/UserModel.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const sendReminderEmail = async (validLogsigns, signLink, subjectt, messagee, documentName, reminder_date) => {
  console.log("reminder_date:", reminder_date);
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS_ADMIN,
      }
    });

    if (validLogsigns.length === 0) return;

    const log = validLogsigns[0];

    const existingLog = await LogSign.findOne({
      where: {id_logsign: log.id_logsign},
    });

    if (!existingLog) {
      console.warn(`Logsign ${log.id_logsign} already deleted, skipping email.`);
      return;
    }

    const receiver = await Karyawan.findOne({
      where: {id_karyawan: log.id_signers},
      include: [{
        model: User,
        as: "Penerima", 
        attributes: ["email"]
      }],
      attributes: ["id_karyawan"]
    }); 

    if (!receiver?.Penerima?.email) {
      console.warn(`Email not found for signer ${log.id_signers}`);
      return;
    }

    const receiverEmail = receiver.Penerima.email;
    const senderName = await Karyawan.findOne({where: {id_karyawan: log.id_karyawan}});
    const receiverName = await Karyawan.findOne({where: {id_karyawan: log.id_signers}});

    const mailOptions = {
      from: process.env.EMAIL_ADMIN,
      to: receiverEmail,
      subject: subjectt.join(', ') || `Reminder to sign document ${documentName}`,
      text: `${receiverName?.nama || "Signer"}, You are requested to sign a document ${documentName} from ${senderName?.nama || "Sender"}.\n
          ${messagee.join(', ') || "Please review and check the document before signing it."}\n
          Click link to sign the document ${signLink}\n\n
          Please do not share this email and the link attached with others.\n
          Regards, \n
          Campina Sign.`
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${receiverEmail} for signer ${log.id_signers}`);

  } catch (err) {
    console.error("Email sending error:", err.message);
    throw err;
  }
};

export default sendReminderEmail;