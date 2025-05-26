import Karyawan from "./KaryawanModel.js";
import User from "./UserModel.js";
import Dokumen from "./DokumenModel.js";
import KategoriDokumen from "./KategoriDokModel.js";
import Item from "./ItemModel.js";
import LogSign from "./LogSignModel.js";
import Sign from "./SignModel.js";
import Signers from "./SignersModel.js";

User.belongsTo(Karyawan, { foreignKey: 'id_karyawan', as: 'Pengguna' });
Dokumen.belongsTo(KategoriDokumen, {foreignKey: 'id_kategoridok', as: 'Kategori'});
Signers.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as: 'Penandatangan'});
Signers.belongsTo(Item, {foreignKey: 'id_item', as: 'ItemField'});
LogSign.belongsTo(Dokumen, {foreignKey: 'id_dokumen', as: 'Dokumen'});
LogSign.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as: 'Pemohon'});
LogSign.belongsTo(Signers, {foreignKey: 'id_signers', as: 'TandaTangan'});
Sign.belongsTo(LogSign, {foreignKey: 'id_logsign', as:'TTDokumen'})

// Pinjaman.belongsTo(Karyawan, { foreignKey: 'id_peminjam', as: 'Peminjam' });
// Pinjaman.belongsTo(Karyawan, { foreignKey: 'id_asesor', as: 'Asesor' });
// AntreanPengajuan.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'AntreanPinjaman'});
// Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'AngsuranPinjaman'});
// Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'SudahDibayar'});
// Angsuran.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'BelumDibayar'});
// Angsuran.belongsTo(Karyawan, {foreignKey: 'id_peminjam', as: 'KaryawanPeminjam'}); 
// PlafondUpdate.belongsTo(Pinjaman, {foreignKey: 'id_pinjaman', as: 'UpdatePinjamanPlafond'});


// Karyawan.hasMany(Pinjaman, { foreignKey: 'id_peminjam', as: 'Peminjam' });
// Karyawan.hasMany(Pinjaman, { foreignKey: 'id_asesor', as: 'Asesor' });
// Pinjaman.hasOne(AntreanPengajuan, {foreignKey: 'id_pinjaman', as: 'AntreanPinjaman'});
// Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'AngsuranPinjaman'});
// Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'SudahDibayar'});
// Pinjaman.hasMany(Angsuran, {foreignKey: 'id_pinjaman', as:'BelumDibayar'});
// Karyawan.hasMany(Angsuran, {foreignKey: 'id_peminjam', as: 'KaryawanPeminjam'}); 
// Pinjaman.hasMany(Angsuran, {foreignKey:'id_peminjam', as:'KaryawanPeminjam'});
// Pinjaman.hasOne(PlafondUpdate, {foreignKey: 'id_pinjaman', as: 'UpdatePinjamanPlafond'});  


Karyawan.hasMany(User, { foreignKey: 'id_karyawan', as:'Pengguna'});
KategoriDokumen.hasMany(Dokumen, {foreignKey: 'id_kategoridok', as:'Kategori'});
Karyawan.hasMany(Signers, {foreignKey: 'id_karyawan', as: 'Penandatangan'});
Item.hasOne(Signers, {foreignKey: 'id_item', as: 'ItemField'});
Dokumen.hasMany(LogSign, {foreignKey: 'id_dokumen', as: 'Dokumen'});
Karyawan.hasMany(LogSign, {foreignKey: 'id_karyawan', as: 'Pemohon'});
Signers.hasMany(LogSign, {foreignKey: 'id_signers', as: 'TandaTangan'});
LogSign.hasOne(Sign, {foreignKey: 'id_logsign', as: 'TTDokumen'});