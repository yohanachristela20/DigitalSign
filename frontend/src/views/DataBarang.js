import React, { useEffect, useState } from "react";
import {FaFileCsv, FaFileImport, FaFilePdf, FaPlusCircle, FaSortDown, FaSortUp, FaRegEdit, FaTrashAlt} from 'react-icons/fa'; 
import SearchBar from "components/Search/SearchBar.js";
import axios from "axios";
import AddDetailBarang from "components/ModalForm/AddDetailBarang";
import EditDetailBarang from "components/ModalForm/EditDetailBarang.js";
import ImportMasterBarang from "components/ModalForm/ImportMasterBarang.js"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import jsPDF from "jspdf";
import "jspdf-autotable";
import Pagination from "react-js-pagination";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_table-header.scss";
import ReactLoading from "react-loading";
import "../assets/scss/lbd/_loading.scss";

import {
  Button,
  Card,
  Container,
  Row,
  Col,
  Table, 
  Spinner  
} from "react-bootstrap";

function DataBarang() {
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = useState(false); 
  const [dataBarang, setDataBarang] = useState([]); 
  const [selectedBarang, setSelectedBarang] = useState(null); 
  const [searchQuery, setSearchQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);

  const [sortBy, setSortBy] = useState("id_barang");
  const [sortOrder, setSortOrder] = useState("asc");
  const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");

  const filteredBarang = dataBarang.filter((dataBarang) =>
    (dataBarang.id_barang && String(dataBarang.id_barang).toLowerCase().includes(searchQuery)) ||
    (dataBarang.nama_barang && String(dataBarang.nama_barang).toLowerCase().includes(searchQuery)) ||
    (dataBarang.id_sap && (dataBarang.id_sap).toLowerCase().includes(searchQuery)) ||
    (dataBarang.id_detailbarang && (dataBarang.id_detailbarang).includes(searchQuery))
  );

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  }

  const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  }

  
  const sortedBarang = filteredBarang.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];

    if (sortOrder === "asc") {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0; 
    } else {
      return bValue < aValue ? -1 : bValue > aValue ? 1 : 0; 
    }

  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBarang.slice(indexOfFirstItem, indexOfLastItem);

  const token = localStorage.getItem("token");

  useEffect(()=> {
    getDataBarang();
    setTimeout(() => setLoading(false), 1000)
  }, []); 

  const getDataBarang = async () =>{
    try {
      // setLoading(true);
      const response = await axios.get("http://localhost:5000/data-barang", {
        headers: {
          Authorization: `Bearer ${token}`,
      },
      });
      setDataBarang(response.data);
      // console.log("Plafond:", response.data)
    } catch (error) {
      console.error("Error fetching data:", error.message); 
    // } finally {
    //   setLoading(false);
    }
  };

  const formatRupiah = (angka) => { 
    let gajiString = angka.toString().replace(".00");
    let sisa = gajiString.length % 3;
    let rupiah = gajiString.substr(0, sisa);
    let ribuan = gajiString.substr(sisa).match(/\d{3}/g);

    if (ribuan) {
        let separator = sisa ? "." : "";
        rupiah += separator + ribuan.join(".");
    }
    
    return rupiah;
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value.toLowerCase());
  };

  const handleAddSuccess = () => {
    getDataBarang();
    toast.success("Data barang berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
};

const handleEditSuccess = () => {
  getDataBarang();
  toast.success("Data barang berhasil diperbarui!", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
  });
};

const handleImportButtonClick = () => {
  setShowImportModal(true);
}

const handleImportSuccess = () => {
  getDataBarang();
  // toast.success("Plafond berhasil diimport!", {
  //     position: "top-right",
  //     autoClose: 5000,
  //     hideProgressBar: true,
  // });
};

const deleteBarang = async(id_barang) => {
  try {
    await axios.delete(`http://localhost:5000/data-barang/${id_barang}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });
    toast.success("Data barang berhasil dihapus.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
    });

    getDataBarang();
  } catch (error) {
    console.log(error.message);
  }
}

const downloadCSV = (data) => {
  const header = ["id_plafond", "tanggal_penetapan", "jumlah_plafond", "keterangan", "tanggal_penetapan", "updatedAt"];
  const rows = data.map((item) => [
    item.id_plafond,
    item.tanggal_penetapan,
    item.jumlah_plafond,
    item.keterangan,
    item.createdAt,
    item.updatedAt
  ]);

  const csvContent = [header, ...rows]
    .map((e) => e.join(","))
    .join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "master_plafond.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const downloadPDF = (data) => {
  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(12); 
  doc.text("Master Barang", 12, 20);

  const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
  
    doc.setFontSize(12); 
    doc.text(`Tanggal cetak: ${formattedDate}`, 12, 30);

  const headers = [["ID Detail Barang", "Nama Barang", "Satuan", "Harga Barang", "Jenis Barang", "Dibuat"]];

  const rows = data.map((item) => [
    item.id_barang,
    item.nama_barang,
    item.satuan,
    item.harga_barang,
    item.jenis_barang,
    item.tanggal_penetapan,
    // item.updatedAt,
    // (item.updatedAt).tz('+0700').format('YYYY-MM-DD HH:mm'),
  ]);

  const marginTop = 15; 

  doc.autoTable({
    startY: 20 + marginTop, // Posisi Y awal
    head: headers,
    body: rows,
    styles: { fontSize: 12 }, // Ukuran font tabel
    headStyles: { fillColor: [3, 177, 252] }, // Warna header tabel
  });

  doc.save("data_barang.pdf");
};

  return (
    <>
    {loading === false ? 
      (<div className="App">
        <Container fluid>
        <Row>
            <div>
              <Button
                className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
                type="button"
                variant="success"
                onClick={() => setShowAddModal(true)}>
                <FaPlusCircle style={{ marginRight: '8px' }} />
                Tambah Barang
              </Button>

              <AddDetailBarang showAddModal={showAddModal} setShowAddModal={setShowAddModal} onSuccess={handleAddSuccess} />

              <EditDetailBarang
                          showEditModal={showEditModal}
                          setShowEditModal={setShowEditModal}
                          dataBarang={selectedBarang}
                          onSuccess={handleEditSuccess}
                        />
            </div>

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="info"
              onClick={handleImportButtonClick}>
              <FaFileImport style={{ marginRight: '8px' }} />
              Import Data
            </Button>
            {/* {showImport && <ImportMasterBarang />} */}

            <ImportMasterBarang showImportModal={showImportModal} setShowImportModal={setShowImportModal} onSuccess={handleImportSuccess} />

            {/* <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              onClick={() => downloadCSV(plafond)}>
              <FaFileCsv style={{ marginRight: '8px' }} />
              Unduh CSV
            </Button> */}

            <Button
              className="btn-fill pull-right ml-lg-3 ml-md-4 ml-sm-3 mb-4"
              type="button"
              variant="primary"
              onClick={() => downloadPDF(dataBarang)}>
              <FaFilePdf style={{ marginRight: '8px' }} />
              Unduh PDF
            </Button>

            <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>
            
            <Col md="12">
              <Card className="striped-tabled-with-hover mt-2">
                <Card.Header>
                  <Card.Title as="h4">Data Barang</Card.Title>
                </Card.Header>
                <Card.Body className="table-responsive px-0" style={{ overflowX: 'auto' }}>
                {/* {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" variant="primary" />
                    <p>Loading...</p>
                  </div>
                ) : ( */}
                  <Table className="table-hover table-striped">
                      <div className="table-scroll" style={{ height:'auto' }}>
                        <table className="flex-table table table-striped table-hover">
                          <thead>
                        <tr>
                          <th onClick={() => handleSort("id_barang")}>ID Barang {sortBy==="id_barang" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => handleSort("nama_barang")}>Nama Barang {sortBy==="nama_barang" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0" onClick={() => handleSort("id_sap")}>ID SAP {sortBy==="id_sap" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                          <th className="border-0">ID Detail Barang</th>
                          <th className="border-0">Dibuat</th>
                          <th className="border-0">Terakhir Diubah</th>
                          <th className="border-0">Aksi</th>
                        </tr>
                          </thead>
                          <tbody className="scroll scroller-tbody">
                            {currentItems.map((dataBarang) => (
                              <tr key={dataBarang.id_barang}>
                                <td className="text-center">{dataBarang.id_barang}</td>
                                <td className="text-center">{dataBarang.nama_barang}</td>
                                <td className="text-center">{dataBarang.id_sap}</td>
                                <td className="text-right">{dataBarang.id_detailbarang}</td>
                                <td className="text-center">{new Date(dataBarang.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                                <td className="text-center">{new Date(dataBarang.updatedAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                                <td className="text-center">
                                  <Button className="btn-fill pull-right warning" variant="warning" onClick={() => { setShowEditModal(true); setSelectedBarang(dataBarang); }} style={{ width: 96, fontSize: 14 }}>
                                    <FaRegEdit style={{ marginRight: '8px' }} />
                                    Ubah
                                  </Button>
                                  <Button className="btn-fill pull-right danger mt-2" variant="danger"  onClick={() => deleteBarang(dataBarang.id_barang)} style={{ width: 96, fontSize: 13 }}>
                                    <FaTrashAlt style={{ marginRight: '8px' }} />
                                    Hapus
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                  </Table>
                {/* )} */}
              </Card.Body>
              </Card>
              <div className="pagination-container">
              <Pagination
                    activePage={currentPage}
                    itemsCountPerPage={itemsPerPage}
                    totalItemsCount={filteredBarang.length}
                    pageRangeDisplayed={5}
                    onChange={handlePageChange}
                    itemClass="page-item"
                    linkClass="page-link"
              />
              </div>
            </Col>
          </Row>
        </Container>
      </div>
      ):
      ( <>
          <div className="App-loading">
            <ReactLoading type="spinningBubbles" color="#fb8379" height={150} width={150}/>
            <span style={{paddingTop:'100px'}}>Loading...</span>
          </div>
        </>
      )}
    </>
  );
}

export default DataBarang;
