import React, { useEffect, useState, useMemo, useRef, Component } from "react";
import {FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight, FaRegSave, FaHistory, FaCheckCircle, FaTimesCircle, FaCoins, FaFileContract, FaCalculator, FaTrashAlt, FaPlusCircle} from 'react-icons/fa'; 
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "jspdf-autotable";
import Heartbeat from "./Heartbeat.js";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_stepper.scss";
import { SortableContainer, SortableElement } from "react-sortable-hoc";
import arrayMove from "array-move-item";
// import { SortableContainer, SortableElement } from "react-sortable-hoc";
// import arrayMove from "array-move";
// import { render } from "react-dom";

import SortableItem from "components/SortableList/SortableList.js";

import {
  Card,
  Table,
  Container,
  Row,
  Col,
  Form,
  Spinner, 
  Button,
  Modal
} from "react-bootstrap";
import { error } from "jquery";

function UploadDocument() {
  const [keperluan, setKeperluan] = useState(''); 
  const [id_peminjam, setIdPeminjam] = useState("");
  const [id_karyawan, setIdKaryawan] = useState(""); 
  const [id_pinjaman, setIdPinjaman] = useState("");
  const [tanggal_pengajuan, setTanggalPengajuan] = useState("");
  const [plafond, setPlafond] = useState(0); 

  const [filepath_pernyataan, setFilePathPernyataan] = useState('');

  const [plafond_saat_ini, setPlafondBaru] = useState(""); 
  const [tanggal_plafond_tersedia, setTanggalPlafondTersedia] = useState(""); 
  const [sudah_dihitung, setSudahDihitung] = useState(0);
  const [totalDibayar, setTotalDibayar] = useState(0);
  const [plafondAwal, setPlafondAwal] = useState(""); 

  const [pinjaman, setPinjaman] = useState([]); 
  const [antrean, setAntrean] = useState([]); 
  const [selectedPinjaman, setSelectedPinjaman] = useState(null);

  const [statusPinjaman, setStatusPinjaman] = useState(null);
  const [pinjamanInfo, setPinjamanInfo] = useState(null);

  const [status_pengajuan, setStatusPengajuan] = useState("Ditunda"); 
  const [status_transfer, setStatusTransfer] = useState("Belum Ditransfer");

  const [loadingPlafond, setLoadingPlafond] = useState(false);
  const [bulanLagi, setBulanLagi] = useState(0);
  const [nomorAntrean, setNomorAntrean] = useState("-");
  const [isButtonClicked, setIsButtonClicked] = useState(false);
  const [totalAngsuranBulanDepan] = useState(0);

  const token = localStorage.getItem("token");
  const [showAddModal, setShowAddModal] = React.useState(false);

  const [id_plafond, setIdPlafond] = useState("");
  const [tanggal_penetapan, setTanggalPenetapan] = useState("");
  const [jumlah_plafond, setJumlahPlafond] = useState("");
  const [keterangan, setKeterangan] = useState("");

  const [jumlah_topup, setJumlahTopupAngsuran] = useState("");

  const [hidden, setHidden] = useState(false); 
  
  const [id_dokumen, setIdDokumen] = useState("");
  const [nama_dokumen, setNamaDokumen] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState([]);
  const [id_kategoridok, setIdKategoriDok] = useState("");
  const [employeeName, setEmployeeName] = useState([]);
  const [email, setEmail] = useState("");
  const [employeeList, setEmployeeList] = useState([]);
  // const [documentCards, setDocumentCards] = useState([]);

  const [idCounter, setIdCounter] = useState("");

  // console.log("ID counter: ", idCounter);
  const nextIdNumber = (idCounter + 1).toString().padStart(5, '0');
  const newIdSigner = `S${nextIdNumber}`;

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setDocumentCards((prevCards) => {
      const newCards = [...prevCards];

      const oldIdSigner = newCards[oldIndex].id_signers;
      const newIdSigner = newCards[newIndex].id_signers;

      const moved = newCards.splice(oldIndex, 1)[0];
      newCards.splice(newIndex, 0, moved);

      newCards[newIndex].id_signers = oldIdSigner;
      newCards[oldIndex].id_signers = newIdSigner;

      return newCards;
    });
  };


  const [documentCards, setDocumentCards] = useState([
    {
      id: Date.now(),
      id_karyawan: "",
      email: "",
      id_signers: newIdSigner,
    },
  ]);

  const handleAddCard = () => {
    // const nextIdNumber = (idCounter + 1).toString().padStart(5, '0');
    // const newIdSigner = `S${nextIdNumber}`;

    const newCards = {
      id: Date.now(),
      // nama_dokumen: "",
      // id_kategoridok: "",
      id_signers: newIdSigner,
      id_karyawan: "",
      email: "",
    };
    setDocumentCards([...documentCards, newCards]);
    setIdCounter(prev => prev + 1);
  };


  const handleCardChange = (id, field, value) => {
    setDocumentCards(prevCards =>
      prevCards.map(card =>
        card.id === id ? { ...card, [field]: value } : card
      )
    );
  };

  const handleCardEmployeeChange = (id, selectedId) => {
    const selectedEmp = employeeList.find(emp => emp.id_karyawan === selectedId);
    const email = selectedEmp?.Pengguna?.[0]?.email || '';

    setDocumentCards(prevCards => 
      prevCards.map(card => 
        card.id === id 
        ? {...card, id_karyawan: selectedId, email: email}
        : card
      )
    );
  };

  const handleDeleteCard = (id) => {
    setDocumentCards(prevCards => prevCards.filter(card => card.id !== id));
  }

  const elementRef = useRef(null);
  const getNomorAntrean = async() => {
      try {
        const antreanResponse = await axios.get(`http://10.70.10.131:5000/antrean/${id_pinjaman}`, {
          headers: { Authorization: `Bearer ${token}` },
      });

      const antreanData = antreanResponse.data;
      // console.log("antreanData: ", antreanData);
      if (Array.isArray(antreanData) && antreanData.length > 0) {
        const sortedAntrean = antreanData.sort((a,b) => Number(a.nomor_antrean) - Number(b.nomor_antrean));
        // console.log("sortedAntrean: ", sortedAntrean);
        
        const latestAntrean = sortedAntrean[sortedAntrean.length - 1].nomor_antrean;
        // console.log("latestAntrean: ", latestAntrean);
        setNomorAntrean(latestAntrean !== null && latestAntrean !== undefined ? latestAntrean : 1);
      } else {
        setNomorAntrean(1);
        console.warn("Data antrean kosong, nomor antrean diset menjadi 1.");
      }
      } catch (error) {
        console.error("Error fetching antrean:", error.message);
        setNomorAntrean(1);
      }
  };

  const [steps, setSteps] = useState(1);

  const handleNext = () => {
    if (steps < 4) setSteps(steps + 1);
  };

  const handlePrevious = () => {
    if (steps > 1) setSteps(steps - 1);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileUpload = async() => {
    if (!file) {
      toast.error("Silakan pilih file PDF terlebih dahulu.");
      return;
    }
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF.");
      return;
    }
    
    const formData = new FormData();
    formData.append("pdf-file", file);
    formData.append("id_pinjaman", id_pinjaman);

    // console.log('Id pinjaman: ', id_pinjaman);
    // console.log('Form data: ', formData);

    fetch("http://10.70.10.131:5000/upload-pernyataan", {
      method: "PUT",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(async (response) => {
      const data = await response.json();
      // console.log('File path saved: ', data.filePath);
      if (!response.ok) {
        throw new Error(data.message || "Gagal mengunggah.");
      }

      setFilePathPernyataan(data.filePath);
      toast.success("File berhasil diunggah.");
      setShowAddModal(false);
    })
    .catch((error) => {
      toast.error(`Gagal: ${error.message}`);
    });
  
  };

  const stepTitle = [
    {title: "Upload Document"},
    {title: "Choose Signers"},
    {title: "Place Fields"},
    {title: "Review & Send"},
  ];

  useEffect(() => {
    const fetchLastId = async () => {
      try {
        const response = await axios.get('http://localhost:5000/getLastSignerId', {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }); 
        const lastId = response.data?.id_signers || "S00001";
        const lastNumber = parseInt(lastId.substring(1), 10);
        setIdCounter(lastNumber);
      } catch (err) {
        console.error('Failed to fetch last id_signers:', err);
      }
    };

    if (steps === 2) {
      fetchLastId();
    }
  }, [steps]);

  const savePengajuan = async (e) => {
    e.preventDefault();

    setLoading(true);
    elementRef.current?.scrollIntoView();
    try {
      // console.log("Saving pengajuan with id_pinjaman: ", id_pinjaman);
      setLoadingPlafond(true);
        await axios.post("http://10.70.10.131:5000/pinjaman", {
            id_pinjaman,
            tanggal_pengajuan,
            jumlah_angsuran,
            pinjaman_setelah_pembulatan,
            rasio_angsuran,
            keperluan,
            status_pengajuan,
            status_transfer,
            status_pelunasan: "Belum Lunas",
            id_peminjam,
            tanggal_plafond_tersedia,
            plafond_saat_ini,
            sudah_dihitung,
            filepath_pernyataan: filepath_pernyataan,
        }, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        getNomorAntrean();
        handlePengajuanSuccess();
        setIsButtonClicked(true);
        // setShowImportModal(true);

    } catch (error) {
        console.error("Error saat menyimpan pengajuan:", error.response?.data || error.message);
    } finally {
      setLoadingPlafond(false);
    }
  };

  // console.log("Tanggal plafond tersedia: ", tanggal_plafond_tersedia);

  const handlePengajuanSuccess = () => {
    getPinjaman();
    getAntrean();
    toast.success("Pinjaman berhasil diajukan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
  };

  // console.log("Total pinjaman: ", totalPinjaman); 
  // console.log("Total sudah dibayar: ", totalDibayar); 

  const handleAddSuccess = () => {
    // getPlafond();
    toast.success("Data plafond berhasil ditambahkan!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
    });
};

const savePlafond = async (e) => {
  e.preventDefault();
  try {
      await axios.post('http://10.70.10.131:5000/plafond', {
          id_plafond,
          tanggal_penetapan,
          jumlah_plafond,
          keterangan,
      }, {
          headers: {
              Authorization: `Bearer ${token}`,
          },
      });
      setShowAddModal(false); 
      onSuccess(); 
      
  } catch (error) {
      // console.log(error.message);
      toast.error('Gagal menyimpan data plafond baru.', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
  }
};

const lastIdDokumen = async(e) => {
    const response = await axios.get('http://localhost:5000/getLastDocumentId', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    let newId = "D00001";
    if (response.data?.lastId) {
        const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
        const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
        newId = `D${incrementedIdNumber}`;
    }
    setIdDokumen(newId);
};

const categoryDoc = async() => {
    try {
        const response = await axios.get('http://localhost:5000/category', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });
        const newCategory = response.data.map(item => ({
            value: item.id_kategoridok,
            label: item.kategori
        }));
        setCategory(newCategory);
    } catch (error) {
        console.error("Error fetching data:", error.message); 
    }
}

const getName = async() => {
    try {
        const response = await axios.get('http://localhost:5000/employee', {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        });

        setEmployeeList(response.data);

        const newEmployeeName = response.data.map(item => ({
            value: item.id_karyawan,
            label: item.nama
        }));
        setEmployeeName(newEmployeeName);
    } catch (error) {
        console.error("Error fetching data:", error.message);
    }
}

// console.log("Employee name: ", employeeName);

useEffect(() => {
    lastIdDokumen();
    categoryDoc();
    getName();
}, []);

const handleCategoryChange = (event) => {
    setIdKategoriDok(event.target.value);
}

// const handleSignerChange = (e) => {
//   const selectedId = e.target.value;
//   setIdKaryawan(selectedId);
//   const selectedEmp = employeeList.find(emp => emp.id_karyawan === selectedId);
//   if (selectedEmp && selectedEmp.Pengguna.length > 0) {
//     setEmail(selectedEmp?.Pengguna?.[0]?.email || '');
//   } else {
//     setEmail('');
//   }
// };

const SortableList = SortableContainer(({ items, handleCardEmployeeChange, handleDeleteCard, employeeName, ...props }) => {
  return (
    <div>
      {items.map((card, index) => (
        <SortableItem
          key={`item-${card.id}`}
          index={index}
          card={card}
          handleCardEmployeeChange={handleCardEmployeeChange}
          handleDeleteCard={handleDeleteCard}
          employeeName={employeeName}
          documentCards={items}
          {...props}
        />
      ))}
    </div>
  );
});


  return (
    <>
    <div className="App">
      <Container fluid>
        <Heartbeat/>
        <Row>
          <Col md="12">
            <Card className="p-4">
              <Card.Body>
              <Card.Header className="px-0">
                  <Card.Title>
                    Upload Document
                  </Card.Title>
              </Card.Header>
                <hr/>
                <div className="stepper-wrapper mt-5">
                <div className="stepper">
                  {[1, 2, 3, 4].map((step) => (
                    <div
                      key={step}
                      className={`step ${steps === step ? "active" : steps > step ? "completed" : ""}`}
                    >
                      <div className="circle">{step}</div>
                      <div className="label">{stepTitle[step - 1].title}</div>
                    </div>
                  ))}
                </div>
                </div>
                <div>
                  <Form>
                    <span className="text-danger required-select">(*) Required.</span>
                    <>
                      {steps === 1 && (
                        <>
                          <Row>
                              <Col md="12" className="mt-2">
                              <Form.Group>
                              <span className="text-danger">*</span>
                                  <label>Document ID</label>
                                  <Form.Control
                                      type="text"
                                      readOnly
                                      disabled
                                      value={id_dokumen}
                                  ></Form.Control>
                              </Form.Group>
                              </Col>
                          </Row>

                          <Row>
                              <Col md="12" className="mt-2">
                                  <Form.Group>
                                      <span className="text-danger">*</span>
                                      <label>File Name</label>
                                      <Form.Control
                                          type="text"
                                          required
                                          value={nama_dokumen}
                                          onChange={(e) => setNamaDokumen(e.target.value)}
                                      ></Form.Control>
                                  </Form.Group>
                              </Col>
                          </Row>

                          <Row>
                              <Col md="12" className="mt-2">
                                  <Form.Group required>
                                      <span className="text-danger">*</span>
                                      <label>Upload Document</label><br />
                                      <input type="file" accept=".pdf" onChange={handleFileChange} />
                                  </Form.Group>
                              </Col>
                          </Row>
                          

                          <Row>
                              <Col md="12" className="mt-2">
                                  <Form.Group>
                                  <span className="text-danger">*</span>
                                      <label>Category</label>
                                      <Form.Select 
                                      className="form-control"
                                      required
                                      value={id_kategoridok}
                                      onChange={handleCategoryChange}
                                      >
                                      <option className="placeholder-form" key="blankChoice" hidden value="">
                                          Choose Category
                                      </option>
                                      {category.map(option => (
                                          <option key={option.value} value={option.value}>
                                              {option.label}
                                          </option>
                                      ))}
                                      </Form.Select>
                                  </Form.Group>
                              </Col>
                          </Row>
                        </>
                      )}
                      {steps === 2 && (
                      <>
                        {/* {documentCards.map((card, index) => (
                          <Card key={card.id} className="mt-3 mb-0">
                            <Card.Body>
                              <Row>
                                <Col md="5">
                                  <Form.Group>
                                    <span className="text-danger">*</span>
                                    <label>Full Name</label>
                                    <Form.Select 
                                        // className="form-control"
                                        required
                                        value={card.id_karyawan}
                                        onChange={(e) => handleCardEmployeeChange(card.id, e.target.value)}
                                        >
                                        <option className="placeholder-form" key="blankChoice" hidden value="">
                                            Choose Signer
                                        </option>
                                        {employeeName.map((emp) => {
                                          const isSelectedName = documentCards.some(
                                            c => c.id_karyawan === emp.value && c.id !== card.id
                                          );

                                          return(
                                              <option key={emp.value} value={emp.value} disabled={isSelectedName}>
                                                  {emp.label}
                                              </option>
                                          );
                                        })}     
                                    </Form.Select>
                                  </Form.Group>
                                </Col>
                                <Col md="5">
                                  <Form.Group>
                                    <label>Email</label>
                                    <Form.Control
                                      type="email"
                                      value={card.email}
                                      readOnly
                                      disabled
                                    ></Form.Control>
                                  </Form.Group>
                                </Col>
                                <Col md="2" className="mt-1">
                                  <Button
                                    variant="outline-danger"
                                    onClick={() => handleDeleteCard(card.id)}
                                    className="mt-4"
                                  >
                                    <FaTrashAlt className="mb-1"/>
                                  </Button>
                                </Col>
                              </Row>
                             
                            </Card.Body>
                          </Card>
                        ))}
                        <br /> */}

                        <SortableList 
                          items={documentCards}
                          onSortEnd={onSortEnd}
                          useDragHandle={false}
                          handleCardEmployeeChange={handleCardEmployeeChange}
                          handleDeleteCard={handleDeleteCard}
                          employeeName={employeeName}
                        />
                        
                        <Button variant="outline-primary" onClick={handleAddCard} className="mt-3">
                          <FaPlusCircle className="mb-1"/> Add Signer
                        </Button>
                      </> 
                      )}
                    </>
                    <div className="row gy-2 mt-3 mb-3 d-flex justify-content-center">
                    {steps === 1 ? (
                      <>
                        <div className="col-12 col-md-auto my-2">
                          <Button variant="primary" className="btn-fill w-100" onClick={handleNext} disabled={steps === 1 && nama_dokumen === "" || id_kategoridok === "" || category ==="" || file === null }>
                            Next
                            <FaRegArrowAltCircleRight style={{ marginLeft: '8px' }}/>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                      <div className="col-12 col-md-auto my-2" id="ajukan">
                        <Button
                          className="btn-fill w-100"
                          variant="primary"
                          onClick={handlePrevious}
                          disabled={steps === 1}
                        >
                        <FaRegArrowAltCircleLeft style={{ marginRight: '8px' }} />
                          Sebelumnya
                        </Button>
                      </div>
                      <div className="col-12 col-md-auto my-2">
                          <Button id="simpan" variant="success" className="btn-fill w-100" onClick={savePengajuan} >
                          <FaRegSave style={{ marginRight: '8px' }} />
                            Simpan
                          </Button>
                      </div>
                      </>
                    )}
                    </div>
                    <div className="clearfix"></div>
                  </Form>
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
      <Modal
            className="modal-primary"
            show={showAddModal}
            onHide={() => setShowAddModal(false)}
        >
            <Modal.Header className="text-center pb-1">
                <h3 className="mt-3 mb-0">Form Permohonan Top-up Angsuran</h3>
            </Modal.Header>
            <Modal.Body className="text-left pt-0">
                <hr />
                <Form onSubmit={savePlafond}>
                <Card> 
                    <Card.Header as="h4" className="mt-1"><strong>Top-up Angsuran</strong></Card.Header><hr/>
                    <Card.Body>
                        <Card.Text>
                            <p>Merupakan kondisi dimana keluarga calon peminjam <strong>SETUJU</strong> untuk<strong> meningkatkan jumlah angsuran per-bulan yang dipotong dari Gaji Karyawan Peminjam</strong> untuk mencapai jumlah pinjaman yang diperlukan.</p>
                            <p>Silakan mengunggah Surat Pernyataan yang telah ditandatangani oleh:
                            </p>
                            <ol>
                                <li>Karyawan Peminjam</li>
                                <li>Perwakilan Keluarga Karyawan (suami/istri)</li>
                                <li>Manager/Supervisor/Kabag</li>
                                <li>Direktur Keuangan</li>
                                <li>Presiden Direktur</li>
                              </ol>
                        </Card.Text>
                    </Card.Body>
                </Card>
                <span className="text-danger required-select">(*) Wajib diisi.</span>
                    <Row>
                        <Col md="12">
                            <Form.Group>
                            <span className="text-danger">*</span>
                                <label>Unggah Surat Pernyataan</label>
                                <input type="file" accept=".pdf" onChange={handleFileChange} />
                            </Form.Group>
                        </Col>
                    </Row>
                    <Row>
                        <Col md="12">
                            <div className="modal-footer d-flex flex-column">
                                <a href="#ajukan">
                                  <Button className="btn-fill w-100 mt-3" variant="primary" onClick={handleFileUpload}>
                                      Simpan
                                  </Button>
                                </a>
                            </div>
                        </Col>
                    </Row>
                </Form>
            </Modal.Body>
      </Modal>
    </>

  );
}

export default UploadDocument;