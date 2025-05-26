import Category from "views/Category.js";
import ScreeningKaryawan from "views/ScreeningKaryawan.js";
import Angsuran from "views/Angsuran.js";
import LaporanPiutang from "views/LaporanPiutangKaryawan.js";
import MasterKaryawan from "views/MasterKaryawan.js";
import ScreeningKaryawanManual from "views/ScreeningKaryawanManual.js";
import BerandaFinance from "views/BerandaFinance.js";
import BerandaKaryawan from "views/BerandaKaryawan.js";
import ScreeningPinjamanKaryawan from "views/ScreeningPinjamanKaryawan.js";
import ScreeningPinjamanKaryawan2 from "views/ScreeningPinjamanKaryawan2.js";
import RiwayatPengajuanKaryawan from "views/RiwayatPengajuanKaryawan.js";
import AngsuranKaryawan from "views/AngsuranKaryawan.js";
import MasterUser from "views/MasterUser.js";
import DashboardKaryawan from "views/DashboardKaryawan.js";
import RiwayatPinjamanKaryawan from "views/RiwayatPinjamanKaryawan";
import AngsuranFinance from "views/AngsuranFinance";
import SuratPernyataan from "views/SuratPernyataan";
import DataBarang from "views/DataBarang.js";

import MasterBarang from "views/MasterBarang";
import MasterVendor from "views/MasterVendor";

import Login from "views/Login.js";
import { layouts } from "chart.js";


const dashboardRoutes = [
  // ADMIN
  {
    path: "/category",
    name: "Documents",
    icon: "box-open",
    component: Category,
    layout: "/admin"
  },
  // {
  //   path: "/beranda",
  //   name: "Drafts",
  //   icon: "file-signature",
  //   component: Beranda,
  //   layout: "/admin"
  // },
  // {
  //   path: "/beranda",
  //   name: "Trash",
  //   icon: "trash",
  //   component: Beranda,
  //   layout: "/admin"
  // },

  // {
  //   path: "/beranda",
  //   name: "Folders",
  //   icon: "folder",
  //   component: Beranda,
  //   layout: "/admin", 
  //   children: [
  //     {
  //       path: "/subdoc1", 
  //       name: "Sub doc 1",
  //       icon: "file-alt",
  //       component: Beranda,
  //       layout: "/admin"
  //     },
  //     {
  //       path: "/subdoc2", 
  //       name: "Sub doc 2",
  //       icon: "file-alt",
  //       component: Beranda,
  //       layout: "/admin"
  //     },
  //   ],
  // },
  


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
    path: "/screening-karyawan",
    name: "Screening Karyawan",
    icon: "nc-icon nc-circle-09",
    component: ScreeningKaryawan,
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
