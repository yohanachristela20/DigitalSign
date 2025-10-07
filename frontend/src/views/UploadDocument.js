import React, { useEffect, useState, useMemo } from "react";
import {FaRegArrowAltCircleLeft, FaRegArrowAltCircleRight, FaPlusCircle, FaWindows} from 'react-icons/fa'; 
import axios from "axios";
import { useHistory } from "react-router-dom"; 
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "jspdf-autotable";
import Heartbeat from "./Heartbeat.js";
import "../assets/scss/lbd/_pagination.scss";
import "../assets/scss/lbd/_stepper.scss";
import { SortableContainer } from "react-sortable-hoc";
import PreviewDocument from "./PreviewDocument.js";
import SortableItem from "components/SortableList/SortableList.js";

import { useInitial } from "components/Provider/InitialContext.js";
import { useSignature } from "components/Provider/SignatureContext.js";
import { useDateField } from "components/Provider/DateContext.js";

import ReactLoading from "react-loading";

import "../assets/scss/lbd/_previewdoc.scss";
import "../assets/scss/lbd/_docsent.scss";

import { arrayMoveImmutable } from "array-move";

import {
  Card,
  Container,
  Row,
  Col,
  Form,
  Button,
} from "react-bootstrap";

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
  const [document, setDocument] = useState("");
  const history = useHistory();
  const [x_axis, setXAxis] = useState(0);
  const [y_axis, setYAxis] = useState(0);
  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(150);
  const [jenis_item, setJenisItem] = useState("");
  const [page, setPage] = useState("");
  const [id_item, setIdItem] = useState("");
  const [signersToolbar, setSignersToolbar] = useState([]);
  const [signersCount, setSignersCount] = useState("");
  const [selectedOption, setSelectedOption] = useState([]);
  const [error, setError] = useState("");
  let [nextStep2, setNextStep2] = useState(false);
  let [nextStep3, setNextStep3] = useState(false);
  let [nextStep4, setNextStep4] = useState(false);

  const {signatures, setSignatures} = useSignature();
  const {initials, setInitials} = useInitial();
  const {dateField, setDateField} = useDateField([]);

  const [signClicked, setSignClicked] = useState(false);
  const [initClicked, setInitClicked] = useState(false);
  const [dateClicked, setDateClicked] = useState(false);
  const [deletedSigner, setDeletedSigner] = useState("");

  const [is_deadline, setIsDeadline] = useState(false);
  const [is_download, setIsDownload] = useState(false);
  const [day_after_reminder, setDayAfterReminder] = useState(0);
  const [repeat_freq, setRepeatFreq] = useState("none");
  const [deadline, setDeadline] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [sign_permission, setSignPermission] = useState("");
  const [freeSelection, setFreeSelection] = useState(localStorage.getItem("freeSignerSelection") === "true");


  const [urutan, setUrutan] = useState("");
  const [countedItem, setCountedItem] = useState(0);

  let fileName;
  
  const minDate = useMemo(() => {
    const tomorrow = new Date(); 
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }, []);

  const handleRadioChange = (e) => {
    setIsDeadline(e.target.value === "With Deadline");
  };

  const handleDownload = (e) => {
    const value = e.target.value;
    setIsDownload(value === "Allowed");
  };


  const [selectedDoc, setSelectedDoc] = useState(
      location?.state?.selectedDoc || null
  );
  const [steps, setSteps] = useState(1);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleSignersUpdate = () => {
      const sgnData = localStorage.getItem("signers");
      const sgnCount = localStorage.getItem("signersCount");
      const selectedSigner = localStorage.getItem("selectedOption");
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

  const [documentCards, setDocumentCards] = useState([
    {
      id: Date.now(),
      id_karyawan: "",
      email: "",
      id_signers: "",
      status: "Pending",
      action: "Created", 
      jenis_item: "", 
      id_dokumen: "",
      id_item: "",
      ori_id_items: "",
      is_deadline: "",
      day_after_reminder: "",
      repeat_freq: "",
      is_download: "",
      deadline: "",
      urutan: "",
      sign_permission: "Needs to sign",
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
          jenis_item: "",
          id_dokumen: "",
          id_item: "",
          ori_id_items: "", 
          is_deadline: "",
          day_after_reminder: "",
          repeat_freq: "",
          is_download: "",
          deadline: "",
          urutan: "",
          sign_permission: "Needs to sign",
        }
      ]);
  }, []);

  useEffect(() => {
    const fetchUserData = async() => {
      const token = localStorage.getItem("token");
      const email = localStorage.getItem("email");

      if(!token || !email) return;

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
    const page = localStorage.getItem("page");

    if (x !== null)setXAxis(parseFloat(x));
    if (y !== null)setYAxis(parseFloat(y));
    if (w !== null)setWidth(parseFloat(w));
    if (h !== null)setHeight(parseFloat(h));
    if (jenis !== null)setJenisItem(jenis);
    if (page !== null)setPage(page);

   };

   window.addEventListener("localStorageUpdated", handleLocalStorageUpdate);

   handleLocalStorageUpdate();

   return() => {
    window.removeEventListener("localStorageUpdated", handleLocalStorageUpdate);
   };
  }, []);


  useEffect(() => {
  const handleButtonClicked = () => {
      const signButton = localStorage.getItem("signatureClicked"); 
      const initButton = localStorage.getItem("initialClicked");
      const dateButton = localStorage.getItem("dateFieldClicked");
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
      setNextStep2(nextStep2);
    }

    handleNextButton();
  });

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
        setSignPermission(karyawanData.sign_permission)
      } catch (error) {
        console.error("Error fetching karyawan data:", error);
      }
    };

    if (userData.id_karyawan) {
      fetchDataKaryawan();
    }
  }, [userData.id_karyawan, token]);

const handleChange = (e) => {
  setDayAfterReminder(Number(e.target.value));
}

const handleDeadline = (e) => {
  const value = e.target.value;
  setDeadline(value);

  const isValidDeadline = value && value !== "0000-00-00" || value !== "" || value !== null;

  setIsDeadline(isValidDeadline);
}

const handleRepeatReminder = (e) => {
  setRepeatFreq(e.target.value);
}

const onSortEnd = ({ oldIndex, newIndex }) => {
  const newOrder = arrayMoveImmutable(documentCards, oldIndex, newIndex)
  .map((card, idx) => ({...card, urutan: idx + 1})); 
  setDocumentCards(newOrder);
};

  useEffect(() => {
    lastIdDokumen();
    lastIdItem();
    categoryDoc();
    getName();
    getDocument();
  }, []);


  const handleAddCard = () => {
    setDocumentCards(prevCards => {
      const newUrutan = prevCards.length + 1;

      const newCard = {
        id: Date.now(),
        id_signers: "",
        id_karyawan: "",
        email: "",
        status: "Pending",
        action: "Created", 
        id_dokumen:"", 
        id_item:"",
        ori_id_items: "", 
        urutan: newUrutan,
        sign_permission: "Needs to sign"
      };

      return [...prevCards, newCard];
    });
  };


  const handleCardEmployeeChange = (id, selectedId) => {
    const selectedEmp = employeeList.find(emp => emp.id_karyawan === selectedId);
    const email = selectedEmp?.Pengguna?.[0]?.email || '';
    const id_karyawan = selectedEmp?.Pengguna?.[0]?.id_karyawan || '';

    setDocumentCards(prevCards => 
      prevCards.map(card => 
        card.id === id 
          ? { ...card, id_karyawan: selectedEmp.id_karyawan, email: email }
          : card
      )
    );
  };

  const handlePermissionChange = (id, newPermission) => {      
      setDocumentCards(prevCards => 
        prevCards.map(card => 
          card.id === id 
          ? {...card, sign_permission: newPermission} 
          : card
        )
      )

  }

 

  const deleteLogsign = async(deletedSigner, id_dokumen, id_item) => {
    try {
      await axios.delete(`http://localhost:5000/logsign/${id_dokumen}/${id_item}/${deletedSigner}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.log("Error deleting signer:", error);
      throw error;
    }
  };


  const updateSigner = async(id_dokumen, id_item, newIdSigner, oldIdSigner, signPermission) => { 
    
    try {
    const response = await axios.patch(`http://localhost:5000/logsign/${id_dokumen}/${id_item}/${oldIdSigner}`, {
      id_signers: newIdSigner,
      sign_permission: signPermission,
      id_item: null,
    }, {
        headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem("deletedSigner", JSON.stringify({ id_karyawan: oldIdSigner, id_item, timestamp: Date.now() }));
    localStorage.setItem("initialClicked", "false");
    window.dispatchEvent(new Event("localStorageUpdated"));

    toast.success("Signer updated successfully.", {
      position: "top-right", 
      autoClose: 5000, 
      hideProgressBar: true,
    });
    } catch (error) {
      console.log(error.message);
    }
  }; 

  const updateSignPermission = async(id_dokumen, idItem, newIdSigner, oldIdSigner, signPermission, x_axis, y_axis, width , height, page , jenis_item) => {     
    try {
    const response = await axios.patch(`http://localhost:5000/update-permission/${id_dokumen}/${newIdSigner}`, {
      id_signers: newIdSigner,
      sign_permission: signPermission,
      id_item: idItem,
      x_axis,
      y_axis,
      width,
      height, 
      page,
      jenis_item,
    }, {
        headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem("deletedSigner", JSON.stringify({ id_karyawan: oldIdSigner, id_item, timestamp: Date.now() }));
    localStorage.setItem("initialClicked", "false");
    window.dispatchEvent(new Event("localStorageUpdated"));

    toast.success("Sign Permission updated successfully.", {
      position: "top-right", 
      autoClose: 5000, 
      hideProgressBar: true,
    });
    } catch (error) {
      console.log(error.message);
    }
  }; 

  const updateReminder = async(id_dokumen) => {
    try {
      setIsLoading(true);

      const response = await axios.patch(`http://localhost:5000/update-reminder/${id_dokumen}`, {
      is_deadline,
      is_download,
      day_after_reminder,
      repeat_freq, 
      deadline, 
      subject, 
      message

    }, {
        headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    localStorage.setItem("freeSignerSelection", "false");
    window.dispatchEvent(new Event("freeSignerSelectionChange"));
    setFreeSelection(false);

    toast.success("Reminder updated successfully.", {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: true,
    });

    const logsigns = JSON.parse(localStorage.getItem("logsigns") || "[]");
    const id_signers = JSON.parse(localStorage.getItem("id_signers") || "[]");
    const urutan = JSON.parse(localStorage.getItem("urutan") || "[]");
    const id_item = JSON.parse(localStorage.getItem("id_item") || "[]");
    const id_karyawan = JSON.parse(localStorage.getItem("id_karyawan") || "[]");
    const delegated_signers = JSON.parse(localStorage.getItem("delegated_signers") || "[]");

    if (logsigns.length > 0) {
      await sendEmailNotification(logsigns, subject, message, id_dokumen, id_signers, urutan, id_item, id_karyawan, delegated_signers, day_after_reminder, deadline);
    } else {
      console.warn("No logsigns found.");
    }

    history.push("/admin/document-sent");
    window.location.reload();

    } catch (error) {
      toast.error("Failed to update reminder.", {
      position: "top-right", 
      autoClose: 5000, 
      hideProgressBar: true,
    });
    } finally {
      setIsLoading(false);
    }
  };

  const sendEmailNotification = async(logsigns, subject, message, id_dokumen, id_signers, urutan, id_item, id_karyawan, delegated_signers, day_after_reminder, deadline) => {
    try {
        const response = await axios.get(`http://localhost:5000/logsign-link/${id_dokumen}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      await axios.post('http://localhost:5000/send-email', {
        logsigns,
        id_dokumen,
        id_signers: logsigns.map(log => log.id_signers),
        subjectt: [subject],
        messagee: [message],
        urutan: logsigns.map(log=> log.urutan),
        id_item: logsigns.map(log => log.id_item),
        id_karyawan: logsigns.map(log => log.id_karyawan),
        delegated_signers: logsigns.map(log => log.delegated_signers),
        day_after_reminder,
        deadline,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Email notifications sent!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    } catch (error) {
      console.error("Failed to send notification email:", error.message);
      toast.error("Failed to send notification email.");
    }
  };

  const handleDeleteCard = async (id) => {
    const updatedCards = [...documentCards];
    const index = updatedCards.findIndex(card => card.id === id);

    const card = documentCards.find(c => c.id === id);
    if (!card) {
      console.error("Card not found");
      return;
    }

    if (index !== -1) {
      const deletedCard = updatedCards[index];

      const deletedIdSigner = deletedCard.id_karyawan;
      const dokId = deletedCard.id_dokumen;

      const storedIdItems = JSON.parse(localStorage.getItem("id_item")) || "[]";

      const cardIndex = documentCards.findIndex(c => c.id === id);
      const itemId = storedIdItems[cardIndex]; 

      setDeletedSigner(deletedIdSigner);

      try {
        await deleteLogsign(deletedIdSigner, dokId, itemId);
        updatedCards.splice(index, 1); 
        setDocumentCards(updatedCards);

        toast.success("Card deleted successfully.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });

      } catch (error) {
        console.error("Failed to delete signer:", error.message);
      }
    }
  };

  const handleDeleteStepper2 = async (id) => {
  const updatedCards = [...documentCards];
  const index = updatedCards.findIndex(card => card.id === id);

  if (index !== -1) {
    const deletedCard = updatedCards[index];

    const deletedIdSigner = deletedCard.id_karyawan;
    setDeletedSigner(deletedIdSigner);

    updatedCards.splice(index, 1);
    setDocumentCards(updatedCards);
  }
  };

  const handleEditCard = async (id) => {
  const card = documentCards.find(c => c.id === id);
  if (!card) {
    console.error("Card not found");
    return;
  }

  const oldIdSigner = card.ori_id_signers;
  const newIdSigner = card.id_karyawan;

  const dokId = card.id_dokumen;
  const signPermission = card.sign_permission;
  const storedIdItems = JSON.parse(localStorage.getItem("id_item")) || [];
  const cardIndex = documentCards.findIndex(c => c.id === id);
  let idItem = storedIdItems[cardIndex] || null; 

  if (!dokId) {
    console.error("Missing dokId", { dokId });
    return;
  }

  if (signPermission === "Receive a copy") { 
    localStorage.setItem("freeSignerSelection", "false");
    window.dispatchEvent(new Event("freeSignerSelectionChange"));

    await updateSigner(dokId, null, newIdSigner, oldIdSigner, signPermission);

    storedIdItems[cardIndex] = null;
    localStorage.setItem("id_item", JSON.stringify(storedIdItems));

    window.dispatchEvent(new CustomEvent("deleteFieldsForSigner", {
      detail: {id_karyawan: oldIdSigner}
    }));

  } else if (signPermission === "Needs to sign") {
    try {
      axios.patch(
        `http://localhost:5000/signer/${newIdSigner}`,
        { sign_permission: signPermission },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSteps(3);
      localStorage.setItem("freeSignerSelection", "true");
      window.dispatchEvent(new Event("freeSignerSelectionChange"));

      localStorage.setItem("pendingUpdateSigner", JSON.stringify({
        dokId,
        idItem,
        newIdSigner,
        oldIdSigner, 
        signPermission
      }));

      toast.success("Signer updated to Needs to sign.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });

    } catch (error) {
      console.error("Error updating signer:", error);
      toast.error("Failed to update signer", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: true,
      });
    }
  }

  const updatedCards = documentCards.map(c =>
    c.id === id
      ? { ...c, id_signers: newIdSigner, ori_id_signers: newIdSigner, sign_permission: signPermission }
      : c
  );

  setDocumentCards(updatedCards);
  };
  


  const saveDocument = async() => {
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
      if (nextStep3 !== true) {
        const karyawanIds = documentCards.map(card => card.id_karyawan);
        const signPermission = documentCards.map(card => card.sign_permission);
        const response = await axios.post('http://localhost:5000/signer', {
          id_signers,
          id_karyawan: karyawanIds,
          sign_permission: signPermission,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
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



  // update sign_permission
  // const saveLogSignandItems = async (e) => {
  //   e.preventDefault();

  //   try {
  //       const clickedOrder = JSON.parse(localStorage.getItem("clickedFields")) || [];
  //       let items = [];

  //       for (const type of clickedOrder) {
  //         if (type === "Signpad" && signClicked && Array.isArray(signatures)) {
  //            items.push(
  //             ...signatures.map(sig => ({
  //               jenis_item: "Signpad",
  //               x_axis: sig.x_axis,
  //               y_axis: sig.y_axis,
  //               width: sig.width,
  //               height: sig.height,
  //               page: sig.page,
  //               id_karyawan: sig.id_karyawan,
  //             })));
  //         }

  //         if (type === "Initialpad" && initClicked && Array.isArray(initials)) {
  //          items.push(
  //             ...initials.map(sig => ({
  //               jenis_item: "Initialpad",
  //               x_axis: sig.x_axis,
  //               y_axis: sig.y_axis,
  //               width: sig.width,
  //               height: sig.height,
  //               page: sig.page,
  //               id_karyawan: sig.id_karyawan,
  //             }))
  //            );
  //         }

  //         if (type === "Date" && dateClicked && Array.isArray(dateField)) {
  //           items.push(
  //             ...dateField.map(sig => ({
  //               jenis_item: "Date",
  //               x_axis: sig.x_axis,
  //               y_axis: sig.y_axis,
  //               width: sig.width,
  //               height: sig.height,
  //               page: sig.page,
  //               id_karyawan: sig.id_karyawan,
  //             }))
  //            );
  //         }
  //       }

  //       const createdSignatures = JSON.parse(localStorage.getItem("createdItemSignatures")) || [];
  //       const itemSignature = it => `${it.jenis_item}|${it.x_axis}|${it.y_axis}|${it.width}|${it.height}|${it.page}`;
  //       const newItems = items.filter(it => !createdSignatures.includes(itemSignature(it)));
        
  //       const allSigners = JSON.parse(localStorage.getItem("signers")) || [];
  //       const itemKaryawan = items.map(item => item.id_karyawan);
  //       const missingItemSigners = allSigners.filter(
  //         card => card.sign_permission === "Needs to sign" && 
  //         !itemKaryawan.includes(card.id_karyawan)
  //       );

  //       if (missingItemSigners.length > 0) {
  //         setError('Signer should have an item.');
  //         toast.error('Signer should have an item.', {
  //           position: "top-right",
  //           autoClose: 5000,
  //           hideProgressBar: true,
  //         });
  //         return;
  //       }

  //       let createdItems = [];
  //       if (newItems.length > 0) {
  //         const itemResponse = await axios.post('http://localhost:5000/item', newItems, {
  //           headers: { Authorization: `Bearer ${token}` }
  //         });

  //         createdItems = itemResponse.data.data?.items || itemResponse.data.items || [];

  //         const updatedCreated = [...new Set([...createdSignatures, ...newItems.map(itemSignature)])];
  //         localStorage.setItem("createdItemSignatures", JSON.stringify(updatedCreated));
  //       }

  //       let existingLogsigns = [];
  //       try {
  //         const res = await axios.get(`http://localhost:5000/logsign/document/${id_dokumen}`, {
  //           headers: { Authorization: `Bearer ${token}` }
  //         });
  //         existingLogsigns = res.data.data || res.data.logsigns || [];
  //       } catch (error) {
  //         console.warn("Failed to fetch existing logsigns (continuing):", error.message);
  //         existingLogsigns = [];
  //       }

  //       const createdByKaryawan = {};
  //       for (const ci of createdItems) {
  //         const match = newItems.find(it => it.jenis_item === ci.jenis_item && it.page === ci.page && it.x_axis === ci.x_axis && it.y_axis === ci.y_axis && it.width === ci.width && it.height === ci.height);
  //         if (match) createdByKaryawan[match.id_karyawan] = ci;
  //       }

  //       const existingMap = new Map(existingLogsigns.map(ls => [ls.id_signers, { ...ls }]));

  //       const signerOrderMap = {};
  //       let urutanCounter = 1;

  //       for (const card of documentCards) {
  //           if (!signerOrderMap[card.id_karyawan]) {
  //             signerOrderMap[card.id_karyawan] = urutanCounter++;
  //           }
  //       }

  //       let idItemMap = JSON.parse(localStorage.getItem("id_item_map")) || {};

  //       for(const card of documentCards) {
  //         const existing = existingMap.get(card.id_karyawan);
  //         const createdItem = createdByKaryawan[card.id_karyawan];

  //         if (existing && existing.sign_permission !== card.sign_permission && card.sign_permission === "Needs to sign") {
  //           const idItemToSet = createdItem?.id_item || existing.id_item || null;

  //           try {
  //             await axios.patch(`http://localhost:5000/logsign/${id_dokumen}/${card.id_karyawan}`, {
  //               sign_permission: "Needs to sign", 
  //               id_item: idItemToSet
  //             }, {
  //               headers: {Authorization: `Bearer ${token}`}
  //             });

  //             existingMap.set(card.id_karyawan, {
  //               ...existing,
  //               sign_permission: "Needs to sign",
  //               id_item: idItemToSet
  //             });

  //             idItemMap[card.id_karyawan] = idItemToSet;
  //             localStorage.setItem("id_item_map", JSON.stringify(idItemMap));
  //           } catch (err) {
  //             console.error(`Failed to update logsign for signer ${card.id_karyawan}:`, err.message);
  //             toast.error('Failed to update logsign.');
  //           }
  //         }
  //       }

  //       const logsignsToCreate = [];
  //       for (const card of documentCards) {
  //         const existing = existingMap.get(card.id_karyawan);
  //         const createdItem = createdByKaryawan[card.id_karyawan];
  //         const urutan = signerOrderMap[card.id_karyawan] || card.urutan || null;

  //         const correctedPermission = card.sign_permission === "Needs to sign" ? "Needs to sign" : "Receive a copy";

  //         if (!existing) {
  //           const logObj = {
  //             action: "Created",
  //             status: "Pending", 
  //             id_dokumen, 
  //             id_karyawan, 
  //             id_signers: card.id_karyawan,
  //             sign_permission: correctedPermission,
  //             id_item: createdItem?.id_item || null,
  //             subject, 
  //             message, 
  //             delegated_signers: createdItem?.delegated_signers || null,
  //             urutan, 
  //           }; 
  //           logsignsToCreate.push(logObj);
  //           idItemMap[logObj.id_signers] = logObj.id_item || null;
  //         }
  //       }


  //       if (logsignsToCreate.length > 0) {
  //         try {

  //           const finalLogsignsOrdered = documentCards.map(card => {
  //             const exist = existingMap.get(card.id_karyawan);
  //             if (exist) return exist;
  //             const created = logsignsToCreate.find(l => l.id_signers === card.id_karyawan);
  //             if (created) return created;
  //             return null;
  //           }).filter(Boolean);

  //           localStorage.setItem("logsigns", JSON.stringify(finalLogsignsOrdered));

  //           const signerIds = finalLogsignsOrdered.map(l => l.id_signers);
  //           const urutanArr = finalLogsignsOrdered.map(l => l.urutan);
  //           const delegatedArr = finalLogsignsOrdered.map(l => l.delegated_signers ?? null);
  //           const senderIds = finalLogsignsOrdered.map(l => l.id_karyawan ?? null);
  //           const idItemArr = finalLogsignsOrdered.map(l => l.id_item ?? null);

  //           localStorage.setItem("id_signers", JSON.stringify(signerIds));
  //           localStorage.setItem("urutan", JSON.stringify(urutanArr));
  //           localStorage.setItem("id_karyawan", JSON.stringify(senderIds));
  //           localStorage.setItem("delegated_signers", JSON.stringify(delegatedArr));
  //           localStorage.setItem("id_item", JSON.stringify(idItemArr));

  //           localStorage.setItem("id_item_map", JSON.stringify(idItemMap));

  //           await axios.post('http://localhost:5000/logsign', {logsigns: logsignsToCreate}, {
  //             headers: {Authorization: `Bearer: ${token}`}
  //           });
  //         } catch (error) {
  //           console.error("Failed to create logsigns:", error.message);
  //           toast.error("Failed to create logsigns.");
  //           return;
  //         }
  //       } else {
  //         const finalLogsignsOrdered = documentCards.map(card => existingMap.get(card.id_karyawan)).filter(Boolean);

  //         localStorage.setItem("logsigns", JSON.stringify(finalLogsignsOrdered));
          
  //         const signerIds = finalLogsignsOrdered.map(l => l.id_signers);
  //         const urutanArr = finalLogsignsOrdered.map(l => l.urutan);
  //         const delegatedArr = finalLogsignsOrdered.map(l => l.delegated_signers ?? null);
  //         const senderIds = finalLogsignsOrdered.map(l => l.id_karyawan ?? null);
  //         const idItemArr = finalLogsignsOrdered.map(l => l.id_item ?? null);

  //         localStorage.setItem("id_signers", JSON.stringify(signerIds));
  //         localStorage.setItem("urutan", JSON.stringify(urutanArr));
  //         localStorage.setItem("id_karyawan", JSON.stringify(senderIds));
  //         localStorage.setItem("delegated_signers", JSON.stringify(delegatedArr));
  //         localStorage.setItem("id_item", JSON.stringify(idItemArr));
  //         localStorage.setItem("id_item_map", JSON.stringify(idItemMap));
  //       }

  //       try {
  //         const res2 = await axios.get(`http://localhost:5000/logsign/document/${id_dokumen}`, {
  //           headers: { Authorization: `Bearer ${token}` }
  //         }); 
  //         existingLogsigns = res2.data.data || res2.data.logsigns || existingLogsigns;
  //       } catch (error) {
  //       }

  //       setDocumentCards(prevCards =>
  //         prevCards.map((card) => {
  //           const matchItem = items.find(item => item.id_karyawan === card.id_karyawan);
  //           const created = createdByKaryawan[card.id_karyawan] || null;
  //           const id_item_from_map = JSON.parse(localStorage.getItem("id_item_map") || "{}")[card.id_karyawan] || null;

  //           return {
  //             ...card,
  //             id_signers: matchItem?.id_karyawan || card.id_signers,
  //             ori_id_signers: matchItem?.id_karyawan || card.ori_id_signers,
  //             id_item: (created?.id_item) || id_item_from_map || card.id_item || "",
  //             ori_id_items: (created?.id_item) || id_item_from_map || card.ori_id_items || "",
  //             id_dokumen: id_dokumen, 
  //             is_deadline: is_deadline,
  //             day_after_reminder: day_after_reminder,
  //             repeat_freq: repeat_freq,
  //             is_download: is_download,
  //             deadline: deadline, 
  //             urutan: signerOrderMap[card.id_karyawan] || card.urutan,
  //             x_axis: matchItem?.x_axis || card.x_axis,
  //           };
  //         })
  //       );
  //       localStorage.removeItem("clickedFields");
  //       toast.success("Logsigns and items created successfully!", {
  //         position: "top-right",
  //         autoClose: 5000,
  //         hideProgressBar: true,
  //       });

  //     nextLastStep();
  //   } catch (error) {
  //     console.error("Failed to save logsigns and items:", error.message);
  //     toast.error("Failed to save logsigns and items.");
  //   }
  // };

  const saveLogSignandItems = async (e) => {
    e.preventDefault();

    try {
        const clickedOrder = JSON.parse(localStorage.getItem("clickedFields")) || [];
        let items = [];

        for (const type of clickedOrder) {
          if (type === "Signpad" && signClicked && Array.isArray(signatures)) {
             items.push(
              ...signatures.map(sig => ({
                jenis_item: "Signpad",
                x_axis: sig.x_axis,
                y_axis: sig.y_axis,
                width: sig.width,
                height: sig.height,
                page: sig.page,
                id_karyawan: sig.id_karyawan,
              })));
          }

          if (type === "Initialpad" && initClicked && Array.isArray(initials)) {
           items.push(
              ...initials.map(sig => ({
                jenis_item: "Initialpad",
                x_axis: sig.x_axis,
                y_axis: sig.y_axis,
                width: sig.width,
                height: sig.height,
                page: sig.page,
                id_karyawan: sig.id_karyawan,
              }))
             );
          }

          if (type === "Date" && dateClicked && Array.isArray(dateField)) {
            items.push(
              ...dateField.map(sig => ({
                jenis_item: "Date",
                x_axis: sig.x_axis,
                y_axis: sig.y_axis,
                width: sig.width,
                height: sig.height,
                page: sig.page,
                id_karyawan: sig.id_karyawan,
              }))
             );
          }
        }

        const createdSignatures = JSON.parse(localStorage.getItem("createdItemSignatures")) || [];
        const itemSignature = it => `${it.jenis_item}|${it.x_axis}|${it.y_axis}|${it.width}|${it.height}|${it.page}`;
        const newItems = items.filter(it => !createdSignatures.includes(itemSignature(it)));
        
        const allSigners = JSON.parse(localStorage.getItem("signers")) || [];
        const itemKaryawan = items.map(item => item.id_karyawan);
        const missingItemSigners = allSigners.filter(
          card => card.sign_permission === "Needs to sign" && 
          !itemKaryawan.includes(card.id_karyawan)
        );

        if (missingItemSigners.length > 0) {
          setError('Signer should have an item.');
          toast.error('Signer should have an item.', {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: true,
          });
          return;
        }

        let createdItems = [];
        if (newItems.length > 0) {
          const itemResponse = await axios.post('http://localhost:5000/item', newItems, {
            headers: { Authorization: `Bearer ${token}` }
          });

          createdItems = itemResponse.data.data?.items || itemResponse.data.items || [];

          const updatedCreated = [...new Set([...createdSignatures, ...newItems.map(itemSignature)])];
          localStorage.setItem("createdItemSignatures", JSON.stringify(updatedCreated));
        }

        let existingLogsigns = [];
        try {
          const res = await axios.get(`http://localhost:5000/logsign/document/${id_dokumen}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          existingLogsigns = res.data.data || res.data.logsigns || [];
        } catch (error) {
          console.warn("Failed to fetch existing logsigns (continuing):", error.message);
          existingLogsigns = [];
        }

        const createdByKaryawan = {};
        for (const ci of createdItems) {
          const match = newItems.find(it => it.jenis_item === ci.jenis_item && it.page === ci.page && it.x_axis === ci.x_axis && it.y_axis === ci.y_axis && it.width === ci.width && it.height === ci.height);
          if (match) {
            if (!createdByKaryawan[match.id_karyawan]) {
              createdByKaryawan[match.id_karyawan] = [];
            }
            createdByKaryawan[match.id_karyawan].push(ci);
          }

        }
        

        // console.log("createdByKaryawan:", createdByKaryawan);

        let countsByKaryawan = {};
        Object.keys(createdByKaryawan).forEach(id => {
          countsByKaryawan[id] = createdByKaryawan[id].length;
        });

        console.log("countsByKaryawan:", countsByKaryawan);
        

        const existingMap = new Map(existingLogsigns.map(ls => [ls.id_signers, ls]));

        const signerOrderMap = {};
        let urutanCounter = 1;

        for (const card of documentCards) {
            if (!signerOrderMap[card.id_karyawan]) {
              signerOrderMap[card.id_karyawan] = urutanCounter++;
            }
        }

        let idItemMap = JSON.parse(localStorage.getItem("id_item_map")) || {};

        for(const card of documentCards) {
          const existing = existingMap.get(card.id_karyawan);
          // const createdItem = createdByKaryawan[card.id_karyawan];
          const createdItemsForKaryawan = createdByKaryawan[card.id_karyawan] || [];
          let created = null;
          createdItemsForKaryawan.forEach(item => {
            if (!created) {
              created = item
            }
          });

          console.log("createdItemsForKaryawan:", createdItemsForKaryawan);

          if (existing && existing.sign_permission !== card.sign_permission && card.sign_permission === "Needs to sign") {
            const idItemToSet = created?.id_item || existing.id_item || null;

            try {
              await axios.patch(`http://localhost:5000/logsign/${id_dokumen}/${card.id_karyawan}`, {
                sign_permission: "Needs to sign", 
                id_item: idItemToSet
              }, {
                headers: {Authorization: `Bearer ${token}`}
              });

              existingMap.set(card.id_karyawan, {
                ...existing,
                sign_permission: "Needs to sign",
                id_item: idItemToSet
              });

              idItemMap[card.id_karyawan] = idItemToSet;
              localStorage.setItem("id_item_map", JSON.stringify(idItemMap));
            } catch (err) {
              console.error(`Failed to update logsign for signer ${card.id_karyawan}:`, err.message);
              toast.error('Failed to update logsign.');
            }
          }
        }

        // if signer >1 & sign_permission = Needs to sign, logsign masih ter create 2x
        const logsignsToCreate = [];
        
        // if (countsByKaryawan > 1) {
        //   for (const item of createdItems) {
        //     for (const card of documentCards) {
        //       const existing = existingMap.get(card.id_karyawan);
        //       // const createdItem = createdByKaryawan[card.id_karyawan];
        //       const urutan = signerOrderMap[card.id_karyawan] || card.urutan || null;

        //       const correctedPermission = card.sign_permission === "Needs to sign" ? "Needs to sign" : "Receive a copy";

        //       // console.log("Item -- Id item:", item.id_item);
        //       if (!existing) {
        //         const logObj = {
        //           action: "Created",
        //           status: "Pending", 
        //           id_dokumen, 
        //           id_karyawan, 
        //           id_signers: card.id_karyawan,
        //           sign_permission: correctedPermission,
        //           id_item: card.sign_permission === "Needs to sign" ? item.id_item : null,
        //           subject, 
        //           message, 
        //           delegated_signers: item.delegated_signers || null,
        //           urutan, 
        //         }; 
        //         logsignsToCreate.push(logObj);
        //         idItemMap[`${card.id_karyawan}_${item.id_item}`] = item.id_item;
        //       }
        //     }
        //   }
        // } else {
        //   for (const card of documentCards) {
        //     const existing = existingMap.get(card.id_karyawan);
        //     const createdItemsForKaryawan = createdByKaryawan[card.id_karyawan] || [];
        //     let created = null;
        //     createdItemsForKaryawan.forEach(item => {
        //       if (!created) {
        //         created = item
        //       }
        //     });

        //     console.log("createdItemsForKaryawan:", createdItemsForKaryawan);
        //     const urutan = signerOrderMap[card.id_karyawan] || card.urutan || null;

        //     const correctedPermission = card.sign_permission === "Needs to sign" ? "Needs to sign" : "Receive a copy";

        //     if (!existing) {
        //       const logObj = {
        //         action: "Created",
        //         status: "Pending", 
        //         id_dokumen, 
        //         id_karyawan, 
        //         id_signers: card.id_karyawan,
        //         sign_permission: correctedPermission,
        //         id_item: created?.id_item,
        //         subject, 
        //         message, 
        //         delegated_signers: created?.delegated_signers || null,
        //         urutan, 
        //       }; 
        //       logsignsToCreate.push(logObj);
        //       idItemMap[`${card.id_karyawan}_${card.id_item}`] = logObj.id_item || null;
        //     }
        //   }
        // }

        for (const card of documentCards) {
          const existing = existingMap.get(card.id_karyawan);
          const createdItemsForKaryawan = createdByKaryawan[card.id_karyawan] || [];
          const urutan = signerOrderMap[card.id_karyawan] || card.urutan || null;
          const correctedPermission = card.sign_permission === "Needs to sign" ? "Needs to sign" : "Receive a copy";

          if (!existing) {
            if (createdItemsForKaryawan.length > 1) {
              for (const it of createdItemsForKaryawan) {
                const logObj = {
                  action: "Created",
                  status: "Pending",
                  id_dokumen,
                  id_karyawan,
                  id_signers: card.id_karyawan,
                  sign_permission: correctedPermission,
                  id_item: card.sign_permission === "Needs to sign" ? it.id_item : null,
                  subject,
                  message,
                  delegated_signers: it.delegated_signers || null,
                  urutan,
                };
                logsignsToCreate.push(logObj);
                idItemMap[`${card.id_karyawan}_${it.id_item}`] = it.id_item;
              }
            } else {
              const created = createdItemsForKaryawan[0] || null;
              const logObj = {
                action: "Created",
                status: "Pending",
                id_dokumen,
                id_karyawan,
                id_signers: card.id_karyawan,
                sign_permission: correctedPermission,
                id_item: created?.id_item || null,
                subject,
                message,
                delegated_signers: created?.delegated_signers || null,
                urutan,
              };
              logsignsToCreate.push(logObj);
              idItemMap[card.id_karyawan] = logObj.id_item || null;
            }
          }
        }



        if (logsignsToCreate.length > 0) {
          try {

            await axios.post('http://localhost:5000/logsign', {logsigns: logsignsToCreate}, {
              headers: {Authorization: `Bearer: ${token}`}
            });

            localStorage.setItem("id_item_map", JSON.stringify(idItemMap));
            localStorage.setItem("logsigns", JSON.stringify(logsignsToCreate));

          } catch (error) {
            console.error("Failed to create logsigns:", error.message);
            toast.error("Failed to create logsigns.");
            return;
          }
        } else {
          const finalLogsignsOrdered = documentCards.map(card => existingMap.get(card.id_karyawan)).filter(Boolean);

          localStorage.setItem("logsigns", JSON.stringify(finalLogsignsOrdered));
          
          const signerIds = finalLogsignsOrdered.map(l => l.id_signers);
          const urutanArr = finalLogsignsOrdered.map(l => l.urutan);
          const delegatedArr = finalLogsignsOrdered.map(l => l.delegated_signers ?? null);
          const senderIds = finalLogsignsOrdered.map(l => l.id_karyawan ?? null);
          const idItemArr = finalLogsignsOrdered.map(l => l.id_item ?? null);

          localStorage.setItem("id_signers", JSON.stringify(signerIds));
          localStorage.setItem("urutan", JSON.stringify(urutanArr));
          localStorage.setItem("id_karyawan", JSON.stringify(senderIds));
          localStorage.setItem("delegated_signers", JSON.stringify(delegatedArr));
          localStorage.setItem("id_item", JSON.stringify(idItemArr));
          localStorage.setItem("id_item_map", JSON.stringify(idItemMap));
        }

        try {
          const res2 = await axios.get(`http://localhost:5000/logsign/document/${id_dokumen}`, {
            headers: { Authorization: `Bearer ${token}` }
          }); 
          existingLogsigns = res2.data.data || res2.data.logsigns || existingLogsigns;
        } catch (error) {
        }

        setDocumentCards(prevCards =>
          prevCards.map((card) => {
            // const matchItem = items.find(item => item.id_karyawan === card.id_karyawan);
            // const created = createdByKaryawan[card.id_karyawan] || null;
            // const id_item_from_map = JSON.parse(localStorage.getItem("id_item_map") || "{}")[card.id_karyawan] || null;

            const matchItem = createdByKaryawan[card.id_karyawan] || {};
            const id_item_from_map = Object.values(idItemMap).find(id => id === matchItem.id_item);

            return {
              ...card,
              // id_signers: matchItem?.id_karyawan || card.id_signers,
              // ori_id_signers: matchItem?.id_karyawan || card.ori_id_signers,
              id_item:  id_item_from_map || card.id_item || "",
              // ori_id_items: id_item_from_map || card.ori_id_items || "",
              id_dokumen, 
              // is_deadline: is_deadline,
              // day_after_reminder: day_after_reminder,
              // repeat_freq: repeat_freq,
              // is_download: is_download,
              // deadline: deadline, 
              urutan: signerOrderMap[card.id_karyawan] || card.urutan,
              x_axis: matchItem.x_axis || card.x_axis,
            };
          })
        );
        localStorage.removeItem("clickedFields");
        toast.success("Logsigns and items created successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });

      nextLastStep();
    } catch (error) {
      console.error("Failed to save logsigns and items:", error.message);
      toast.error("Failed to save logsigns and items.");
    }
  };


  useEffect(() => {
  if (selectedDoc?.id_dokumen) {
    const dokId = selectedDoc.id_dokumen;
    setIdDokumen(dokId);
    localStorage.setItem("id_dokumen", dokId);

    const signers = JSON.parse(localStorage.getItem("signers")) || [];

    const initialCards = signers.map((signer) => ({
      id: Date.now() + Math.random(), 
      id_karyawan: signer.value,
      email: signer.label,
      id_signers: signer.value,
      status: "Pending",
      action: "Created",
      id_item: "",
      jenis_item: "",
      id_dokumen: dokId,
      ori_id_items: "",
      ori_id_signers: signer.value,
      is_deadline: "",
      day_after_reminder: "",
      repeat_freq: "",
      is_download: "",
      deadline: ""
    }));

    setDocumentCards(initialCards);
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

      const handleNextStep3 = true;
      setNextStep3(handleNextStep3);
      localStorage.setItem("nextStep3", handleNextStep3);
    }
  };

   const nextLastStep = () => {
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
  };

  const handleFileChange = (event) => {
    if (event.target.files && event.target.files.length > 0) {
      const uploadedFile = event.target.files[0];
      fileName = uploadedFile.name;
      
      setNamaDokumen(fileName);
      setFile(uploadedFile);
      
    }
  };

  const stepTitle = [
    {title: "Upload Document"},
    {title: "Choose Signers"},
    {title: "Place Fields"},
    {title: "Review & Send"},
  ];


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

    let newId = "F00001";
    if (response.data?.lastId) {
        const lastIdNumber = parseInt(response.data.lastId.substring(2), 10);
        const incrementedIdNumber = (lastIdNumber + 1).toString().padStart(5, '0');
        newId = `F${incrementedIdNumber}`;
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
    if (id_dokumen) {
      localStorage.setItem("id_dokumen", id_dokumen);
    }
  }, [steps, id_dokumen]);

  
  useEffect(() => {
    const storedIdItems = JSON.parse(localStorage.getItem("id_item")) || "[]";
  }, [id_item]);

const SortableList = SortableContainer(({ items, handleCardEmployeeChange, handlePermissionChange, handleDeleteCard, employeeName, ...props }) => {
  return (
    <div>
      {items.map((card, index) => (
        <SortableItem
          key={`item-${card.id}`}
          index={index}
          card={card}
          handleCardEmployeeChange={handleCardEmployeeChange}
          handlePermissionChange={handlePermissionChange}
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
      {isLoading === false ? (
        <div className="App">
          <Container fluid>
            <Heartbeat/>
            <Row>
              <Col md="12">
                <Card className="p-3">
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
                            <p className="fs-5 mt-3"><strong>Add Signers or Recipients</strong></p>
                            <Form onSubmit={nexThirdStep}>
                              <SortableList 
                                items={documentCards}
                                onSortEnd={onSortEnd}
                                useDragHandle={false}
                                handleCardEmployeeChange={handleCardEmployeeChange}
                                handlePermissionChange={handlePermissionChange}
                                handleEditCard={handleEditCard}
                                handleDeleteCard={handleDeleteStepper2}
                                employeeName={employeeName}
                                value={employeeName.id_karyawan}
                              />
                              <Button variant="outline-primary" onClick={handleAddCard} className="mt-3">
                                <FaPlusCircle className="mb-1"/> Add Signer
                              </Button>
                            </Form>

                            <Form>
                              <p className="fs-5 mt-3 mb-0"><strong>Message to Recipients</strong></p>
                              <Row>
                                  <Col md="12">
                                      <Form.Group>
                                          <label>Email Subject</label>
                                          <Form.Control
                                              type="text"
                                              value={subject}
                                              onChange={(e) => setSubject(e.target.value)}
                                          ></Form.Control>
                                      </Form.Group>
                                  </Col>
                              </Row>
                              <Row>
                                  <Col md="12">
                                      <Form.Group>
                                          <label>Message</label>
                                          <Form.Control
                                              as="textarea"
                                              value={message}
                                              onChange={(e) => setMessage(e.target.value)}
                                              rows={4}
                                          ></Form.Control>
                                      </Form.Group>
                                  </Col>
                              </Row>
                            </Form>
                          </> 
                          )}
                        </>
                        <div className="clearfix"></div>
                    </div>
                  </Card.Body>
                </Card>

                {steps === 3 && (
                  <div className="pdf-preview-container mt-4">
                    <PreviewDocument />
                  </div>
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
                            <span className="text-danger required-select">(*) Required.</span>
                            <p className="fs-5 mt-3"><strong>Recipients</strong></p>
                            <SortableList 
                              items={documentCards}
                              // onSortEnd={onSortEnd}
                              useDragHandle={true}
                              handleCardEmployeeChange={handleCardEmployeeChange}
                              handlePermissionChange={handlePermissionChange}
                              handleDeleteCard={handleDeleteCard}
                              handleEditCard={handleEditCard}
                              employeeName={employeeName}
                              value={employeeName.id_karyawan}
                            />
                          </div>
                        </Form>
        
                        <Form>
                          <Row className="mt-3 mb-2">
                            <Col md="12">
                              <Form.Group>
                                <span className="text-danger">*</span>
                                <label className="mt-2">Using deadline</label>
                                {["Without deadline", "With Deadline"].map((option, idx) => (
                                  <Form.Check
                                    key={idx}
                                    type="radio"
                                    id={`deadline-${idx}`}
                                    label={option}
                                    className="mt-2 radio-doc-settings"
                                    value={option}
                                    checked={is_deadline === (option === "With Deadline")}
                                    onChange={handleRadioChange}
                                  />
                                ))}
                              </Form.Group>
                            </Col>
                          </Row>
                          <Row className="mt-3 mb-2">
                            <Col md="12">
                              <label className="mt-2">Set a deadline</label>
                              <Form.Control
                                  type="date"
                                  value={deadline}
                                  onChange={handleDeadline}
                                  min={minDate}
                              />
                            </Col>
                          </Row>

                          <Row className="mt-3 mb-2">
                            <Col md="12">
                                <span className="text-danger">*</span>
                                <label className="mt-2">Choose day reminder recipient</label>

                              <Form.Group as={Row} className="align-items-center">
                              <Col xs="auto">
                                <Form.Select value={day_after_reminder} onChange={handleChange} style={{ width: '80px' }}>
                                  {[...Array(30)].map((_, i = 0) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}
                                    </option>
                                  ))}
                                </Form.Select>
                              </Col>
                              <Col xs="auto">
                                <span style={{ fontSize: '16px' }}>
                                  day(s) after recipient receives documents
                                </span>
                              </Col>
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mt-3 mb-2">
                            <Col md="12">
                                <label className="mt-2">Choose repeat reminder</label>

                              <Form.Group as={Row} className="align-items-center">
                              <Col md="12">
                                <Form.Select
                                  value={repeat_freq}
                                  onChange={handleRepeatReminder}
                                  style={{maxWidth: "250px"}}
                                >
                                {[ 
                                  {label: "No repeat reminder", value:"none"},
                                  {label: "Every day", value: "daily"}, 
                                  {label: "Every 3 days", value: "3days"},
                                  {label: "Weekly", value: "weekly"}, 
                                  {label: "Monthly", value: "monthly"}
                                ].map((option, idx) => (
                                  <option key={idx} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}

                                </Form.Select>
                              </Col>
                            </Form.Group>
                            </Col>
                          </Row>

                          <Row className="mt-3 mb-2">
                            <Col md="12">
                              <Form.Group>
                                <span className="text-danger">*</span>
                                <label className="mt-2">
                                  Allow recipients to download document
                                </label>
                                {["Not Allowed", "Allowed"].map((option, idx) => (
                                  <Form.Check
                                    key={idx}
                                    type="radio"
                                    id={`download-${idx}`}
                                    label={option}
                                    className="mt-2 radio-doc-settings"
                                    value={option}
                                    checked={is_download !== (option === "Not Allowed")}
                                    onChange={handleDownload}
                                  />
                                ))}
                              </Form.Group>
                            </Col>
                          </Row>
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
                  <Button variant="primary" type="submit" className="btn-fill w-100" onClick={handleNext} disabled={steps === 1 && (nama_dokumen === "" || id_kategoridok === "" || category ==="" || file === null) }>
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
                  <Button variant="success" type="submit" className="btn-fill w-100" onClick={() => updateReminder(id_dokumen)} disabled={isLoading} >
                  <>
                    <FaRegArrowAltCircleRight style={{ marginRight: '8px' }} />
                    Send
                  </>
                  </Button>
                </div>
                
              </>
            )}
          </div>
          </footer>
        </div>
      ) : (
        <>
        <div className="d-flex flex-column flex-wrap align-items-center justify-content-center" style={{ height: '80vh'}}>
          <ReactLoading type="cylon" color="#fb8379" height={200} width={200} />
          <h3 style={{paddingTop:'50px'}}>Please Wait...</h3>
        </div>
        </>
      )}
    </>

  );
}

export default UploadDocument;

