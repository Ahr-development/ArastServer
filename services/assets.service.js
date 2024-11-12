
const db = require("../config/db");


const createAsset = async (data) => {
    try {
      const newAsset = await db.Assets.create(data);
      return newAsset;
    } catch (error) {
      console.error('Error creating asset:', error.message);
      throw error; // Re-throw the error for handling at a higher level
    }
  };
  


  const createCollection = async (data) => {
    try {
      const collection = await db.AssetCollection.create(data);
      return collection;
    } catch (error) {
      console.error('Error creating asset:', error.message);
      throw error; // Re-throw the error for handling at a higher level
    }
  };
  




  const getAllAssetsByCategoryId = async (categoryId) => {
    const assets = await db.Assets.findAll({
      where: { SubCategoryId: categoryId },
    });
    return assets;
  };
  


  const getAssetsApi = async (count) => {
    const assets = await db.Assets.findAll({
      order: [['Id', 'ASC']],
      offset: (count - 1) * 30,
      limit: 30,
    });
    return assets;
  };
  


  const getCollectionByCategoryId = async (categoryId,page,limit) => {
    const assets = await db.AssetCollection.findAll({
      where: {
        CategoryId: categoryId, // Filter by categoryId
      },
      order: [['Id', 'ASC']],
      offset: (page - 1) * 30,
      limit: limit,
    });
    return assets;
  };


  const getAssetsApiByCategoryIdAndPageNumber = async (page, categoryId) => {
    const assets = await db.Assets.findAll({
      where: {
        CategoryId: categoryId, // Filter by categoryId
      },
      order: [['Id', 'ASC']],
      offset: (page - 1) * 5,
      limit: 5,
    });
    return assets;
  };
  


  const findAssetById = async (id) => {
    return await db.Assets.findByPk(id);
  };
  

  const findAssetCollectionById = async (id) => {
    return await db.AssetCollection.findByPk(id);
  };


  const getAllFonts = async () => {
    const fonts = await db.Fonts.findAll({
      where: { FontParentId: 0 },
    });

    return fonts;
  };
  



  const getSomeAssetsByCategoryId = async (categoryId) => {
    const assets = await db.Fonts.findAll({
      where: { CategoryId: categoryId },
      limit: 20 
    });
    return assets;
  };
  

  const findFontById = async (id) => {
    return await db.Fonts.findByPk(id);
  };

  const createFont = async (data) => {
    try {
      const newFont = await db.Fonts.create(data);
      return newFont;
    } catch (error) {
      console.error('Error creating font:', error.message);
      throw error; // Re-throw the error for handling at a higher level
    }
  };

  
  const getAllSubFonts = async (fontParentId) => {
    const fonts = await db.Fonts.findAll({
      where: { FontParentId: fontParentId },
    });
    return fonts;
  };
  


  const deleteFont = async (Id) => {
    await db.Fonts.destroy({
      where: { Id: Id },
    });
  };


  const deleteSubFont = async (Id) => {
    await db.Fonts.destroy({
      where: { Id: Id },
    });
  };




  const getAllSubCategoriesByCategoryId = async (Id) => {
    const sub = await db.AssetSubCategory.findAll({
      where: { CategoryId: Id },
    });
    return sub;
  
  };



  const getAllAssetCollectionByCollectionId = async (Id) => {
    const sub = await db.Assets.findAll({
      where: { CollectionId : Id },
    });
    return sub;
  
  };

  
  const getAllAssetCollectionByCollectionIdWithLimition = async (Id,limit) => {
    const sub = await db.Assets.findAll({
      where: { CollectionId : Id },
      limit: limit 
    });
    return sub;
  
  };



  const updateFont = async (
    id,
    FontName,
    FontType,
    FontFormat,
    FontStaticFileName
  ) => {
    await db.AssetsCategory.update(
      {
        FontName: FontName,
        FontType: FontType,
        FontFormat: FontFormat,
        FontStaticFileName: FontStaticFileName,
      },
      {
        where: {
          Id: id,
        },
      }
    );
    const updatedCategory = await db.Fonts.findByPk(id);
    return updatedCategory;
  };
  


  const getAssetsByCategoryIdWithLimition = async (categoryId,limit) => {
    const assets = await db.Assets.findAll({
      where: { CategoryId: categoryId },
      limit: limit 
    });
    return assets;
  };
  

  const getAllAssetsByCollectionId = async (CollectionId) => {
    const collect = await db.Assets.findAll({
      where: { CollectionId },
    });
    return collect;
  
  };

  
module.exports = {
    createAsset,
    getAllAssetsByCategoryId,
    findAssetById,
    getAssetsApi,
    getAllFonts,
    findFontById,
    createFont,
    getAllSubFonts,
    updateFont,
    deleteFont,
    getSomeAssetsByCategoryId,
    getAllSubCategoriesByCategoryId,
    getAssetsByCategoryIdWithLimition,
    getAssetsApiByCategoryIdAndPageNumber,
    createCollection,
    getCollectionByCategoryId,
    getAllAssetCollectionByCollectionId,
    findAssetCollectionById,
    getAllAssetCollectionByCollectionIdWithLimition,
    getAllAssetsByCollectionId
  };