import React, { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { FaFileImport, FaFileCsv } from "react-icons/fa";

const ImportUser = ({showImportModal, setShowImportModal, onSuccess}) => {
  const token = localStorage.getItem("token");
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleFileImport = () => {
    if (file.type !== "text/csv") {
      alert("File should be in CSV format.");
      return;
    }
  
    const formData = new FormData();
    formData.append("csvfile", file);

    fetch("http://10.70.10.20:5000/user/import-csv", {
      method: "POST",
      body: formData,
      headers: {
        Authorization: `Bearer ${token}`,
    },
    })
    .then(async (response) => {
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText);
        }
        return response.json();
    })
    .then((data) => {
        if (data.success) {
            setShowImportModal(false); 
            onSuccess(); 
        } else {
            alert(data.message || "Failed to import user data.");
        }
    })
    .catch((error) => {
        console.error("Error:", error);
        alert(`Failed to import user data: ${error.message}`);
    });

  };

  const downloadCSV = (data) => {
    const header = ["email", "role", "id_karyawan"];
  
    const csvContent = [header]
      .map((e) => e.join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "master-user-format.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Modal 
      className="modal-primary"
      show={showImportModal}
      onHide={() => setShowImportModal(false)}>
      <Modal.Header className="text-center pb-1">
        <h3 className="mt-2 mb-2">Import User</h3>
      </Modal.Header>
      <Modal.Body className="text-left pt-0 mt-3">
        <div>
          <span className="text-danger required-select">*Use the CSV format below to import user data</span><br/>
          <Button
            className="btn-fill pull-right mb-4 mt-2"
            type="button"
            variant="warning"
            onClick={() => downloadCSV()}>
            <FaFileCsv style={{ marginRight: '8px' }} />
            Download CSV Format
          </Button>
          <p>Select the CSV file to import user</p>
          <input type="file" accept=".csv" onChange={handleFileChange}/>
          <div className="d-grid d-flex justify-content-end">
          <Button
            className="btn-fill pull-right mt-2 mb-2"
            type="button"
            variant="info"
            onClick={handleFileImport}
            disabled={!file}
          >
            <FaFileImport style={{ marginRight: "8px" }} />
            Import Data
          </Button>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ImportUser;


