import React, { useEffect, useState } from "react";
import axios from "axios";
import SearchBar from "components/Search/SearchBar.js";
import { CDBTable, CDBTableHeader, CDBTableBody } from 'cdbreact';
import {Alert, Container, Row, Col, Badge} from "react-bootstrap";
import {FaInfoCircle, FaTrashAlt, FaSortUp, FaSortDown, FaUpload} from 'react-icons/fa'; 
import Pagination from "react-js-pagination";

function Trash() {
    const [document, setDocument] = useState([]); 
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("id_dokumen");
    const [sortOrder, setSortOrder] = useState("asc");
    const [sortOrderDibayar, setSortOrderDibayar] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [loading, setLoading] = useState(true);
    const [documentStatus, setDocumentStatus] = useState([]);
    const [documentDeadline, setDocumentDeadline] = useState([]);

    const today = new Date();
    // today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const currentMonth = (today.getMonth() + 1).toString().padStart(2, '0');
    const todayDate = today.getDate().toString().padStart(2, '0');
    const formattedDate = `${currentYear}-${currentMonth}-${todayDate}`;

    const token = localStorage.getItem("token");
    

    const selectedCategory = location.state?.selectedCategory;
    const selectedDocuments = location.state?.selectedDocument;

    const getStatusById = (id) => {
      const statusObj = documentStatus.find(ds => ds.id_dokumen === id);
      return statusObj ? statusObj.status : "-";
    };

    const filteredDocument = document.filter((doc) => {
    const status = getStatusById(doc.id_dokumen);
      return (
        (doc.id_dokumen && String(doc.id_dokumen).includes(searchQuery)) ||
        (doc.nama_dokumen && String(doc.nama_dokumen).toLowerCase().includes(searchQuery)) ||
        (status && status.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.deadline && String(doc.deadline).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc.createdAt && String(doc.createdAt).toLowerCase().includes(searchQuery.toLowerCase())) ||
        (doc?.Kategori?.kategori && doc.Kategori.kategori.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    });

    const handleSort = (key) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      setSortOrderDibayar(sortOrderDibayar === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
      setSortOrderDibayar("asc");
    }
  }


    const sortedDocument = filteredDocument.sort((a, b) => {
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
    const currentItems = sortedDocument.slice(indexOfFirstItem, indexOfLastItem);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber); 
    }

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value.toLowerCase());
    };
    
    
    const getDocument = async (selectedCategory) =>{
    try {
        const url = selectedCategory 
        ? `http://localhost:5000/trash/category/${selectedCategory}`
        : `http://localhost:5000/get-trash`;

        const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        setDocument(response.data || []);
    } catch (error) {
        console.error("Error fetching data:", error.message); 
    } finally {
        setLoading(false);
    }
    };

    const getDocumentStatus = async () =>{
    try {
        const url = `http://localhost:5000/document-status`;

        const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        setDocumentStatus(response.data);
    } catch (error) {
        console.error("Error fetching data:", error.message); 
    } finally {
        setLoading(false);
    }
    };

    const getDocumentDeadline = async () =>{
    try {
        const url = `http://localhost:5000/document-deadline`;

        const response = await axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
        });
        setDocumentDeadline(response.data);
    } catch (error) {
        console.error("Error fetching data:", error.message); 
    } finally {
        setLoading(false);
    }
    };



    const getDeadlineById = (id) => {
        const deadlineObj = documentDeadline.find(ds => ds.id_dokumen === id);
        return deadlineObj ? deadlineObj.deadline : "-";
    };

    
    useEffect(() => {
        getDocument(selectedCategory);
        getDocumentStatus();
        getDocumentDeadline();
    }, [selectedCategory]);

    const deleteDocument = async(id_dokumen) =>{
        try {
        await axios.delete(`http://localhost:5000/document/${id_dokumen}`,
        {
            headers: {Authorization: `Bearer ${token}`}
        }
        ); 
        
        toast.success("Document was deleted successfully!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
        getDocument(); 
        window.location.reload();
        } catch (error) {
        console.log(error.message); 
        }
    };

    const restoreDocument = async(id_dokumen) =>{
      try {
        await axios.patch(`http://localhost:5000/restore-doc/${id_dokumen}`,
        {is_deleted: false},
        {
          headers: {Authorization: `Bearer ${token}`}
        }
      ); 
        
        toast.success("Document has been restored", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: true,
        });
        getDocument(); 
        window.location.reload();
      } catch (error) {
        console.log(error.message); 
      }
    };

     return (
        <>
          <Container fluid>
            <Row>
              <SearchBar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>      
              <Col md="12">
              <Alert className="my-4" variant="info"><FaInfoCircle className="mr-2"/>Documents that have been in this folder more than 7 days will be automatically deleted.</Alert>

              <CDBTable hover  className="mt-4">
                <CDBTableHeader>
                  <tr>
                    <th onClick={() => handleSort("id_dokumen")}>Document ID {sortBy==="id_dokumen" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                    <th className="border-0" onClick={() => handleSort("nama_dokumen")}>Document Name {sortBy==="nama_dokumen" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                    <th className="border-0" onClick={() => handleSort("id_kategoridok")}>Category {sortBy==="id_kategoridok" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                    <th className="border-0">Status</th>
                    <th className="border-0">Deadline</th>
                    <th className="border-0" onClick={() => handleSort("createdAt")}>Uploaded {sortBy==="createdAt" && (sortOrder === "asc" ? <FaSortUp/> : <FaSortDown/>)}</th>
                    <th className="border-0" colSpan={3}>Action</th>
                  </tr>
                </CDBTableHeader>
                <CDBTableBody>
                  {currentItems
                  .filter(document => document.is_deleted)
                  .map((document, index) => (
                    <tr key={document.id_dokumen}>
                      <td className="text-center">{document.id_dokumen}</td>
                      <td className="text-center">{document.nama_dokumen}</td>
                      <td className="text-center">{document?.Kategori?.kategori || 'N/A'}</td>
                      <td className="text-center">
                         {getStatusById(document.id_dokumen) === "Decline" ? (
                            <Badge pill bg="danger">Decline</Badge>
                          ) : getStatusById(document.id_dokumen) === "Completed" &&
                            document.LogSigns.every((log) => log.is_submitted === true) ?
                          (
                            <Badge pill bg="success">Completed</Badge>
                          ) : (
                            <Badge pill bg="secondary">Pending</Badge>
                          )}
                      </td>
                      <td className="text-center">{getDeadlineById(document.id_dokumen) !== '0000-00-00' ? getDeadlineById(document.id_dokumen) : '-'}</td>
                      <td className="text-center">{new Date(document.createdAt).toLocaleString("en-GB", { timeZone: "Asia/Jakarta" }).replace(/\//g, '-').replace(',', '')}</td>
                      <td className="text-center px-0">
                      <button
                        style={{background:"transparent", border:"none"}} 
                        disabled={document.user_active === true}
                        >
                        <FaTrashAlt 
                          type="button"
                          onClick={() => deleteDocument(document.id_dokumen)}
                          className="text-danger btn-action"
                        />
                      </button>
                      </td>
                      <td className="text-center px-0">
                      <button
                        style={{background:"transparent", border:"none"}} 
                        disabled={document.user_active === true}
                        >
                        <FaUpload 
                          type="button"
                          onClick={() => restoreDocument(document.id_dokumen)}
                          className="text-primary btn-action"
                        />
                      </button>
                      </td>
                     
    
                    </tr>
                  ))}
                </CDBTableBody>
              </CDBTable>
                
                <div className="pagination-container">
                  <Pagination
                        activePage={currentPage}
                        itemsCountPerPage={itemsPerPage}
                        totalItemsCount={filteredDocument.length}
                        pageRangeDisplayed={5}
                        onChange={handlePageChange}
                        itemClass="page-item"
                        linkClass="page-link"
                  />
                </div>
              </Col>
            </Row>
          </Container>
        </>
      );
}

export default Trash;