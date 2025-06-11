import React, { useEffect, useState, useMemo, useRef, Component, act } from "react";
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
import PreviewDocument from "./PreviewDocument.js";
import ToolbarFields from "components/Sidebar/ToolbarFields.js";

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
import { Prev } from "react-bootstrap/esm/PageItem.js";

function UploadDocument() {
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
  const [newIdSigner, setNewIdSigner] = useState("");
  const [document, setDocument] = useState("");
  const history = useHistory();
  const [selectedDoc, setSelectedDoc] = useState(
      location?.state?.selectedDoc || null
  );
  const [steps, setSteps] = useState(1);

  const fetchLastId = async () => {
  const response = await axios.get('http://localhost:5000/getLastSignerId', {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    }); 
    let newId = "S00001";
    if (response.data?.lastId) {
      const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
      const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
      newId = `S${incrementedIdNumber}`;
    }
    setIdSigners(newId);
  };

  console.log("Fetch last id: ", id_signers);

  const [documentCards, setDocumentCards] = useState([
    {
      id: Date.now(),
      id_karyawan: "",
      email: "",
      id_signers: "",

      status: "Pending",
      action: "Created"
    },
  ]);

  // const [documentCards, setDocumentCards] = useState([]);

  useEffect(() => {
    if(id_signers) {
      setDocumentCards([
        {
          id: Date.now(),
          id_karyawan: "",
          email: "",
          id_signers: "",
          status: "Pending",
          action: "Created"
        }
      ]);
    }
  }, [id_signers]);

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

        // if (response.data.token) {
        //   localStorage.setItem('steps', steps);
        // }

        // console.log("Steps by user data:", steps);
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    fetchUserData();
  }, []);

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
    const movedCard = prevCards[oldIndex];
    const newCards = arrayMove([...prevCards], oldIndex, newIndex);

    const parseId = (id) => parseInt(id.replace('S', ''), 10);
    const formatId = (num) => `S${String(num).padStart(5, '0')}`;

    const startingIdNumber = parseId(id_signers);

    const updatedCards = newCards.map((card, idx) => {
      return {
        ...card,
        id_signers: formatId(startingIdNumber + idx),
      };
    });

    return updatedCards;
  });
};

  useEffect(() => {
    lastIdDokumen();
    categoryDoc();
    getName();
    getDocument();
  }, []);

  console.log("Document cards:", documentCards);

  const handleAddCard = () => {
    setDocumentCards(prevCards => {
      
      let lastId = 0;
      if (prevCards.length > 0) {
        const lastCard = prevCards[prevCards.length - 1];
        lastId = parseInt(lastCard.id_signers.substring(1), 10);
      } else {
        lastId = parseInt(id_signers.substring(1), 10);
      }

      const incrementedId = (lastId + 1).toString().padStart(5, '0');
      const newIdSign = `S${incrementedId}`;

      const newCard = {
        id: Date.now(),
        id_signers: "",
        id_karyawan: "",
        email: "",
        status: "Pending",
        action: "Created"
      };

      return [...prevCards, newCard];
    });
  };

  const handleCardEmployeeChange = (id, selectedId) => {
    const selectedEmp = employeeList.find(emp => emp.id_karyawan === selectedId);
    const email = selectedEmp?.Pengguna?.[0]?.email || '';
    const id_karyawan = selectedEmp?.Pengguna?.[0]?.id_karyawan || '';

    console.log("Selected employee from card:", selectedEmp);
    console.log("Selected id karyawan from card:", selectedEmp.id_karyawan);

    setNewIdSigner(selectedEmp.id_karyawan);

    setDocumentCards(prevCards => 
      prevCards.map(card => 
        card.id === id 
        ? {...card, id_karyawan: selectedEmp.id_karyawan, email: email}
        : card
      )
    );
  };

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


  // const saveLogSign = async(e) => {
  //   try {
  //     const response = await axios.post('http://localhost:5000/logsign', {
  //       action,
  //       status,
  //       id_dokumen,
  //       id_karyawan, 
  //       id_signers: newIdSigner,
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("Logsign saved: ", response.data);
  //     toast.success("New logsign has created successfully!", {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //     });
  //     window.location.reload();
  //   } catch (error) {
  //     console.log(error.message);
  //   }
  // };


  const saveLogSign = async() => {
    try {
      const logsigns = documentCards.map(card => ({
        action: "Created",
        status: "Pending", 
        id_dokumen,
        id_karyawan: id_karyawan,
        id_signers: card.id_karyawan,
      }));

      const response = await axios.post('http://localhost:5000/logsign', {
        logsigns
        }, {
        headers: {
            Authorization: `Bearer ${token}`,
        }, 
      });
      
      console.log("Logsigns saved: ", response.data);
      toast.success("Logsigns have been created successfully!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
      nexThirdStep();
      // history.push({
      //   pathname: "/admin/preview-doc",
      //   state: {selectedDoc: document}
      // });
      // window.location.reload();
    } catch (error) {
      console.error("Failed to save logsigns:", error.message);
    }
  };

  useEffect(() => {
    if (selectedDoc && selectedDoc.id_dokumen) {
      setIdDokumen(selectedDoc.id_dokumen);
    }
  }, [selectedDoc]);

  const handleNext = () => {
    saveDocument();
      if (steps < 4){
      const nextStep = steps + 1;
      setSteps(nextStep);
      localStorage.setItem("steps", nextStep.toString());
      console.log("Steps from handleNext:", nextStep);
    }
  };

  const nexThirdStep = () => {
   if (steps < 4){
      const nextStep = 3;
      setSteps(nextStep);
      localStorage.setItem("steps", nextStep.toString());
      console.log("Steps from nexThirdStep:", nextStep);
    }
  };

   const nextLastStep = () => {
    if (steps < 4) setSteps(4);
      setSteps(steps + 1);
      console.log("Steps from nextLastStep:", steps + 1);

  };

  const handlePrevious = () => {
    if (steps > 1) setSteps(steps - 1);
    setSteps(steps - 1);
    console.log("Steps from handle previous:", steps - 1);


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

const handleCategoryChange = (event) => {
    setIdKategoriDok(event.target.value);
}

const getDocument = async() => {
  try {
    const response = await axios.get("http://localhost:5000/document", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setDocument(response.data);
  } catch (error) {
    console.error("Error fetching document: ", error.message);
  }
};

  useEffect(() => {
    localStorage.setItem("steps", steps.toString());
    localStorage.setItem("id_dokumen", id_dokumen.toString());
  }, [steps, id_dokumen]);

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
                        <Form onSubmit={saveLogSign}>
                          <SortableList 
                            items={documentCards}
                            onSortEnd={onSortEnd}
                            useDragHandle={false}
                            handleCardEmployeeChange={handleCardEmployeeChange}
                            handleDeleteCard={handleDeleteCard}
                            employeeName={employeeName}
                            value={employeeName.id_karyawan}
                          />
                          <Button variant="outline-primary" onClick={handleAddCard} className="mt-3">
                            <FaPlusCircle className="mb-1"/> Add Signer
                          </Button>
                        </Form>
                      </> 
                      )}
                      {steps === 4 && (
                        <p></p>
                      )}
                    </>
                    <div className="clearfix"></div>
                </div>
              </Card.Body>
            </Card>

            {steps === 3 && (
              <PreviewDocument />
            )}
          </Col>
        </Row>
      </Container>

        <footer>
        <div className="row gy-2 mt-3 mb-3 d-flex justify-content-center">
          {steps === 1 && (
              <div className="col-12 col-md-auto my-2">
                <Button variant="primary" type="submit" className="btn-fill w-100" onClick={handleNext} disabled={steps === 1 && nama_dokumen === "" || id_kategoridok === "" || category ==="" || file === null }>
                  Next
                  <FaRegArrowAltCircleRight style={{ marginLeft: '8px' }}/>
                </Button>
              </div>
          )}
          { steps === 2 && (
            <>
            <div className="col-12 col-md-auto my-2" id="ajukan">
              <Button
                className="btn-fill w-100"
                variant="primary"
                onClick={handlePrevious}
                disabled={steps === 1 && employeeName === "" || id_karyawan === "" && email === ""}
              >
              <FaRegArrowAltCircleLeft style={{ marginRight: '8px' }} />
                Previous
              </Button>
            </div>
            <div className="col-12 col-md-auto my-2">
              <Button variant="primary" type="submit" className="btn-fill w-100" onClick={saveLogSign} >
              <FaRegArrowAltCircleRight style={{ marginRight: '8px' }} />
                Next
              </Button>
            </div>
            </>
          )} 
          { steps === 3 && (
          <>
            <div className="col-12 col-md-auto my-2" id="ajukan">
              <Button
                className="btn-fill w-100"
                variant="primary"
                onClick={handlePrevious}
                disabled={steps === 2}
              >
              <FaRegArrowAltCircleLeft style={{ marginRight: '8px' }} />
                Previous
              </Button>
            </div>
            <div className="col-12 col-md-auto my-2">
              <Button variant="primary" type="submit" className="btn-fill w-100" onClick={nextLastStep} >
              <FaRegArrowAltCircleRight style={{ marginRight: '8px' }} />
                Next
              </Button>
            </div>
          </>
          )}
          { steps === 4 && (
            <>
              <div className="col-12 col-md-auto my-2" id="ajukan">
                <Button
                  className="btn-fill w-100"
                  variant="primary"
                  onClick={handlePrevious}
                  disabled={steps === 2}
                >
                <FaRegArrowAltCircleLeft style={{ marginRight: '8px' }} />
                  Previous
                </Button>
              </div>
              <div className="col-12 col-md-auto my-2">
                <Button variant="primary" type="submit" className="btn-fill w-100" onClick={nextLastStep} >
                <FaRegArrowAltCircleRight style={{ marginRight: '8px' }} />
                  Next
                </Button>
              </div>
            </>
          )}
        </div>
        </footer>
    </div>
    </>

  );
}

export default UploadDocument;