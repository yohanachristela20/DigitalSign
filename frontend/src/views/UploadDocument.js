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

import { useInitial } from "components/Provider/InitialContext.js";
import { useSignature } from "components/Provider/SignatureContext.js";
import { useDateField } from "components/Provider/DateContext.js";

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
  const [x_axis, setXAxis] = useState(0);
  const [y_axis, setYAxis] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(150);
  const [jenis_item, setJenisItem] = useState("");
  const [id_item, setIdItem] = useState("");
  const [signersToolbar, setSignersToolbar] = useState([]);
  const [signersCount, setSignersCount] = useState("");
  const [selectedOption, setSelectedOption] = useState([]);
  const [error, setError] = useState("");
  let [nextStep2, setNextStep2] = useState(false);
  let [nextStep3, setNextStep3] = useState(false);
  let [nextStep4, setNextStep4] = useState(false);

  const {signatures, setSignatures} = useSignature([]);
  const {initials, setInitials} = useInitial([]);
  const {dateField, setDateField} = useDateField([]);

  const [signClicked, setSignClicked] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [dateClicked, setDateClicked] = useState(false);
  const [deletedSigner, setDeletedSigner] = useState("");

  const [selectedDoc, setSelectedDoc] = useState(
      location?.state?.selectedDoc || null
  );
  const [steps, setSteps] = useState(1);

  useEffect(() => {
    const handleSignersUpdate = () => {
      const sgnData = localStorage.getItem("signers");
      const sgnCount = localStorage.getItem("signersCount");
      const selectedSigner = localStorage.getItem("selectedOption");

      console.log("signerToolbar:", sgnData);
      console.log("selected signer from toolbar:", selectedSigner);

      if (sgnData !== null) setSignersToolbar(sgnData);
      if (sgnCount !== null) setSignersCount(parseFloat(sgnCount));
      if (selectedSigner !== null) setSelectedOption(selectedSigner);
    };

    window.addEventListener("localStorageUpdated", handleSignersUpdate);

    handleSignersUpdate();

    return() => {
      window.removeEventListener("localStorageUpdated", handleSignersUpdate);
    };
  }, []);

  console.log("signers toolbar:", signersToolbar);
  console.log("signers count:", signersCount);
  console.log("selected signer:", selectedOption);

  // const fetchLastId = async () => {
  // const response = await axios.get('http://localhost:5000/getLastSignerId', {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     }
  //   }); 
  //   let newId = "S00001";
  //   if (response.data?.lastId) {
  //     const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
  //     const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
  //     newId = `S${incrementedIdNumber}`;
  //   }
  //   setIdSigners(newId);
  // };

  // console.log("Fetch last id: ", id_signers);

  const [documentCards, setDocumentCards] = useState([
    {
      id: Date.now(),
      id_karyawan: "",
      email: "",
      id_signers: "",
      status: "Pending",
      action: "Created", 
      jenis_item: ""
    },
  ]);

  useEffect(() => {
      setDocumentCards([
        {
          id: Date.now(),
          id_karyawan: "",
          email: "",
          id_signers: "",
          status: "Pending",
          action: "Created",
          jenis_item,
        }
      ]);
  }, []);

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

  useEffect(() => {
   const handleLocalStorageUpdate = () => {
    const x = localStorage.getItem("x_axis");
    const y = localStorage.getItem("y_axis");
    const w = localStorage.getItem("width");
    const h = localStorage.getItem("height");
    const jenis = localStorage.getItem("jenis_item");

    if (x !== null)setXAxis(parseFloat(x));
    if (y !== null)setYAxis(parseFloat(y));
    if (w !== null)setWidth(parseFloat(w));
    if (h !== null)setHeight(parseFloat(h));
    if (jenis !== null)setJenisItem(jenis);

    // setJenisItem("Signpad");
   };

   window.addEventListener("localStorageUpdated", handleLocalStorageUpdate);

   handleLocalStorageUpdate();

   return() => {
    window.removeEventListener("localStorageUpdated", handleLocalStorageUpdate);
   };
  }, []);

  console.log("Stepssss: ", steps);

  useEffect(() => {
  const handleButtonClicked = () => {
      const signButton = localStorage.getItem("signatureClicked"); 
      const initButton = localStorage.getItem("initialClicked");
      const dateButton = localStorage.getItem("dateFieldClicked");

      console.log("SignButton clicked from Upload:", signButton);
      console.log("InitialButton clicked from Upload:", initButton);
      console.log("DateButton clicked from Upload", dateButton);

      setSignClicked(signButton === "true");
      setInitClicked(initButton === "true");
      setDateClicked(dateButton === "true");
  };

  window.addEventListener("localStorageUpdated", handleButtonClicked);

  handleButtonClicked();

  return() => {
      window.removeEventListener("localStorageUpdated", handleButtonClicked);
  };
  }, []);

  useEffect(() => {
    const handleNextButton = () => {
      nextStep2 = localStorage.getItem("nextStep2");
      // nextStep3 = localStorage.getItem("nextStep3");
      // nextStep4 = localStorage.getItem("nextStep4");
      setNextStep2(nextStep2);
      // setNextStep3(nextStep3);
      // setNextStep4(nextStep4);
    }

    handleNextButton();
  });


  useEffect(() => {
    if(steps === 3) {
      console.log("x_axis from step 3:", x_axis, "y_axis:", y_axis, "width:", width, "height:", height, "jenis_item:", jenis_item);
    }
  }, [steps, x_axis, y_axis, width, height, jenis_item]);


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
    // const movedCard = prevCards[oldIndex];
    const newCards = arrayMove([...prevCards], oldIndex, newIndex);

    // const parseId = (id) => parseInt(id.replace('K', ''), 10);
    // const formatId = (num) => `K${String(num).padStart(5, '0')}`;

    // const startingIdNumber = parseId(id_signers);

    // const updatedCards = newCards.map((card, idx) => {
    //   return {
    //     ...card,
    //     id_signers: formatId(startingIdNumber + idx),
    //   };
    // });

    return newCards;
  });
};

  useEffect(() => {
    lastIdDokumen();
    lastIdItem();
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
      const newIdSign = `K${incrementedId}`;

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

  const deleteSigner = async(deletedSigner) => {
    console.log("Deleting signer with id_signers:", deletedSigner); 
    try {
      await axios.delete(`http://localhost:5000/logsign/${deletedSigner}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Signer deleted successfully.", {
        position: "top-right", 
        autoClose: 5000, 
        hideProgressBar: true,
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const handleDeleteCard = async (id) => {
  const updatedCards = [...documentCards];
  const index = updatedCards.findIndex(card => card.id === id);

  if (index !== -1) {
    const deletedCard = updatedCards[index];
    console.log("Deleted card: ", deletedCard);

    const deletedIdSigner = deletedCard.id_karyawan;
    console.log("deletedIdSigner:", deletedIdSigner);
    setDeletedSigner(deletedIdSigner);

    await deleteSigner(deletedIdSigner);
    updatedCards.splice(index, 1); 
    setDocumentCards(updatedCards);
  }
};

  const saveDocument = async() => {
    // console.log("Nextstep2 from getItem:", nextStep2);
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
    e.preventDefault();
    try {
      console.log("nextStep3:", nextStep3);
      if (nextStep3 !== true) {
        const karyawanIds = documentCards.map(card => card.id_karyawan);
        const response = await axios.post('http://localhost:5000/signer', {
          id_signers,
          id_karyawan: karyawanIds,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log("Signer saved: ", response.data);
        // localStorage.setItem("S: ", signatures.length);
        toast.success("New signer has been created successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
      }
      nexThirdStep();
    } catch (error) {
      console.log(error.message);
    }
  };

  // console.log("Signer saved: ", response.data.length);

  //save masing-masing
  // const saveLogSign = async() => {
  //   try {
  //     const logsigns = documentCards.map(card => ({
  //       action: "Created",
  //       status: "Pending", 
  //       id_dokumen,
  //       id_karyawan: id_karyawan,
  //       id_signers: card.id_karyawan,
  //     }));

  //     const response = await axios.post('http://localhost:5000/logsign', {
  //       logsigns
  //       }, {
  //       headers: {
  //           Authorization: `Bearer ${token}`,
  //       }, 
  //     });
      
  //     console.log("Logsigns saved: ", response.data);
  //     toast.success("Logsigns have been created successfully!", {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //     });
  //     nexThirdStep();
  //     // history.push({
  //     //   pathname: "/admin/preview-doc",
  //     //   state: {selectedDoc: document}
  //     // });
  //     // window.location.reload();
  //   } catch (error) {
  //     console.error("Failed to save logsigns:", error.message);
  //   }
  // };

  // const saveItem = async() => {
  //   try {
  //     const response = await axios.post('http://localhost:5000/item', {
  //       // id_item,
  //       jenis_item, 
  //       x_axis,
  //       y_axis, 
  //       width, 
  //       height
  //     }, {
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     console.log("Item saved: ", response.data);
  //     toast.success("Item has been created successfully!", {
  //       position: "top-right",
  //       autoClose: 5000,
  //       hideProgressBar: true,
  //     });
  //     nextLastStep();
  //   } catch (error) {
  //     console.error("Failed to save item:", error.message);
  //   }
  // };



  // const saveLogSignandItems = async(e) => {
  //   e.preventDefault();
  //   try {
  //     if (nextStep4 !== true) {
  //       const items = signatures.map(sig => ({
  //         jenis_item: sig.jenis_item, 
  //         x_axis: sig.x_axis,
  //         y_axis: sig.y_axis,
  //         width: sig.width, 
  //         height: sig.height,
  //         id_karyawan: sig.id_karyawan
  //       }));

  //       const itemKaryawan = items.map(item => item.id_karyawan);
  //       const allSigners = JSON.parse(localStorage.getItem("signers")) || [];
  //       const missingItemSigners = allSigners.filter(signer => !itemKaryawan.includes(signer.value));
  //       if (missingItemSigners.length > 0) {
  //         setError('Signer should have an item.');
  //         toast.error('Signer should have an item.', {
  //           position: "top-right",
  //           autoClose: 5000,
  //           hideProgressBar: true,
  //         });
  //         return;
  //       }
        
  //       const itemResponse = await axios.post('http://localhost:5000/item', items, {
  //         headers: {Authorization: `Bearer ${token}`}
  //       }); 

  //       const createdItems = itemResponse.data.data.items;
  //       const logsigns = createdItems.map((item, index) => {
  //       // const signer = documentCards[0]; //hanya untuk 1 output 
  //       const signer = signatures[index];

  //       return {
  //         action: "Created", 
  //         status: "Pending", 
  //         id_dokumen,
  //         id_karyawan,
  //         id_signers: signer.id_karyawan,
  //         id_item: item.id_item,
  //         };
  //       });

  //       await axios.post('http://localhost:5000/logsign', {
  //         logsigns
  //         }, {
  //           headers: {Authorization: `Bearer ${token}`}
  //       }); 

  //       toast.success("Logsigns and items created successfully!", {
  //         position: "top-right", 
  //         autoClose: "5000", 
  //         hideProgressBar: true,
  //       });
  //     }
  //     nextLastStep();
  //   } catch (error) {
  //     console.error("Failed to save logsigns and items:", error.message);
  //   }
    
  // };


  const saveLogSignandItems = async(e) => {
    e.preventDefault();
    try {
      if (nextStep4 !== true) {
        let items = [];

        if (signClicked && Array.isArray(signatures)) {
          items = [
            ...items,
            ...signatures.map(sig => ({
              jenis_item: "Signpad",
              x_axis: sig.x_axis,
              y_axis: sig.y_axis,
              width: sig.width,
              height: sig.height,
              id_karyawan: sig.id_karyawan,
            }))
          ];  
        } 

        if (initClicked && Array.isArray(initials)) {
          items = [
            ...items,
            ...initials.map(sig => ({
              jenis_item: "Initialpad",
              x_axis: sig.x_axis,
              y_axis: sig.y_axis,
              width: sig.width,
              height: sig.height,
              id_karyawan: sig.id_karyawan,
            }))
          ];
        }

        if (dateClicked && Array.isArray(dateField)) {
          items = [
            ...items,
            ...dateField.map(sig => ({
              jenis_item: "Date",
              x_axis: sig.x_axis,
              y_axis: sig.y_axis,
              width: sig.width,
              height: sig.height,
              id_karyawan: sig.id_karyawan,
            }))
          ];
        }
      
        const itemKaryawan = items.map(item => item.id_karyawan);
        const allSigners = JSON.parse(localStorage.getItem("signers")) || [];
        
        const missingItemSigners = allSigners.filter(signer => !itemKaryawan.includes(signer.value));
        
        if (missingItemSigners.length > 0) {
          setError('Signer should have an item.');
          toast.error('Signer should have an item.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
          });
          return;
        }
        
        const itemResponse = await axios.post('http://localhost:5000/item', items, {
          headers: {Authorization: `Bearer ${token}`}
        }); 

        const createdItems = itemResponse.data.data.items;
        const logsigns = createdItems.map((item, index) => {
        // const signer = documentCards[0]; //hanya untuk 1 output 
        // const signer = signatures[index];
        // const signer = initClicked? initials[index] : signatures[index]; // hanya mengambil salah 1: signatures atau initials

        return {
          action: "Created", 
          status: "Pending", 
          id_dokumen,
          id_karyawan,
          id_signers: items[index].id_karyawan,
          id_item: item.id_item,
          };
        });

        // setIdSigners(id_signers);
        // console.log("ID SIGNERS FROM SAVE LOGSIGN:", id_signers);

        await axios.post('http://localhost:5000/logsign', {
          logsigns
          }, {
            headers: {Authorization: `Bearer ${token}`}
        }); 

        toast.success("Logsigns and items created successfully!", {
          position: "top-right", 
          autoClose: "5000", 
          hideProgressBar: true,
        });
      }
  
      nextLastStep();
    } catch (error) {
      console.error("Failed to save logsigns and items:", error.message);
    }
    
  };

  useEffect(() => {
    if (selectedDoc && selectedDoc.id_dokumen) {
      setIdDokumen(selectedDoc.id_dokumen);
    }
  }, [selectedDoc]);

  const handleNext = () => {
    if (nextStep2 !== true) {
      saveDocument();
      if (steps < 4){
        const nextStep = steps + 1;
        setSteps(nextStep);
        localStorage.setItem("steps", nextStep.toString());

        const handleNextStep2 = true;
        setNextStep2(handleNextStep2);
        localStorage.setItem("nextStep2", handleNextStep2);
      }
    }
  };

  const nexThirdStep = () => {
   if (steps < 4){
      const nextStep = 3;
      setSteps(nextStep);
      localStorage.setItem("steps", nextStep.toString());
      // console.log("Steps from nexThirdStep:", nextStep);

      const handleNextStep3 = true;
      setNextStep3(handleNextStep3);
      localStorage.setItem("nextStep3", handleNextStep3);
    }
  };

   const nextLastStep = () => {
    // if (steps < 4) setSteps(4);
    // setSteps(steps + 1);
    // console.log("Steps from nextLastStep:", steps + 1);
    if (steps < 4){
      const nextStep = 4;
      setSteps(nextStep);

      const handleNextStep4 = true;
      setNextStep4(handleNextStep4);
      localStorage.setItem("nextStep4", handleNextStep4);
    } 

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


const lastIdItem = async(e) => {
    const response = await axios.get('http://localhost:5000/getLastItemId', {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    });

    let newId = "I00001";
    if (response.data?.lastId) {
        const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
        const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
        newId = `I${incrementedIdNumber}`;
    }
    setIdItem(newId);
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
                        <Form onSubmit={nexThirdStep}>
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
                    </>
                    <div className="clearfix"></div>
                </div>
              </Card.Body>
            </Card>

            {steps === 3 && (
              <>
                <PreviewDocument />
              </>
            )}
            {steps === 4 && (
              <>
                <Card className="p-4">
                 <Card.Body>
                   <Card.Header>
                    <Card.Title>
                      Review and Send
                    </Card.Title>
                  </Card.Header>
                  <hr/>
                  <Container fluid>
                    <Form>
                      <div>
                        <p className="fs-5"><strong>Recipients</strong></p>
                        <SortableList 
                          items={documentCards}
                          onSortEnd={onSortEnd}
                          useDragHandle={false}
                          handleCardEmployeeChange={handleCardEmployeeChange}
                          handleDeleteCard={handleDeleteCard}
                          employeeName={employeeName}
                          value={employeeName.id_karyawan}
                        />
                      </div>
                    </Form>
                  </Container>
                 </Card.Body>
                </Card>
              </>
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
                disabled={steps === 2 && employeeName === "" || id_karyawan === ""}
              >
              <FaRegArrowAltCircleLeft style={{ marginRight: '8px' }} />
                Previous
              </Button>
            </div>
            <div className="col-12 col-md-auto my-2">
              <Button variant="primary" type="submit" className="btn-fill w-100" onClick={saveSigner} disabled={steps === 2 && employeeName.id_karyawan === "" || id_karyawan === "" || employeeName === ""}>
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
              <Button variant="primary" type="submit" className="btn-fill w-100" onClick={saveLogSignandItems} >
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