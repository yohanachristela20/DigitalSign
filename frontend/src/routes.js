import EmployeeManagement from "views/EmployeeManagement.js";
import ScreeningKaryawan from "views/ScreeningKaryawan.js";
import LaporanPiutang from "views/LaporanPiutangKaryawan.js";
import BerandaFinance from "views/BerandaFinance.js";
import RiwayatPengajuanKaryawan from "views/RiwayatPengajuanKaryawan.js";
import AngsuranKaryawan from "views/AngsuranKaryawan.js";
import MasterUser from "views/MasterUser.js";
import DashboardKaryawan from "views/DashboardKaryawan.js";
import RiwayatPinjamanKaryawan from "views/RiwayatPinjamanKaryawan";
import AngsuranFinance from "views/AngsuranFinance";
import SuratPernyataan from "views/SuratPernyataan";
import Document from "views/Document.js";
import UploadDocument from "views/UploadDocument.js";

import ReceiveDocument from "views/ReceiveDocument.js";
import DocumentSent from "views/DocumentSent.js";

import Login from "views/Login.js";
import PreviewDocument from "views/PreviewDocument";
import { layouts } from "chart.js";

const dashboardRoutes = [
  // ADMIN
  {
    path: "/employee-management",
    name: "Employee Management",
    icon: "users",
    component: EmployeeManagement,
    layout: "/admin"
  },
  {
    path: "/all-document",
    name: "All Document",
    icon: "folder",
    component: Document,
    layout: "/admin"
  },
  {
    path: "/upload-document",
    name: "Upload Document",
    icon: "file",
    component: UploadDocument,
    layout: "/admin"
  },
  {
    path: "/preview-doc",
    name: "Preview Document",
    icon: "file",
    component: PreviewDocument,
    layout: "/admin",
  },
  {
    path: "/document-sent", 
    name: "Document Sent", 
    component: DocumentSent,
    layout: "/admin",
  },

  {
    path: "/envelope",
    name: "Receive Document",
    component: ReceiveDocument,
    layout: "/user"
  },
  


  //LOGIN PAGE
  {
    path: "/login",
    name: "Login",
    icon: "nc-icon nc-single-02",
    component: Login,
    layout: "/"
  },


  //FINANCE 
  {
    path: "/beranda-finance",
    name: "Beranda",
    icon: "nc-icon nc-single-02",
    component: BerandaFinance,
    layout: "/finance"
  },
  {
    path: "/angsuran-finance",
    name: "Angsuran",
    icon: "nc-icon nc-notes",
    component: AngsuranFinance,
    layout: "/finance"
  },
  {
    path: "/laporan-piutang-karyawan",
    name: "Laporan Piutang",
    icon: "nc-icon nc-paper-2",
    component: LaporanPiutang,
    layout: "/finance"
  },

  //KARYAWAN
  {
    path: "/dashboard-karyawan2",
    name: "Beranda",
    icon: "nc-icon nc-chart-pie-35",
    component: DashboardKaryawan,
    layout: "/karyawan"
  },
  // {
  //   path: "/beranda-karyawan",
  //   name: "Beranda",
  //   icon: "nc-icon nc-chart-pie-35",
  //   component: BerandaKaryawan,
  //   layout: "/karyawan"
  // },
  
  // {
  //   path: "/screening-pinjaman",
  //   name: "Screening Pinjaman",
  //   icon: "nc-icon nc-circle-09",
  //   component: ScreeningPinjamanKaryawan,
  //   layout: "/karyawan"
  // },
  // {
  //   path: "/screening2",
  //   name: "Screening Pinjaman 2",
  //   icon: "nc-icon nc-circle-09",
  //   component: ScreeningPinjamanKaryawan2,
  //   layout: "/karyawan"
  // },
  {
    path: "/riwayat-pengajuan",
    name: "Riwayat Pengajuan",
    icon: "nc-icon nc-paper-2",
    component: RiwayatPengajuanKaryawan,
    layout: "/karyawan"
  },
  {
    path: "/riwayat-pinjaman",
    name: "Riwayat Pinjaman",
    icon: "nc-icon nc-money-coins",
    component: RiwayatPinjamanKaryawan,
    layout: "/karyawan"
  },
  {
    path: "/angsuran-karyawan",
    name: "Angsuran",
    icon: "nc-icon nc-notes",
    component: AngsuranKaryawan,
    layout: "/karyawan"
  },


  // SUPER ADMIN
  {
    path: "/master-user",
    name: "Master User",
    icon: "users",
    component: MasterUser,
    layout: "/super-admin"
  },


  {
    path: "/document",
    name: "Document",
    icon: "nc-icon nc-circle-09",
    component: Document,
    layout: "/admin"
  },

  {
    path: "/surat-pernyataan",
    name: "Surat Pernyataan",
    icon: "nc-icon nc-circle-09",
    component: SuratPernyataan,
    layout: "/admin"
  },
  
];

export default dashboardRoutes;
