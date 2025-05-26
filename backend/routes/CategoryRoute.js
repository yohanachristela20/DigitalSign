import express from "express";

import {getCategory,
        getCategoryById, 
        createCategory, 
        updateCategory, 
        deleteCategory,
        getLastCategoryId,
        getCategoryDetails,
} from "../controllers/CategoryController.js"; 

const router = express.Router(); 

router.get('/category', getCategory); 
router.get('/category/:id_kategoridok', getCategoryById);
router.post('/category', createCategory);  
router.patch('/category/:id', updateCategory);
router.delete('/category/:id', deleteCategory);
router.get('/getLastCategoryId', getLastCategoryId);
router.get('/category-details/:id_kategoridok', getCategoryDetails);
export default router;