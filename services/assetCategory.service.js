
const db = require("../config/db");

// CRUD methods for AssetsCategory model

const getAllCategories = async () => {
  const categories = await db.AssetsCategory.findAll();
  return categories;
};



const findCategoryById = async (id) => {
  const category = await db.AssetsCategory.findByPk(id);
  return category;
};


const findSubCategoryById = async (id) => {
  const subCategory = await db.AssetSubCategory.findByPk(id);
  return subCategory;
};

const createCategory = async (
  categoryPersianName,
  categoryEnglishName,
  categoryArabicName,
  categoryDescription,
  categoryImage
) => {
  const newCategory = await db.AssetsCategory.create({
    CategoryPersianName: categoryPersianName,
    CategoryEnglishName: categoryEnglishName,
    CategoryArabicName: categoryArabicName,
    CategoryDescription: categoryDescription,
    CategoryImage: categoryImage,
  });
  return newCategory;
};

const updateCategory = async (
  id,
  categoryPersianName,
  categoryEnglishName,
  categoryArabicName,
  categoryDescription,
  categoryImage
) => {
  await db.AssetsCategory.update(
    {
      CategoryPersianName: categoryPersianName,
      CategoryEnglishName: categoryEnglishName,
      CategoryArabicName: categoryArabicName,
      CategoryDescription: categoryDescription,
      CategoryImage: categoryImage,
    },
    {
      where: {
        Id: id,
      },
    }
  );
  const updatedCategory = await db.AssetsCategory.findByPk(id);
  return updatedCategory;
};

const deleteCategory = async (id) => {
  await db.AssetsCategory.destroy({
    where: { Id: id },
  });
};










////////////////////////////////////////// SUB CATEGORY
////////////////////////////////// FOR ASSETS
///////////////////////////// WE ARE ARAST



const getAllSubCategoriesByCategoryId = async (categoryId) => {
    const subCategories = await db.AssetSubCategory.findAll({
      where: { CategoryId: categoryId },
    });
    return subCategories;
  };
  




const createSubCategory = async (subCategoryName, categoryId) => {
  const newSubCategory = await db.AssetSubCategory.create({
    SubCategoryName : subCategoryName,
    CategoryId: categoryId,
  });
  return newSubCategory;
};

const updateSubCategory = async (
  id,
  SubCategoryName,
  
) => {
  await db.AssetSubCategory.update(
    {
      SubCategoryName,
    },
    {
      where: {
        Id: id,
      },
    }
  );

};

const deleteSubCategory = async (id) => {
  await db.AssetSubCategory.destroy({
    where: { Id: id },
  });
};









////////////////////// DESIGN CATEGORY


const getAllDesignCategory = async () => {
  const categories = await db.DesignCategory.findAll({
    where: { SubCategoryId: 0 },
  });
  return categories;
};



const findDesignCategoryById = async (id) => {
  const category = await db.DesignCategory.findByPk(id);
  return category;
};


const findSubDesignCategoryById = async (id) => {
  const subCategory = await db.DesignCategory.findByPk(id);
  return subCategory;
};

const createDesignCategory = async (
  SubCategoryId,
  CategoryName
) => {
  const newCategory = await db.DesignCategory.create({
    SubCategoryId,
    CategoryName
  });
  return newCategory;
};


const getAllSubDesignCategoriesByCategoryId = async (SubCategoryId) => {
  const subCategories = await db.DesignCategory.findAll({
    where: { SubCategoryId: SubCategoryId },
  });
  return subCategories;
};






module.exports = {
  findSubCategoryById,
  getAllCategories,
  findCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubCategory,
  updateSubCategory,
  deleteSubCategory,
  getAllSubCategoriesByCategoryId,
  getAllDesignCategory,
  findDesignCategoryById,
  findSubDesignCategoryById,
  createDesignCategory,
  getAllSubDesignCategoriesByCategoryId
};
