import Karyawan from "./KaryawanModel.js";
import User from "./UserModel.js";
import Dokumen from "./DokumenModel.js";
import KategoriDokumen from "./KategoriDokModel.js";
import Item from "./ItemModel.js";
import LogSign from "./LogSignModel.js";
import Sign from "./SignModel.js";
import Signers from "./SignersModel.js";

User.belongsTo(Karyawan, { foreignKey: 'id_karyawan', as: 'Pengguna' });
User.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as: 'Penerima'});

// LogSign.belongsTo(Signers, {foreignKey: 'id_parent_signers', as:'Signer'});
Dokumen.belongsTo(KategoriDokumen, {foreignKey: 'id_kategoridok', as: 'Kategori'});
LogSign.belongsTo(Dokumen, {foreignKey: 'id_dokumen', as: 'Dokumen'});
LogSign.belongsTo(Dokumen, {foreignKey: 'id_dokumen', as: 'DocName'});
LogSign.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as: 'Pemohon'});
LogSign.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as: 'Signer'});
LogSign.belongsTo(Karyawan, {foreignKey: 'id_signers', as: 'Signerr'});

Sign.belongsTo(LogSign, {foreignKey: 'id_logsign', as:'TTDokumen'});
LogSign.belongsTo(Item, {foreignKey: 'id_item', as: 'ItemField'});
Signers.belongsTo(Karyawan, {foreignKey: 'id_karyawan', as:'Penandatangan'});

KategoriDokumen.hasMany(Dokumen, {foreignKey: 'id_kategoridok', as:'Kategori'});
Dokumen.hasMany(LogSign, {foreignKey: 'id_dokumen', as: 'Dokumen'});
Dokumen.hasOne(LogSign, {foreignKey: 'id_dokumen', as: 'DocName'});
Karyawan.hasMany(LogSign, {foreignKey: 'id_karyawan', as: 'Pemohon'});
Karyawan.hasMany(LogSign, {foreignKey: 'id_karyawan', as: 'Signer'});
Karyawan.hasMany(LogSign, {foreignKey: 'id_signers', as: 'Signerr'});

LogSign.hasOne(Sign, {foreignKey: 'id_logsign', as: 'TTDokumen'});
Item.hasOne(LogSign, {foreignKey: 'id_item', as:'ItemField'});
Karyawan.hasMany(Signers, {foreignKey:'id_karyawan', as:'Penandatangan'});

Karyawan.hasMany(User, { foreignKey: 'id_karyawan', as:'Pengguna'});

Karyawan.hasOne(User, {foreignKey: 'id_karyawan', as: 'Penerima'});
// Signers.hasMany(LogSign, {foreignKey: 'id_parent_signers', as: 'Signer'});
