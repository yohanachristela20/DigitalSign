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

dotenv.config();


function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  result.setHours(0, 0, 0, 0);
  return result;
}

const sendReminderEmail = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${year}-${month}-${day}`;

    console.log("Today's date:", formattedDate);

    const logs = await LogSign.findAll({
      where: {
        [Op.or]: [
          { status: "Pending" },
          { status: "Decline" }
        ]
      },
      attributes: [
        "id_logsign", "status", "reminder_date", "reminder_sent", "repeat_freq", "is_deadline", "deadline",
        "id_signers", "delegated_signers", "id_dokumen", "id_karyawan", "id_item", "urutan", "main_token", "delegate_token", "is_delegated"
      ],
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

    const remindersToSend = [];

    for (const log of logs) {
      const repeat = log.repeat_freq;
      const status = log.status;
      const isDeadline = log.is_deadline;
      const deadline = log.deadline ? new Date(log.deadline) : null;
      let reminderDate = log.reminder_date ? new Date(log.reminder_date) : null;

      if (!reminderDate && repeat !== "none" && status === "Pending") {
        let interval = 0;
        if (repeat === "daily") interval = 1;
        else if (repeat === "3days") interval = 3;
        else if (repeat === "weekly") interval = 7;
        else if (repeat === "monthly") interval = 30;
        if (interval > 0) {
          reminderDate = addDays(today, interval);
          await LogSign.update(
            { reminder_date: reminderDate },
            { where: { id_logsign: log.id_logsign } }
          );
          console.log(`Set initial reminder_date for logsign ID ${log.id_logsign}:`, reminderDate);
        }
      }

      console.log("Reminder date:", reminderDate);

      if (repeat === "none" || status === "Decline") {
        if (
          reminderDate &&
          today.getTime() === reminderDate.setHours(0, 0, 0, 0) &&
          !log.reminder_sent
        ) {
          remindersToSend.push(log);
        }
        continue;
      }

      if (status === "Pending") {
        let interval = 0;
        if (repeat === "daily") interval = 1;
        else if (repeat === "3days") interval = 3;
        else if (repeat === "weekly") interval = 7;
        else if (repeat === "monthly") interval = 30;
        else continue;

        if (today.getTime() > deadline) {
          await LogSign.update(
            {status: "Expired"},
            {where: {id_logsign: log.id_logsign}}
          );
          console.log(`Logsign ${log.id_logsign} expired because deadline ${deadline.toISOString().split("T")[0]} < today ${today.toISOString().split("T")[0]}`);
        }

        if (reminderDate && today.getTime() === reminderDate.setHours(0, 0, 0, 0) && !log.reminder_sent) {
          if (isDeadline && deadline) {
            if (today <= deadline) {
              remindersToSend.push(log);
            }
          } else {
            remindersToSend.push(log);
          }
        }
      }
    }

    const uniqueReminders = [];
    const seen = new Set();
    for (const log of remindersToSend) {
      const key = `${log.id_dokumen}-${log.id_signers}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueReminders.push(log);
      }
    }

    for (const log of uniqueReminders) {
      try {
        await sendEmailToSigner(log, [], [], log.token);

        let updateFields = { reminder_sent: true };
        if (["daily", "3days", "weekly", "monthly"].includes(log.repeat_freq) && log.status === "Pending") {
          let interval = 0;
          if (log.repeat_freq === "daily") interval = 1;
          else if (log.repeat_freq === "3days") interval = 3;
          else if (log.repeat_freq === "weekly") interval = 7;
          else if (log.repeat_freq === "monthly") interval = 30;
          updateFields.reminder_date = addDays(new Date(log.reminder_date || today), interval);
          updateFields.reminder_sent = false;
        }

        await LogSign.update(
          updateFields,
          { where: { id_dokumen: log.id_dokumen, id_signers: log.id_signers } }
        );
        console.log(`Reminder sent & marked for document: ${log.id_dokumen} and signer ${log.id_signers}`);
      } catch (error) {
        console.error(`Failed to send email for logsign ID ${log.id_logsign}:`, error.message);
      }
    }
  } catch (err) {
    console.error("Email sending error:", err.message);
  }
};

export default sendReminderEmail;