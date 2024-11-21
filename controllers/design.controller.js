
const express = require("express");
const router = express.Router();
const assetService = require("../services/assets.service")

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const authService = require("../services/authenticate.service");
const designService = require("../services/design.service");
const simpleLayout = "../views/layouts/simpleLayout"

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const fs = require('fs');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const adminLayout = "../views/layouts/adminLayout"


// Configure multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

function generateRandomStringwithWOrd(length = 6) {
    // Combine lowercase letters, uppercase letters, and numbers for a more secure mix
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

    let randomString = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomString += chars[randomIndex];
    }

    return randomString;
}






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
    console.log(token);

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










// AllDesignTypes
router.get('/', authMiddleware, async (req, res) => {
    try {
        const designTypes = await designService.getAllDesignTypes()

        const local = {
            title: "ADMIN",
            description: "توضحیات",
            isAuthorized: false
        }



        await res.render('admin/design/designTypes', { local, designTypes, layout: adminLayout })
    } catch (error) {
        console.log(error)
    }

})




router.get('/AddNewDesignType', authMiddleware, async (req, res) => {
    try {

        await res.render('admin/design/insertDesignType', { layout: simpleLayout })
    } catch (error) {

    }

})





router.post('/AddNewDesignType', upload.single('DesignCategoryPhoto'), async (req, res) => {

    try {
        // Check if req.files is defined and contains the expected files
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const mainFile = req.file; // تبدیل به بافر
        const imageNameWithAddress = generateRandomStringwithWOrd() + "_" + req.file.originalname; // دریافت نام فایل اصلی
        const MAIN_BUFFER = fs.readFileSync(mainFile.path);  /// خیلی مهم! خواندن فایل
        const FileNameAndAddress = `design/designType/${removeSpaces(imageNameWithAddress)}`;  //newMainFilename = برای فایل فونت اصلی

        const paramsForMain = {
            Bucket: 'arastme',
            Key: FileNameAndAddress,
            ACL: 'public-read',

            Body: MAIN_BUFFER
        };

        // Upload mainFile
        client.send(new PutObjectCommand(paramsForMain), (error, data) => {
            if (error) {
                console.log(error);
            } else {
                console.log(data);
            }
        });

        await designService.createDesignType(req.body.DesignName, req.body.DesignWidth, req.body.DesignHeight, FileNameAndAddress, req.body.DesignBackgroundColor)

        return res.redirect('/Design')
    } catch (error) {
        console.log(error)
    }

})






router.get('/EditDesignType/:id', authMiddleware, async (req, res) => {
    try {
        const designId = req.params.id
        const designType = await designService.findDesignTypeById(designId)
        const photo = false
        await res.render('admin/design/updateDesignType', { designType, photo, layout: simpleLayout })
    } catch (error) {

    }

})


router.post('/EditDesignType', async (req, res) => {
    try {
        await designService.updateDesignType(req.body.DesignId, req.body.DesignName, req.body.DesignWidth, req.body.DesignHeight, req.body.DesignBackgroundColor)
        return res.redirect('/Design')
    } catch (error) {
        console.log(error)
    }

})



router.get('/EditDesignTypePhotoDashboard/:id', authMiddleware, async (req, res) => {
    try {
        const designId = req.params.id
        const designType = await designService.findDesignTypeById(designId)
        const photo = true

        await res.render('admin/design/updateDesignType', { designType, photo, layout: simpleLayout })
    } catch (error) {

    }

})



router.post('/EditDesignTypePhotoDashboard', upload.single('DesignCategoryPhoto'), async (req, res) => {

    try {
        // Check if req.files is defined and contains the expected files
        if (!req.file) {
            return res.status(400).send('No file uploaded');
        }

        const mainFile = req.file; // تبدیل به بافر
        const imageNameWithAddress = generateRandomStringwithWOrd() + "_" + req.file.originalname; // دریافت نام فایل اصلی
        const MAIN_BUFFER = fs.readFileSync(mainFile.path);  /// خیلی مهم! خواندن فایل
        const FileNameAndAddress = `design/designType/${removeSpaces(imageNameWithAddress)}`;  //newMainFilename = برای فایل فونت اصلی

        const paramsForMain = {
            Bucket: 'arastme',
            Key: FileNameAndAddress,
            ACL: 'public-read',

            Body: MAIN_BUFFER
        };

        // Upload mainFile
        client.send(new PutObjectCommand(paramsForMain), (error, data) => {
            if (error) {
                console.log(error);
            } else {
                console.log(data);
            }
        });

        await designService.updateDesignTypePhoto(req.body.DesignId, FileNameAndAddress)

        return res.redirect('/Design')
    } catch (error) {
        console.log(error)
    }

})






module.exports = router;
