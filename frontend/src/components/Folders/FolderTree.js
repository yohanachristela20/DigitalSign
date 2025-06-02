import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useHistory } from 'react-router-dom';
import { FaPlus, FaEllipsisV, FaRegEdit } from 'react-icons/fa';
import AddCategory from 'components/ModalForm/AddCategoryDoc.js';
import EditCategory from 'components/ModalForm/EditCategory.js';
import { toast } from 'react-toastify';
import {Button, Container, Row, Col, Card, Table, Spinner, Badge} from "react-bootstrap";
import "../../assets/scss/lbd/_sidebar-and-main-panel.scss";

const FolderTree = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [actionVisible, setActionVisible] = useState(null);
  const token = localStorage.getItem("token");
  const history = useHistory();

  useEffect(() => {
    getCategory();
  }, []);

  const getCategory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/category", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategoryList(res.data); 
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleAddSuccess = () => {
    getCategory();
    toast.success("New category has been created!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
    });
  };

  const handleEditSuccess = () => {
    getCategory();
    toast.success("Category updated successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
    });
    setShowEditModal(false);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/category/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Category deleted!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
      });
      getCategory();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleFolderClick = (selectedCategory) => {
    history.push({
      pathname: "/admin/document",
      state: {selectedCategory: selectedCategory?.id_kategoridok}
    });
  };

  // console.log("Selected cat: ", selectedCategory?.id_kategoridok);

  return (
    <div className="folder-tree">
      <div className="folder-header d-flex justify-content-between">
        <span>Folders</span>
        <FaPlus
          className="add-document"
          onClick={() => setShowAddModal(true)}
        />
        <AddCategory
          showAddModal={showAddModal}
          setShowAddModal={setShowAddModal}
          onSuccess={handleAddSuccess}
        />
        <EditCategory
          showEditModal={showEditModal}
          setShowEditModal={setShowEditModal}
          category={selectedCategory}
          onSuccess={handleEditSuccess}
        />
      </div>

      <div className="folder-list ">
        {categoryList.map((cat) => (
          <div className="folder-item" key={cat.id_kategoridok}>
            <div className="folder-label p-2">
              <Button 
                className='bg-transparent'
                style={{color: "white", border:"none"}}
                variant=''
                onClick={() => {
                  setSelectedCategory(cat)
                  handleFolderClick(cat)
                }}
              >
              <span><i class="fa fa-folder-open" style={{ marginRight: '8px' }}></i></span>
              <span>{cat.kategori}</span>
              <span
                onClick={() =>
                  setActionVisible((prev) =>
                    prev === cat.id_kategoridok ? null : cat.id_kategoridok
                  )
                }
              >
              <FaEllipsisV style={{ marginLeft: '10px', cursor: 'pointer' }} />
              </span>
              </Button>
            </div>

            {actionVisible === cat.id_kategoridok && (
              <ul style={{ marginLeft: '-15px', marginTop: '5px' }} className='d-flex justify-content-start'>
                <li style={{ listStyle: 'none', padding: 0, margin: 3 }}>
                  <Button
                    type='button'
                    variant='info'
                    className="btn-fill pull-right p-1"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setShowEditModal(true);
                    }}
                  >
                    <i class="fa fa-pen" style={{ marginRight: '5px' }}></i>
                    Update
                  </Button>
                </li>
                <li style={{ listStyle: 'none', padding: 0, margin: 3 }}>
                  <Button 
                    type='button'
                    variant='danger'
                    className="btn-fill pull-right p-1"
                    onClick={() => handleDelete(cat.id_kategoridok)}>
                    <i class="fa fa-trash" style={{ marginRight: '5px' }}></i>
                    Delete
                  </Button>
                </li>
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderTree;
