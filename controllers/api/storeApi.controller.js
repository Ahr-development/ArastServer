
const express = require("express");
const router = express.Router();
const designService = require("../../services/design.service")
const storeService = require("../../services/store.service")
const authService = require("../../services/authenticate.service")

const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const jwtSecret = process.env.JWT_SECRET;
const fs = require('fs');
const path = require('path');

const multer = require('multer');
const { DateTime } = require("mssql");


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


function getPersianDate() {
    const date = new Date();
    const jalaaliDate = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
    return $`{jalaaliDate.jy}/${jalaaliDate.jm}/${jalaaliDate.jd}`;
}


const upload = multer({ dest: 'uploads/temp' }); // Configure upload destination (optional)

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






router.post('/getStoreByUserId', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken

        console.log("--------------------------->>>>" + UserId + "____ " + Stoken + "-----");
        if (UserId !== null && Stoken !== null) {

            //احراز هویت
            const store = await storeService.findStoreByUserId(UserId)

            if (store) {
                return res.json(store)
            }
            else {
                res.status(404).send('NO');

            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});




router.post('/getStoreDesignByDesignLink', async (req, res) => {

    try {

        const DesignLink = req.body.DesignLink
        const Stoken = req.body.Stoken

        if (DesignLink !== null && Stoken !== null) {

            //احراز هویت
            const design = await storeService.findStoreDesignByLink(DesignLink)

            if (design) {
                return res.json(design)
            }
            else {
                res.status(404).send('NO');

            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});






router.post('/getStoreDesignCollectionByStoreId', async (req, res) => {

    try {

        const StoreId = req.body.StoreId
        const Stoken = req.body.Stoken

        if (StoreId !== null && Stoken !== null) {

            //احراز هویت
            const collection = await storeService.getAllStoreDesignCollection(StoreId)

            if (collection) {
                return res.json(collection)
            }
            else {
                res.status(404).send('NO');

            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});





router.post('/getStoreDesignCollectionByLink', async (req, res) => {

    try {

        const link = req.body.CollectionLink

        if (link !== null) {

            const collect = {
                designCollections : [],
                collection : {}
            }

            const collection = await storeService.findDesignCollectionByLink(link)

            if (collection) {

                collect.collection = collection
                const designs = await designService.getAllStoreDesignsByCollectionId(collection.Id)

                if (designs !== null) {
                   
                    for (let index = 0; index < designs.length; index++) {
                        const element = designs[index];
                        collect.designCollections.push({
                            DesignId : element.Id,
                            Image : element.DesignShowImage
                        })
                    }
                }

                return res.json(collect)
            }
            else {
                res.status(404).send('NO');

            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});






router.post('/createStoreDesignCollection', upload.single('CollectionLogo'), async (req, res) => {

    try {

        const CollectionLogo = req.file
        const StoreId = req.body.StoreId
        const CollectionStatus = req.body.CollectionStatus
        const Stoken = req.body.Stoken

        if (StoreId !== null && Stoken !== null) {

            //احراز هویت


            const store = await storeService.findStoreById(StoreId)
            if (store !== null) {

                if (CollectionStatus) {

                    const imageFileName =  generateRandomStringwithWOrd(7) + removeSpaces(req.file.originalname) // دریافت نام فایل اصلی

                    const ImageNameAndAddress = `Store/DesignCollection/${imageFileName}`;  //Image = برای فایل عکس پیش نمایش

                    const MAIN_BUFFER = fs.readFileSync(CollectionLogo.path);  // خواندن فایل

                    const paramsForImage = {
                        Bucket: 'arastme',
                        Key: ImageNameAndAddress,
                        ACL: 'public-read',

                        Body: MAIN_BUFFER
                    };

                    // Upload mainFile
                    client.send(new PutObjectCommand(paramsForImage), (error, data) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(data);
                        }
                    });

                    const data = {
                        CollectionLogo: ImageNameAndAddress,
                        CollectionName: req.body.CollectionName,
                        CollectionPhonesAccept: req.body.CollectionPhonesAccept,
                        CollectionGiftFrom: req.body.CollectionGiftFrom,
                        StoreId: req.body.StoreId,
                        CollectionStatus: req.body.CollectionStatus,
                        CollectionLink: generateRandomStringwithWOrd(20)
                    }

                    const collection = await storeService.createDesignCollection(data)

                    if (collection !== null) {
                        return res.status(200).json("OK")
                    }
                }
                else {

                    const data = {
                        CollectionLogo: null,
                        CollectionName: req.body.CollectionName,
                        CollectionPhonesAccept: null,
                        CollectionGiftFrom: null,
                        StoreId: req.body.StoreId,
                        CollectionStatus: req.body.CollectionStatus,
                        CollectionLink: generateRandomStringwithWOrd(20)

                    }

                    const collection = await storeService.createDesignCollection(data)

                    if (collection !== null) {
                        return res.status(200).json("OK")
                    }
                }

            }

        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});





router.post('/PublishStoreDesign', upload.single('Image'), async (req, res) => {

    try {
        const Stoken = req.body.Stoken
        const DesignId = req.body.DesignId
        const Canvas = req.body.Canvas
        const Image = req.file
        const StoreId = req.body.StoreId
        const DesignColor = req.body.DesignColor
        const DesignCollectionId = req.body.DesignCollectionId


        console.log("\n \n \n ----------> SENDED" + DesignColor + "\n" + StoreId + "\n" + DesignId + "\n" + Stoken)
        //احراز هویت
        if (Stoken !== null && DesignId !== null && Canvas !== null && Image !== null && StoreId !== null) {
            const user = await authService.findUserByAuthCodeForStore(Stoken)
            if (user !== null) {
                const store = await storeService.findStoreById(StoreId)
                if (store !== null) {
                    console.log("--------++++++" + store.StoreUserName);
                    const design = await designService.findUserDesignById(DesignId)
                    if (design !== null) {
                        console.log("\n" + design.DesignLink + "\n");

                        let des = await storeService.findStoreDesignByLink(design.DesignLink)
                        const date = new Date().toString()


                        const fileName = design.DesignLink + ".json"
                        const ImageName = design.DesignLink + ".png"

                        const FileNameAndAddress = `StoreDesign/User/${fileName}`;  //Canvas = برای فایل کنواس 
                        const ImageNameAndAddress = `StoreDesign/User/Preview/${ImageName}`;  //Image = برای فایل عکس پیش نمایش

                        

                        if (des == null) {
                            //CREATE NEW STORE DESIGN

                            const storeDesign = {
                                StoreId: store.Id,
                                DesignTypeId: design.DesignTypeId,
                                DesignCategoryId: 0,
                                DesignCollectionId: DesignCollectionId,
                                DesignLicenceId: 1,
                                DesignUsed: 0,
                                DesignName: req.body.DesignName,
                                DesignDescription: req.body.Description,
                                DesignTags: req.body.DesignTags,
                                DesignLink: design.DesignLink,
                                DesignDateCreated: date,
                                DesignDateOverride: date,
                                DesignFile: FileNameAndAddress,
                                DesignShowImage: ImageNameAndAddress,
                                DesignColors: DesignColor,
                                DesignIsConfirmed : false
                            }
                            const collection = await storeService.findDesignCollectionById(DesignCollectionId)

                            if (collection !== null) {
                                storeDesign.IsPrivate = collection.CollectionStatus
                            }
                            else{
                                storeDesign.IsPrivate = false
                            }

                            des = await storeService.createNewStoreDesign(storeDesign)
                            console.log("|||||||||||||||||----------|||||||||||" + des.Id);

                        }
                        else {

                            let isprivate = false
                            const collection = await storeService.findDesignCollectionById(DesignCollectionId)

                            if (collection !== null) {
                               isprivate = collection.CollectionStatus
                            }
                            else{
                                isprivate = false
                            }
                            console.log("|||||||||||||||||----------|||||||||||" + des.Id);
                            await storeService.updateStoreDesignInformation(des.Id, req.body.DesignName, req.body.Description, req.body.DesignTags, DesignColor,DesignCollectionId,isprivate)
                        }


                        const MAIN_BUFFER = fs.readFileSync(Image.path);  // خواندن فایل

                        const paramsForCanvas = {
                            Bucket: 'arastme',
                            Key: FileNameAndAddress,
                            ACL: 'public-read',

                            Body: Canvas
                        };

                        const paramsForImage = {
                            Bucket: 'arastme',
                            Key: ImageNameAndAddress,
                            ACL: 'public-read',

                            Body: MAIN_BUFFER
                        };

                        // Upload mainFile
                        client.send(new PutObjectCommand(paramsForCanvas), (error, data) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(data);
                            }
                        });


                        // Upload mainFile
                        client.send(new PutObjectCommand(paramsForImage), (error, data) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(data);
                            }
                        });
                        const overrideDate = new Date().toString()

                        console.log("|||||||||||||||||----------|||||||||||" + des.Id);

                        await storeService.updateStoreDesignOverrideDate(des.Id, overrideDate)

                        return res.status(200).send("OK")


                    }
                }
            }
        }



    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});












module.exports = router;
