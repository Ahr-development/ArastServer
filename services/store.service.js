const db = require("../config/db");



const getAllStores = async () => {
  return await db.Store.findAll();
};


const createStore = async (data) => {
  try {
    const store = await db.Store.create(data);
    return store;
  } catch (error) {
    console.error('Error creating asset:', error.message);
    throw error; // Re-throw the error for handling at a higher level
  }
};





const findStoreById = async (id) => {
  return await db.Store.findByPk(id);
};


const createNewStoreDesign = async (data) => {
  try {
    const design = await db.Design.create(data);
    return design;
  } catch (error) {
    console.error('Error creating asset:', error.message);
    throw error; // Re-throw the error for handling at a higher level
  }
};


const findStoreByUserId = async (UserId) => {
  const store = await db.Store.findOne({
    where: {
      UserId: UserId,
    },
  });

  return store;
}



const getAllStoreDesigns = async () => {
  return await db.Design.findAll();
};



const getAllStoreDesignsNotConfirmed = async () => {
  const design = await db.Design.findAll({
    where: {
      DesignIsConfirmed: false,
    },
  });

  return design;
}



const findStoreDesignByLink = async (DesignLink) => {
  const design = await db.Design.findOne({
    where: {
      DesignLink,
    },
  });

  return design;
}



const findAllStoreDesignByStoreId = async (StoreId) => {
  const design = await db.Design.findAll({
    where: {
      StoreId,
    },
  });

  return design;
}




const updateStoreDesignOverrideDate = async (Id, DesignDateOverride) => {
  await db.Design.update(
    { DesignDateOverride },
    {
      where: {
        Id,
      },
    }
  );

};


const updateStoreDesignInformation = async (Id, DesignName, DesignDescription, DesignTags, DesignColors, DesignCollectionId, IsPrivate) => {
  await db.Design.update(
    { DesignName, DesignDescription, DesignTags, DesignColors, DesignCollectionId, IsPrivate },
    {
      where: {
        Id,
      },
    }
  );

};





const confirmedStoreDesign = async (Id, DesignIsConfirmed) => {
  await db.Design.update(
    { DesignIsConfirmed },
    {
      where: {
        Id,
      },
    }
  );

};



const confirmedAndChangeCategoryStoreDesign = async (Id, DesignIsConfirmed, DesignCategoryId) => {
  await db.Design.update(
    { DesignIsConfirmed, DesignCategoryId },
    {
      where: {
        Id,
      },
    }
  );

};



const rejectStoreDesign = async (Id, DesignIsConfirmed, ReasonReject) => {
  await db.Design.update(
    { DesignIsConfirmed, ReasonReject },
    {
      where: {
        Id,
      },
    }
  );

};







/// designCollection

const createDesignCollection = async (data) => {
  try {
    const collection = await db.DesignCollection.create(data);
    return collection;
  } catch (error) {
    console.error('Error creating asset:', error.message);
    throw error; // Re-throw the error for handling at a higher level
  }
};



const getAllStoreDesignCollection = async (StoreId) => {
  const design = await db.DesignCollection.findAll({
    where: {
      StoreId,
    },
  });

  return design;
}



const findDesignCollectionById = async (id) => {
  return await db.DesignCollection.findByPk(id);
};


const findDesignCollectionByLink = async (CollectionLink) => {
  const collection = await db.DesignCollection.findOne({
    where: {
      CollectionLink: CollectionLink,
    },
  });

  return collection;
}






module.exports = {
  getAllStores,
  createStore,
  createNewStoreDesign,
  findStoreByUserId,
  findStoreDesignByLink,
  updateStoreDesignOverrideDate,
  findStoreById,
  updateStoreDesignInformation,
  findAllStoreDesignByStoreId,
  getAllStoreDesigns,
  confirmedStoreDesign,
  getAllStoreDesignsNotConfirmed,
  rejectStoreDesign,
  confirmedAndChangeCategoryStoreDesign,
  createDesignCollection,
  getAllStoreDesignCollection,
  findDesignCollectionById,
  findDesignCollectionByLink
};