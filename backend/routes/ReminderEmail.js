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
import sendEmailToSigner from "../helpers/sendEmailHelper.js";
// import  { sendEmailToSigner } from "../helpers/sendEmailHelper.js";

dotenv.config();

const sendReminderEmail = async () => {
  try {
    const logs = await LogSign.findAll({attributes: ['id_logsign', 'status', 'reminder_date', 'reminder_sent']});
    console.log(logs.map(l => ({ id: l.id_logsign, status: l.status, reminder_date: l.reminder_date })));
    // console.log(JSON.stringify(logs, null, 2));

    const today = new Date();
    today.setHours(0, 0, 0, 0); //reset time ke 00:00:00

    const pendingReminders = await LogSign.findAll({
      where: {
        status: "Pending",
        reminder_date: { [Op.lte]: today }, // less than or equal to
        [Op.or]: [
          { reminder_sent: false },
          { reminder_sent: null }
        ]
      }, 
      attributes: ["id_logsign", "status", "reminder_date", "id_signers", "delegated_signers", "id_dokumen", "id_karyawan", "id_item", "urutan", "main_token", "delegate_token", "is_delegated"],
      include: [
        {
          model: Karyawan,
          as: "Signerr", 
          include: [
            {
              model: User,
              as: "Penerima",
              attributes: ["email"]
            }
          ]
        },
        {
          model: Dokumen,
          as: "DocName", 
          attributes: ["nama_dokumen"]
        }
      ]
    });

    console.log("pendingReminders:", pendingReminders);

    // if (pendingReminders.length === 0) {
    //   console.log("Reminder doesn't exist.");
    //   return;
    // }

    const uniqueReminders = [];
    const seen = new Set();

    for (const log of pendingReminders) {
      const key = `${log.id_dokumen}-${log.id_signers}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueReminders.push(log);
      }
    }

    console.log(`Unique reminders after filter: ${uniqueReminders.length}`);


    for (const log of uniqueReminders) {
      try {
        await sendEmailToSigner(log, [], [], log.token);

        await LogSign.update(
          { reminder_sent: true },
          { where: {id_dokumen: log.id_dokumen, id_signers: log.id_signers} }
        );
        console.log(`Reminder sent & marked for document: ${log.id_dokumen} and signer ${log.id_signers}`);
      } catch (error) {
         console.error(`Failed to send email for logsign ID ${log.id_logsign}:`, error.message);
      }
    }

    

    // console.log("Pending Reminders Found:", pendingReminders.map(r => ({
    //   id_logsign: r.id_logsign,
    //   reminder_date: r.reminder_date,
    //   status: r.status
    // })));

  } catch (err) {
    console.error("Email sending error:", err.message);
    // throw err;
  }
};

export default sendReminderEmail;