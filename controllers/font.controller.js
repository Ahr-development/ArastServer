const express = require("express");
const router = express.Router();
const assetService = require("../services/assets.service")

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const authService = require("../services/authenticate.service");
const adminLayout = "../views/layouts/adminLayout"
const simpleLayout = "../views/layouts/simpleLayout"

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const multer = require('multer');
const fs = require('fs');
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

// Configure multer for temporary file storage
const upload = multer({ dest: 'uploads/' });

function generateUniqueFilename() {
    // Generate a random string of characters
    const randomString = Math.random().toString(36).substring(2, 8);
    // Generate a timestamp to ensure uniqueness
    const timestamp = Date.now().toString(36);
    // Combine random string and timestamp to create unique filename
    return `${randomString}`;
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





// All Fonts
router.get('/', authMiddleware, async (req, res) => {
    try {
        const fonts = await assetService.getAllFonts()
        console.log(fonts)
        const local = {
            title: "ADMIN",
            description: "توضحیات",
            isAuthorized: false
        }
        await res.render('admin/font/fonts', { local, fonts, layout: adminLayout })
    } catch (error) {
        console.log(error)
    }

})



//ایجـــاد فونت
router.get('/AddNewFont/:id', authMiddleware, async (req, res) => {

    const FontId = req.params.id;

    try {
        const data = {
            title: "ADMIN",
            description: "توضحیات",
            FontId
        }

        await res.render('admin/font/insertFont', { data, layout: simpleLayout })
    } catch (error) {

    }

})


router.post('/AddNewFont', authMiddleware, upload.fields([{ name: 'FontFile' }, { name: 'PreviewFontFile' }]), async (req, res) => {

    try {

        // Check if req.files is defined and contains the expected files
        if (!req.files || !req.files.FontFile || !req.files.PreviewFontFile) {
            return res.status(400).send('No file uploaded');
        }

        const staticFile = req.files.PreviewFontFile[0]; // Access the first file in staticFile array
        const mainFile = req.files.FontFile[0]; // Access the first file in MainFile array
        mainFile.originalname = generateUniqueFilename() + "_" + removeSpaces(mainFile.originalname)
        const STATIC_BUFFER = fs.readFileSync(staticFile.path);
        const MAIN_BUFFER = fs.readFileSync(mainFile.path);

        const newStaticFilename = `Fonts/PreviewFiles/${generateUniqueFilename()}_${staticFile.originalname}`;  //newStaticFilename = برای پیش نمایش
        const newMainFilename = `Fonts/FontFiles/${mainFile.originalname}`;  //newMainFilename = برای فایل فونت اصلی

        const paramsForStatic = {
            Bucket: 'arastme',
            Key: newStaticFilename,
            Body: STATIC_BUFFER
        };

        const paramsForMain = {
            Bucket: 'arastme',
            Key: newMainFilename,
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

        // Upload staticFile
        client.send(new PutObjectCommand(paramsForStatic), (error, data) => {
            if (error) {
                console.log(error);
            } else {
                console.log(data);
            }
        });


        /*         // Get signed URL for staticFile
                const fontPreview = new GetObjectCommand(paramsForStatic);
                let preview;
                await getSignedUrl(client, fontPreview).then((url) => {
                    preview = url;
                });
        
        
                const fontFile = new GetObjectCommand(paramsForStatic);
                let file;
                await getSignedUrl(client, fontFile).then((url) => {
                    file = url;
                });
         */


        const data = {
            StoreId: 1,
            FontName: req.body.FontName,
            FontType: req.body.FontType,
            FontFormat: req.body.FontFormat,
            FontFileName: newMainFilename,
            FontStaticFileName: newStaticFilename,
            FontParentId: req.body.FontParentId
        }

        await assetService.createFont(data)


        return res.redirect("/Fonts")
    } catch (error) {
        console.log(error)
    }

})


//ساب کتگوری برای فایل های فونتی
router.get('/getFontsSubParent/:id', authMiddleware, async (req, res) => {
    const subFonts = await assetService.getAllSubFonts(req.params.id)

    try {
        const local = {
            title: "ADMIN",
            description: "توضحیات",
            isAuthorized: false
        }


        // برگرداندن لیست زیر دسته ها به صورت JSON
        return res.json(subFonts);
    } catch (error) {
        console.log(error);
    }

})




//ویرایش فونت
router.get('/EditFont/:id', authMiddleware, async (req, res) => {
    try {


        const FontId = req.params.id;
        const font = await assetService.findFontById(FontId)

        const data = {
            title: "ADMIN",
            description: "توضحیات",
            FontId
        }

        await res.render('admin/font/editFont', { data, font, layout: simpleLayout })
    } catch (error) {

    }

})





//ویرایش فونت
router.post('/EditFont', authMiddleware, upload.single('PreviewFontFile'), async (req, res) => {
    try {

        let newStaticFilename = null;
        if (req.file.PreviewFontFile != null) {

            const staticFile = req.file.PreviewFontFile;
            const STATIC_BUFFER = fs.readFileSync(staticFile.path);
            newStaticFilename = `Fonts/${generateUniqueFilename()}_${staticFile.originalname}`;

            const paramsForStatic = {
                Bucket: 'arastme',
                Key: newStaticFilename,
                Body: STATIC_BUFFER
            };


            // Upload staticFile
            client.send(new PutObjectCommand(paramsForStatic), (error, data) => {
                if (error) {
                    console.log(error);
                } else {
                    console.log(data);
                }
            });

        }


        const font = await assetService.findFontById(req.body.FontParentId)

        if (newStaticFilename != null) {
            await assetService.updateFont(req.body.FontId, req.body.FontName, req.body.FontType, req.body.FontFormat, newStaticFilename)

        }
        else {
            await assetService.updateFont(req.body.FontId, req.body.FontName, req.body.FontType, req.body.FontFormat, font.FontStaticFileName)

        }

        return res.redirect("/fonts")

    } catch (error) {

    }

})




//حذف فونت
router.get('/DeleteFont/:id', authMiddleware, async (req, res) => {

    const FontId = req.params.id;
    const font = await assetService.findFontById(FontId)
    try {
        const data = {
            title: "ADMIN",
            description: "توضحیات",
            font
        }

        await res.render('admin/font/deleteFont', { data, layout: simpleLayout })
    } catch (error) {

    }

})




//حذف فونت
router.post('/DeleteFont', authMiddleware, async (req, res) => {

    const FontId = req.body.FontId;
    try {
        await assetService.deleteFont(FontId);

        await res.redirect('/Fonts')
    } catch (error) {
        console.log(error);
    }

})



module.exports = router;
