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
LogSign.belongsTo(Dokumen, {foreignKey: 'id_dokumen', as: 'Dokumen'});
LogSign.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as: 'Pemohon'});
LogSign.belongsTo(Signers, {foreignKey: 'id_signers', as: 'TandaTangan'});
Sign.belongsTo(LogSign, {foreignKey: 'id_logsign', as:'TTDokumen'})

Karyawan.hasMany(User, { foreignKey: 'id_karyawan', as:'Pengguna'});
KategoriDokumen.hasMany(Dokumen, {foreignKey: 'id_kategoridok', as:'Kategori'});
Karyawan.hasMany(Signers, {foreignKey: 'id_karyawan', as: 'Penandatangan'});
Dokumen.hasMany(LogSign, {foreignKey: 'id_dokumen', as: 'Dokumen'});
Karyawan.hasMany(LogSign, {foreignKey: 'id_karyawan', as: 'Pemohon'});
Signers.hasMany(LogSign, {foreignKey: 'id_signers', as: 'TandaTangan'});
LogSign.hasOne(Sign, {foreignKey: 'id_logsign', as: 'TTDokumen'});