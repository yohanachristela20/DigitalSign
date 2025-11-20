import KategoriDokModel from "../models/KategoriDokModel.js";
import bcrypt from "bcrypt";

export const getCategory = async(req, res) => {
    try {
        const response = await KategoriDokModel.findAll({
            attributes: ['id_kategoridok', 'kategori'],
            order: [['id_kategoridok', 'ASC']]
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
        res.status(500).json({ message: "Failed to fetch categories" });
    }
}

export const getCategoryById = async(req, res) => {
    try {
        const response = await KategoriDokModel.findOne({
            where:{
                id_kategoridok: req.params.id_kategoridok 
            }
        });
        res.status(200).json(response); 
    } catch (error) {
        console.log(error.message); 
    }
}


export const createCategory = async(req, res) => {
    try {
        // console.log(req.body);
        await KategoriDokModel.create(req.body);
        res.status(201).json({msg: "New Category has been created!"}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const updateCategory = async (req, res) => {
    try {
        const {kategori} = req.body;
        const {id} = req.params;

       await KategoriDokModel.update(
        {kategori}, 
        {where: {
            id_kategoridok: id,
        },
        }
       );

        res.status(200).json({ msg: "Category was updated successfully." });
    } catch (error) {
        console.error("Failed to update category:", error.message);
        res.status(500).json({ message: "Failed to update category." });
    }
};

export const deleteCategory = async(req, res) => {
    try {
        await KategoriDokModel.destroy(
        {
            where:{
                id_kategoridok: req.params.id
            }
        }
    );
        res.status(200).json({msg: "Category was deleted successfully."}); 
    } catch (error) {
        res.status(500).json({message: error.message}); 
    }
}

export const getLastCategoryId = async (req, res) => {
try {
    const lastRecord = await KategoriDokModel.findOne({
        order: [['id_kategoridok', 'DESC']],
    });

    if (lastRecord) {
        return res.status(200).json({ lastId: lastRecord.id_kategoridok });
    }
    return res.status(200).json({ lastId: null });
} catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error retrieving last user ID.' });
}
}; 

  export const getCategoryDetails = async (req, res) => {
    const { id_kategoridok, kategori } = req.params;
  
    try {
      const categoryData = await KategoriDokModel.findOne({
        where: { id_kategoridok: id_kategoridok },
        attributes:[kategori],
      });
  
      if (!categoryData) {
        return res.status(404).json({ message: "Category not found" });
      }
  
    //   const { id_kategoridok, kategori } = categoryData;
  
      res.json({
        id_kategoridok,
        kategori
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Error fetching user details" });
    }
  };

