
const express = require("express");
const router = express.Router();
const userService = require("../services/users.service");
const authService = require("../services/authenticate.service");
const storeService = require("../services/store.service");
const categoryService = require("../services/assetCategory.service");

const sharp = require("sharp");

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const translate = require('@vitalets/google-translate-api');

const adminLayout = "../views/layouts/adminLayout"
const mainLayout = "../views/layouts/mainLayout"
const simpleLayout = "../views/layouts/simpleLayout"


const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const fs = require('fs');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const path = require("path");

function generateRandomString(length = 6) {
    const chars = '0123456789'; // Possible characters for the string
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomString += chars[randomIndex];
    }

    return randomString;
}

const changeFileExtension = (filename, newExtension) => {
    // بررسی وجود پسوند فعلی
    const dotIndex = filename.lastIndexOf('.');
    if (dotIndex === -1) {
        // اگر فایل پسوند ندارد، اضافه کردن جدید
        return filename + newExtension;
    }
    // تغییر پسوند
    return filename.slice(0, dotIndex) + newExtension;
};


// Configure multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

function removeSpaces(str) {
    return str.replaceAll(" ", "");
}

const client = new S3Client({
    region: "default",
    endpoint: process.env.ARAST_ENDPOINT,
    credentials: {
        accessKeyId: process.env.ARAST_ACCESS_KEY,
        secretAccessKey: process.env.ARAST_SECRET_KEY
    },
});






const authMiddleware = async (req, res, next) => {
    const token = req.cookies && req.cookies['arast-panel-token'];

    if (!token) {
        return res.redirect("/Login")
    }
    else {
        try {
            const decoded = jwt.verify(token, jwtSecret);
            const auth = await authService.findPersonByAuthCode(decoded.serverCode)
            if (auth != null) {
                next();
            }
            else {
                return res.redirect("/Login")
            }

        } catch (error) {
            return res.redirect("/Login")
        }
    }
}



//Main Admin
router.get('/', authMiddleware, async (req, res) => {
    try {
        const stores = await storeService.getAllStores()

        const local = {
            title: "ADMIN",
            description: "توضحیات",
            isAuthorized: false
        }
        await res.render('admin/store/showStores', { local,stores, layout: adminLayout })
    } catch (error) {

    }

})





router.get('/GetStoreDesign/:id', authMiddleware, async (req, res) => {
    try {
        const designs = await storeService.findAllStoreDesignByStoreId(req.params.id)
        const store = await storeService.findStoreById(req.params.id)


        await res.render('admin/store/storeDesigns', { designs,store, layout: adminLayout })
    } catch (error) {

    }

})



router.get('/ConfirmedDesign/:id', authMiddleware, async (req, res) => {
    try {

        await storeService.confirmedStoreDesign(id,true)

        await res.redirect("/Store/GetAllStoreDesignNotConfrimed")
    } catch (error) {

    }

})





router.get('/FirstConfirmDesign/:id', authMiddleware, async (req, res) => {
    try {
        const DesignId = req.params.id
        const categories = await categoryService.getAllDesignCategory()

        await res.render('admin/store/acceptDesign', {categories, DesignId, layout: simpleLayout })
    } catch (error) {

    }

})

router.post('/FirstConfirmDesign', authMiddleware, async (req, res) => {
    try {
        await storeService.confirmedAndChangeCategoryStoreDesign(req.body.DesignId,true,req.body.DesignCategoryId.value)
        await res.redirect("/Store/GetAllStoreDesignNotConfrimed")
    } catch (error) {

    }

})





router.get('/RejectDesign/:id', authMiddleware, async (req, res) => {
    try {

        const DesignId = req.params.id

        await res.render('admin/store/rejectDesign', { DesignId, layout: simpleLayout })
    } catch (error) {

    }

})

router.post('/RejectDesignRequest', authMiddleware, async (req, res) => {
    try {
        await storeService.rejectStoreDesign(req.body.DesignId,false,req.body.ReasonReject)
        await res.redirect("/Store/GetAllStoreDesignNotConfrimed")
    } catch (error) {

    }

})



router.get('/GetAllStoreDesignNotConfrimed', authMiddleware, async (req, res) => {
    try {
      
        let designs = []

        const allDesign = await storeService.getAllStoreDesignsNotConfirmed()

        for (let index = 0; index < allDesign.length; index++) {        
            const store = await storeService.findStoreById(allDesign[index].StoreId)
            
            designs.push({
                StoreId : store.Id,
                DesignName : allDesign[index].DesignName,
                DesignShowImage : allDesign[index].DesignShowImage,
                StoreName : store.StoreName,
                DesignId : allDesign[index].Id,
                DesignDescription : allDesign[index].DesignDescription,
                DesignCategoryId : allDesign[index].DesignCategoryId
            })
        }
        


        await res.render('admin/store/allStoresDesigns', { designs, layout: adminLayout })
    } catch (error) {

    }

})


module.exports = router;
