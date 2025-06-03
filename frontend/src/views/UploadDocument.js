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
  const [filepath_pernyataan, setFilePathPernyataan] = useState('');
  const [id_dokumen, setIdDokumen] = useState("");
  const [nama_dokumen, setNamaDokumen] = useState("");
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState([]);
  const [id_kategoridok, setIdKategoriDok] = useState("");
  const [employeeName, setEmployeeName] = useState([]);
  const [employeeList, setEmployeeList] = useState([]);
  const [id_signers, setIdSigners] = useState("");
  const [status, setStatus] = useState("");
  const [action, setAction] = useState("");
  const [id_karyawan, setIdKaryawan] = useState("");
  const [nama, setNama] = useState("");
  const [organisasi, setOrganisasi] = useState("");
  const [userData, setUserData] = useState({id_karyawan: "", nama: "", organisasi:""})
  const token = localStorage.getItem("token");
  
  const nextIdNumber = (id_signers + 1).toString().padStart(5, '0');
  const newIdSigner = `S${nextIdNumber}`;

  const [documentCards, setDocumentCards] = useState([
    {
      id: Date.now(),
      id_karyawan: "",
      email: "",
      id_signers: newIdSigner,

      status: "Pending",
      action: "Created"
    },
  ]);

  useEffect(() => {
    const fetchUserData = async() => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");
      const email = localStorage.getItem("email");
      const user_active = localStorage.getItem("user_active");

      console.log("User token: ", token, "User role:", role, "Email: ", email, "User active: ", user_active);

      if(!token || !email) return;
      console.log("User token:", token, "User role:", role);

      try {
        const response = await axios.get(`http://localhost:5000/user-details/${email}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if(response.data) {
          setUserData({
            id_karyawan: response.data.id_karyawan,
            nama: response.data.nama,
            organisasi: response.data.organisasi,
            role: response.data.role,
          });
          setIdKaryawan(response.data.id_karyawan);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    fetchUserData();
  }, []);

  // console.log("User data:", userData.id_karyawan);
  // console.log("User data pengguna: ", userData.Pengguna?.id_karyawan)
  console.log("Id Karyawan: ", id_karyawan);

  useEffect(() => {
    const fetchDataKaryawan = async() => {
      if (!userData.id_karyawan) return;

      try {
        const responseKaryawan = await axios.get(`http://localhost:5000/employee/${userData.id_karyawan}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const karyawanData = responseKaryawan.data;

        setIdKaryawan(karyawanData.id_karyawan);
        setNama(karyawanData.nama);
        setOrganisasi(karyawanData.organisasi);
      } catch (error) {
        console.error("Error fetching karyawan data:", error);
      }
    };

    if (userData.id_karyawan) {
      fetchDataKaryawan();
    }
  }, [userData.id_karyawan, token]);



  const onSortEnd = ({ oldIndex, newIndex }) => {
    setDocumentCards((prevCards) => {
      const newCards = arrayMove([...prevCards], oldIndex, newIndex);

      const updatedCards = newCards.map((card, idx) => ({
        ...card,
        id_signers: `S${(idx + 1).toString().padStart(5, '0')}`
      }));

      // setIdSigners(id_signers);
      
      return updatedCards;
    });
  };

  const arrayMove = (arr, from, to) => {
    const newArr = [...arr];
    const item = newArr.splice(from, 1)[0];
    newArr.splice(to, 0, item);
    return newArr;
  };

  console.log("Document cards:", documentCards);

  const handleAddCard = () => {
    setDocumentCards(prevCards => {
      const maxNumber = prevCards.reduce((max, card) => {
        const num = parseInt(card.id_signers.slice(1));
        return num > max ? num : max;
      }, 0);

      const newIdSigners = `S${String(maxNumber + 1).padStart(5, '0')}`;

      const newCard = {
        id: Date.now(),
        id_signers: newIdSigners,
        id_karyawan: "",
        email: "",
      };

      return [...prevCards, newCard];
    });
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

  // const handleDeleteCard = (id) => {
  //   setDocumentCards(prevCards => prevCards.filter(card => card.id !== id));
  // }

  const handleDeleteCard = (id) => {
    setDocumentCards(prevCards => {
      const deletedCard = prevCards.find(card => card.id === id);
      if (!deletedCard) return prevCards;

      const deletedIdSigner = deletedCard.id_signers;
      const deletedNumber = parseInt(deletedIdSigner.slice(1));

      const updatedCards = prevCards
      .filter(card => card.id !== id)
      .map(card => {
        const num = parseInt(card.id_signers.slice(1));
        if(num > deletedNumber) {
          const newNumber = num - 1;
          return {
            ...card,
            id_signers: `S${String(newNumber).padStart(5, '0')}`
          }; 
        }
        return card;
      });
      return updatedCards;
    });
  };

  const elementRef = useRef(null);

  const [steps, setSteps] = useState(1);

  const saveDocument = async(e) => {
    // e.preventDefault();
      if (!file) {
        toast.error("Please choose PDF file.");
        return;
      }

      const formData = new FormData();
      formData.append("pdf-file", file);
      formData.append("id_dokumen", id_dokumen);
      formData.append("nama_dokumen", nama_dokumen);
      formData.append("id_kategoridok", id_kategoridok);
      formData.append("status", status);
      formData.append("action", action);
      formData.append("id_karyawan", id_karyawan);
    try {
      const response = await axios.post('http://localhost:5000/document', formData,
          {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
          },
      });
      toast.success("New document has uploaded successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    } catch (error) {
        console.log(error.message);
    }
  };

  const saveSigner = async(e) => {
    try {
      const response = await axios.post('http://localhost:5000/signer', {
        signers: documentCards
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("Signer saved: ", response.data);
      toast.success("New signer has created successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleNext = () => {
    saveDocument();
    if (steps < 4) setSteps(steps + 1);
  };

  const nexThirdStep = () => {
    saveSigner();
    if (steps < 4) setSteps(steps + 1);
  };

  const handlePrevious = () => {
    if (steps > 1) setSteps(steps - 1);
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
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
        setIdSigners(lastNumber);
      } catch (err) {
        console.error('Failed to fetch last id_signers:', err);
      }
    };

    if (steps === 2) {
      fetchLastId();
    }
  }, [steps]);


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
          id_signers={card.id_signers}
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
                    <span className="text-danger required-select">(*) Required.</span>
                    <>
                      {steps === 1 && (
                        <>
                          <Form onSubmit={saveDocument}>
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
                          </Form>
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
                        <br />  */}

                        <Form onSubmit={saveSigner}>
                          <SortableList 
                            items={documentCards}
                            onSortEnd={onSortEnd}
                            useDragHandle={false}
                            handleCardEmployeeChange={handleCardEmployeeChange}
                            handleDeleteCard={handleDeleteCard}
                            employeeName={employeeName}
                            value={employeeName.id_karyawan}
                            id_signers={id_signers}
                          />
                          <Button variant="outline-primary" onClick={handleAddCard} className="mt-3">
                            <FaPlusCircle className="mb-1"/> Add Signer
                          </Button>
                        </Form>
                      </> 
                      )}
                    </>
                    <div className="row gy-2 mt-3 mb-3 d-flex justify-content-center">
                    {steps === 1 ? (
                      <>
                        <div className="col-12 col-md-auto my-2">
                          <Button variant="primary" type="submit" className="btn-fill w-100" onClick={handleNext} disabled={steps === 1 && nama_dokumen === "" || id_kategoridok === "" || category ==="" || file === null }>
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
                          Previous
                        </Button>
                      </div>
                      <div className="col-12 col-md-auto my-2">
                        <Button variant="primary" type="submit" className="btn-fill w-100" onClick={saveSigner} >
                        <FaRegArrowAltCircleRight style={{ marginRight: '8px' }} />
                          Next
                        </Button>
                      </div>
                      </>
                    )}
                    </div>
                    <div className="clearfix"></div>
                </div>
              </Card.Body>
            </Card>

          </Col>
        </Row>
      </Container>
    </div>
    </>

  );
}

export default UploadDocument;