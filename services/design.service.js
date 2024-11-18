


const db = require("../config/db");

const getAllDesignTypes = async () => {
    return await db.DesignType.findAll();
};


const getAllDesignTypeCategories = async () => {
    return await db.DesignTypesCategory.findAll();
};


const GETALLUSERDESIGNS = async () => {
    return await db.UserDesign.findAll();
};


const findDesignTypeById = async (id) => {
    return await db.DesignType.findByPk(id);
};


const findUserDesignById = async (id) => {
    return await db.UserDesign.findByPk(id);
};


const createDesignType = async (DesignName, DesignWidth, DesignHeight, DesignCategoryPhoto, DesignBackgroundColor) => {
    const newDesignType = await db.DesignType.create({ DesignName, DesignWidth, DesignHeight, DesignCategoryPhoto, DesignBackgroundColor });
    return newDesignType;
};

const updateDesignType = async (Id, DesignName, DesignWidth, DesignHeight, DesignBackgroundColor) => {
    await db.DesignType.update(
        { DesignName, DesignWidth, DesignHeight, DesignBackgroundColor },
        {
            where: {
                Id: Id,
            },
        }
    );
    return { DesignName, DesignWidth, DesignHeight, DesignBackgroundColor };
};


const updateDesignTypePhoto = async (Id, DesignCategoryPhoto) => {
    await db.DesignType.update(
        { DesignCategoryPhoto },
        {
            where: {
                Id: Id,
            },
        }
    );
    return { DesignCategoryPhoto };
};


const getAllDesignTypesByDesignTypeCategoryId = async (DesignTypeCategoryId) => {
    const design = await db.DesignType.findAll({
        where: { DesignTypeCategoryId: DesignTypeCategoryId },
    });
    return design;
};


const getDesignsByCategoryIdAndPage = async (page, categoryId) => {
    const allDesigns = [];

    // پیدا کردن تمام زیرمجموعه‌های این دسته‌بندی
    const subCategories = await db.DesignCategory.findAll({ 
        where: { SubCategoryId: categoryId },
        attributes: ['Id']
    });

    // بررسی اینکه آیا زیرمجموعه‌ای وجود دارد
    if (subCategories.length > 0) {
        // استخراج شناسه‌های زیرمجموعه‌ها
        const subCategoryIds = subCategories.map(cat => cat.Id);

        // ایجاد یک آرایه از پرامیس‌ها برای هر زیرمجموعه
        const designPromises = subCategoryIds.map(id =>
            db.Design.findAll({
                where: {
                    DesignCategoryId: id, // فیلتر بر اساس categoryId
                },
                order: [['Id', 'ASC']],
                offset: (page - 1) * 5,
                limit: 50,
            })
        );

        // اجرای همه درخواست‌ها به صورت هم‌زمان و جمع‌آوری نتایج
        const designsArray = await Promise.all(designPromises);

        // فلت کردن نتایج به یک آرایه‌ی یکپارچه
        designsArray.forEach(designs => {
            allDesigns.push(...designs);
        });
    }

    return allDesigns;
};




const updateUserDesignReady = async (Id, DesignReady) => {
    await db.UserDesign.update(
        { DesignReady },
        {
            where: {
                Id: Id,
            },
        }
    );
}

const createUserDesign = async (UserId, DesignTypeId, DesignName, DesignDateTime, DesignPersianDateTime, DesignLink, DesignReady, OriginalWidth, OriginalHeight, DesignPhoto, DesignParentFileLink) => {
    const newDesign = await db.UserDesign.create({ UserId, DesignTypeId, DesignName, DesignDateTime, DesignPersianDateTime, DesignLink, DesignReady, OriginalWidth, OriginalHeight, DesignPhoto, DesignParentFileLink });
    return newDesign;
};


const createUserDesignInit = async (DesignId, UserId, C, CanvasFileJson) => {
    const newDesignInit = await db.UserDesignInit.create({ DesignId, UserId, C, CanvasFileJson });
    return newDesignInit;
};


const getDesignByLink = async (DesignLink) => {
    const design = await db.UserDesign.findAll({
        where: { DesignLink: DesignLink },
    });
    return design;
};



const getDesignInitByUserDesignId = async (UserDesignId) => {
    const design = await db.UserDesignInit.findAll({
        where: { DesignId: UserDesignId },
    });
    return design;
};


const getAllUserDesign = async (UserId) => {
    const design = await db.UserDesign.findAll({
        where: {
            UserId: UserId,
            DesignParentFileLink: null
        },
    });
    return design;
};


const updateDesignPhoto = async (Id, DesignPhoto) => {
    await db.UserDesign.update(
        { DesignPhoto },
        {
            where: {
                Id: Id,
            },
        }
    );
}

const updateDesignFile = async (DesignId, CanvasFileJson) => {
    await db.UserDesignInit.update(
        { CanvasFileJson },
        {
            where: {
                DesignId: DesignId,
            },
        }
    );


};


const getUserDesignByLinkAndUserDesignId = async (DesignLink, UserDesignId) => {
    const design = await db.UserDesign.findOne({
        where: { DesignLink: DesignLink, Id: UserDesignId },
    });
    return design;
};


const findParentUserDesign = async (DesignLink) => {
    const design = await db.UserDesign.findOne({
        where: { DesignLink: DesignLink, DesignParentFileLink: null },
    });
    return design;
};





const updateNameOfUserDesign = async (Id, DesignName) => {
    await db.UserDesign.update(
        { DesignName },
        {
            where: {
                Id: Id,
            },
        }
    );
}



///دیزاین های اصلی StoreDesign



const getStoreDesignByLink = async (DesignLink) => {
    const design = await db.Design.findAll({
        where: { DesignLink: DesignLink },
    });
    return design;
};



const StoreDesignByLink = async (DesignLink) => {
    const design = await db.Design.findOne({
        where: { DesignLink: DesignLink },
    });
    return design;
};



const getStoreDesignByDesignTypeIdAndPage = async (page, DesignTypeId) => {
    const designs = await db.Design.findAll({
        where: {
            DesignTypeId,
            DesignIsConfirmed: true,
            IsPrivate: false
        },
        order: [['Id', 'ASC']],
        offset: (page - 1) * 5,
        limit: 30,
    });
    return designs;
};




const findDesignById = async (id) => {
    return await db.Design.findByPk(id);
};


const getAllStoreDesignsByCollectionId = async (DesignCollectionId) => {
    const design = await db.Design.findAll({
        where: { DesignCollectionId: DesignCollectionId },
    });
    return design;
};



////////// جدول DESIGN COLLECTION

const findDesignCollectionById = async (id) => {
    return await db.DesignCollection.findByPk(id);
};






module.exports = {
    getAllDesignTypes,
    updateUserDesignReady,
    findDesignTypeById,
    createDesignType,
    updateDesignType,
    updateDesignTypePhoto,
    createUserDesign,
    createUserDesignInit,
    getDesignByLink,
    getDesignInitByUserDesignId,
    findUserDesignById,
    getAllUserDesign,
    updateDesignPhoto,
    updateDesignFile,
    GETALLUSERDESIGNS,
    getStoreDesignByDesignTypeIdAndPage,
    findDesignById,
    getAllStoreDesignsByCollectionId,
    findDesignCollectionById,
    getAllDesignTypeCategories,
    getAllDesignTypesByDesignTypeCategoryId,
    getStoreDesignByLink,
    StoreDesignByLink,
    getUserDesignByLinkAndUserDesignId,
    findParentUserDesign,
    getDesignsByCategoryIdAndPage,
    updateNameOfUserDesign
};