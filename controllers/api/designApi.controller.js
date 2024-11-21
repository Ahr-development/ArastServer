
const express = require("express");
const router = express.Router();
const designService = require("../../services/design.service")
const authService = require("../../services/authenticate.service")
const usersService = require("../../services/users.service")
const storeService = require("../../services/store.service")
const categoryService = require("../../services/assetCategory.service")

const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand, GetObjectCommand, CopyObjectCommand } = require("@aws-sdk/client-s3");
const jwtSecret = process.env.JWT_SECRET;
const fs = require('fs');
const path = require('path');

const multer = require('multer');


const client = new S3Client({
    region: "default",
    endpoint: process.env.ARAST_ENDPOINT,
    credentials: {
        accessKeyId: process.env.ARAST_ACCESS_KEY,
        secretAccessKey: process.env.ARAST_SECRET_KEY
    },
});


const AuthenticateCheck = async (userId, Stoken) => {

    if (userId !== null && Stoken !== null) {
        console.log('\n \n ------>' + userId + Stoken);
        const authenticate = await authService.FindAuthenticateByAuthCode(Stoken)
        if (authenticate !== null) {
            console.log('\n \n ------>' + authenticate.UUID);

            if (userId == authenticate.UserId) {
                const user = await usersService.findUserById(userId)
                if (user !== null) {
                    console.log('\n \n ------>' + user.RoleId);

                    if (user.IsBan === false) {
                        return true
                    }
                    else {
                        return false;
                    }
                }
                else {
                    return false;
                }
            }
            else {
                return false;
            }
        }
        else {
            return false;
        }
    }
    else {
        return false;
    }

}




// تابع کمکی برای تبدیل استریم به رشته
const streamToString = (stream) => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on("data", (chunk) => chunks.push(chunk));
        stream.on("error", reject);
        stream.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    });
};


// دانلود فایل JSON از S3
const downloadFile = async (key) => {
    const params = {
        Bucket: 'arastme',
        Key: key,
    };

    try {
        const command = new GetObjectCommand(params);
        const data = await client.send(command);
        const bodyContents = await streamToString(data.Body);
        return JSON.parse(bodyContents);
    } catch (err) {
        console.error(`Error downloading file ${key}:`, err);
        throw err;
    }
};

// آپلود فایل JSON به S3
const uploadFile = async (key, jsonData) => {
    const params = {
        Bucket: 'arastme',
        Key: key,
        ACL: 'public-read',
        Body: JSON.stringify(jsonData),
        ContentType: 'application/json',
    };

    try {
        await client.putObject(params).promise();
        console.log(`File ${key} uploaded successfully.`);
    } catch (err) {
        console.error(`Error uploading file ${key}:`, err);
        throw err;
    }
};

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

const upload = multer({ dest: 'uploads/temp' }); // Configure upload destination (optional)

function removeSpaces(str) {
    return str.replaceAll(" ", "");
}












router.get('/getAllDesignTypesDashboard', async (req, res) => {

    try {
        // Fetch 30 users starting from the specified offset (count * 30)
        const designTypes = await designService.getAllDesignTypes()

        // Send the retrieved users as JSON response
        res.json(designTypes);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});








router.post('/createNewDesignByUser', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const DesignType = req.body.DesignTypeId

        if (UserId !== null && Stoken !== null && DesignType !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {


                const date = new Date()

                const option = {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                }
                const dateTimePersian = date.toLocaleDateString("fa-IR", option)
                console.log(dateTimePersian)

                const offcialLink = generateRandomStringwithWOrd(30)

                const designType = await designService.findDesignTypeById(DesignType)
                const design = await designService.createUserDesign(UserId, DesignType, "دیزاین بدون عنوان", date.toString(), dateTimePersian, offcialLink, false, designType.DesignWidth, designType.DesignHeight, "")
                const init = await designService.createUserDesignInit(design.Id, UserId, '')

                return res.json(offcialLink)



            }



        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});










router.post('/getUserDesignByLink', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const DesignLink = req.body.DesignLink

        if (UserId !== null && Stoken !== null && DesignLink !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {

                const design = await designService.getDesignByLink(DesignLink)

                if (design !== null && design[0].UserId == UserId) {
                    return res.json(design)
                }

            }


        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});








router.post('/getUserDesignForDashboard', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken

        if (UserId !== null && Stoken !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {
                const designs = await designService.getAllUserDesign(UserId)
                console.log(designs);
                return res.json(designs)
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});









router.post('/designInitRequest', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const DesignId = req.body.DesignId

        if (UserId !== null && Stoken !== null && DesignId !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {
                const design = await designService.getDesignInitByUserDesignId(DesignId)

                if (design) {
                    return res.json(design)
                }
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});







router.post('/overrideDesignAndSaveDesign', upload.single('Image'), async (req, res) => {

    try {
        const Stoken = req.body.Stoken
        const DesignId = req.body.DesignId
        const Canvas = req.body.Canvas
        const Image = req.file
        const UserId = req.body.UserId

        //احراز هویت
        const authCheck = await AuthenticateCheck(UserId, Stoken)
        console.log(authCheck);

        if (authCheck === true) {
            const design = await designService.findUserDesignById(DesignId)

            if (design !== null) {
                console.log("*****************" + await design.Id);
                const init = await designService.getDesignInitByUserDesignId(DesignId)

                let fileName = design.DesignLink + ".json"
                let ImageName = design.DesignLink + ".png"

                if (design.DesignParentFileLink !== null) {
                    fileName = design.DesignParentFileLink + ".json"
                    ImageName = design.DesignParentFileLink + ".png"
                }


                const FileNameAndAddress = `SaveDesigns/User/${fileName}`;  //Canvas = برای فایل کنواس 
                const ImageNameAndAddress = `SaveDesigns/User/Preview/${ImageName}`;  //Image = برای فایل عکس پیش نمایش

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

                if (design.DesignReady == false) {
                    await designService.updateUserDesignReady(design.Id, true)
                }

                await designService.updateDesignPhoto(design.Id, ImageNameAndAddress)
                await designService.updateDesignFile(DesignId, FileNameAndAddress)

                return res.status(200).send("OK")




            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});






router.post('/loadDesignForDashboard', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const DesignId = req.body.DesignId


        if (UserId !== null && Stoken !== null && DesignId !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {
                const design = await designService.getDesignInitByUserDesignId(DesignId)

                if (design) {
                    return res.json(design)
                }
            }

        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});






router.post('/getMoreDesignByDesignType', async (req, res) => {
    const page = parseInt(req.body.Page); // Get the count parameter
    const typeId = parseInt(req.body.DesignTypeId); // Get the count parameter
    const stoken = req.body.Stoken
    const userId = parseInt(req.body.UserId); // Get the count parameter

    try {

        //احراز هویت
        const authCheck = await AuthenticateCheck(userId, stoken)

        if (authCheck === true) {
            const design = await designService.getStoreDesignByDesignTypeIdAndPage(page, typeId)

            // Send the retrieved users as JSON response
            return res.json(design);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});






router.post('/setDesignForCurrentUser', async (req, res) => {
    const UserId = parseInt(req.body.UserId); // Get the count parameter
    const DesignId = parseInt(req.body.DesignId); // Get the count parameter
    const Stoken = req.body.Stoken
    const UserDesignId = parseInt(req.body.UserDesignId); // Get the count parameter

    try {

        //احراز هویت
        const authCheck = await AuthenticateCheck(UserId, Stoken)

        if (authCheck === true) {
            const design = await designService.findDesignById(DesignId)
            if (design !== null) {
                const userDesign = await designService.findUserDesignById(UserDesignId)

                if (userDesign !== null) {
                    const designFile = await downloadFile(design.DesignFile)
                    const fileName = design.DesignLink + ".json"
                    const FileNameAndAddress = `SaveDesigns/User/${fileName}`;  //Canvas = برای فایل کنواس 

                    const paramsForFiles = {
                        Bucket: 'arastme',
                        Key: FileNameAndAddress,
                        ACL: 'public-read',

                        Body: JSON.stringify(designFile),  // تبدیل محتوا به رشته
                        ContentType: 'application/json'   // افزودن نوع محتوا             
                    };

                    // Upload mainFile
                    client.send(new PutObjectCommand(paramsForFiles), (error, data) => {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log(data);
                        }
                    });


                }
            }

        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});






router.post('/getUserDesignByAccessCollection', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken

        if (UserId !== null && Stoken !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {

                const data = []

                const allCollection = await usersService.findAllUserCollectionAccess(UserId)

                for (let index = 0; index < allCollection.length; index++) {
                    const element = allCollection[index];
                    const designs = await designService.getAllStoreDesignsByCollectionId(element.CollectionId)
                    const getCollect = await designService.findDesignCollectionById(element.CollectionId)

                    if (designs !== null) {
                        data.push(
                            {
                                CollectionName: getCollect.CollectionName,
                                CollectionId: element.CollectionId,
                                CollectionFrom: getCollect.CollectionGiftFrom,
                                Design: designs
                            }
                        )
                    }
                }

                return res.json(data)

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







router.post('/getDesignsByTypesTemplatePage', async (req, res) => {
    const stoken = req.body.Stoken
    const userId = parseInt(req.body.UserId); // Get the count parameter

    try {

        //احراز هویت
        const authCheck = await AuthenticateCheck(userId, stoken)

        if (authCheck === true) {

            const designs = [

            ]

            const types = await designService.getAllDesignTypes()

            for (let index = 0; index < types.length; index++) {
                const element = types[index];

                const designsByType = await designService.getStoreDesignByDesignTypeIdAndPage(1, element.Id)
                const securedDesign = []

                for (let index = 0; index < designsByType.length; index++) {
                    const design = designsByType[index];

                    securedDesign.push({
                        DesignName: design.DesignName,
                        DesignDescription: design.Description,
                        DesignShowImage: design.DesignShowImage,
                        DesignDateCreated: design.DesignDateCreated,
                        DesignLink: design.DesignLink
                    })

                }

                designs.push(
                    {
                        DesignTypeName: element.DesignName,
                        Designs: securedDesign,
                        DesignTypeId: element.Id
                    }
                )




            }

            return res.json(designs);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});







router.post('/getAllDesignTypeAndCategory', async (req, res) => {
    const stoken = req.body.Stoken
    const userId = parseInt(req.body.UserId); // Get the count parameter

    try {

        //احراز هویت
        const authCheck = await AuthenticateCheck(userId, stoken)

        if (authCheck === true) {

            const allTypeAndCategory = []
            const categories = await designService.getAllDesignTypeCategories()

            for (let index = 0; index < categories.length; index++) {
                const element = categories[index];

                const types = await designService.getAllDesignTypesByDesignTypeCategoryId(element.Id)
                allTypeAndCategory.push(
                    {
                        CategoryName: element.DesignTypeCategoryName,
                        Types: types,
                        CategoryId: element.Id,
                        TypeCategoryImage: element.DesignTypeCategoryImage,
                        Description: element.DesignTypeCategoryDescription
                    }
                )

            }

            return res.json(allTypeAndCategory);
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});







router.post('/getPublicDesignInformationDashboard', async (req, res) => {
    const DesignLink = req.body.DesignLink

    try {

        if (DesignLink !== null) {
            const design = await designService.StoreDesignByLink(DesignLink)

            if (design !== null && design.IsPrivate == false && design.DesignIsConfirmed == true) {
                console.log("________________ " + design.Id);
                const storeInfo = await storeService.findStoreById(design.StoreId)
                const designType = await designService.findDesignTypeById(design.DesignTypeId)
                const category = await categoryService.findDesignCategoryById(design.DesignCategoryId)
                if (storeInfo !== null && designType !== null && category !== null) {

                    const getDesign = {
                        DesignLicenceId: design.DesignLicenceId,
                        DesignUsed: design.DesignUsed,
                        DesignName: design.DesignName,
                        DesignDescription: design.DesignDescription,
                        DesignTags: design.DesignTags,
                        DesignCategoryName: category.CategoryName,
                        DesignCategoryId: category.Id,
                        StoreName: storeInfo.StoreName,
                        StoreProfile: storeInfo.StoreProfile,
                        StoreUserName: storeInfo.StoreUserName,
                        DesignTypeName: designType.DesignName,
                        DesignShowImage: design.DesignShowImage,
                        DesignDateCreated: design.DesignDateCreated,
                        DesignColors: design.DesignColors,
                        StoreLogo: storeInfo.StoreProfile,
                        DesignLink: design.DesignLink,
                        DesignId: design.Id
                    }


                    return res.json(getDesign)
                }
            }
            else {
                return res.status(500).json("NO")
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});









router.post('/createNewUserDesignByPublicDesign', async (req, res) => {
    const stoken = req.body.Stoken
    const userId = parseInt(req.body.UserId); // Get the count parameter
    const designLink = req.body.DesignLink
    const designId = req.body.DesignId

    try {

        if (stoken !== null && userId !== null && designLink !== null && designId !== null) {
            //احراز هویت
            const authCheck = await AuthenticateCheck(userId, stoken)

            if (authCheck === true) {
                const getDesign = await designService.StoreDesignByLink(designLink)

                if (getDesign !== null && getDesign.Id == designId) {
                    const date = new Date()

                    const option = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                    const dateTimePersian = date.toLocaleDateString("fa-IR", option)
                    console.log(dateTimePersian)

                    const offcialLink = generateRandomStringwithWOrd(30)

                    const designType = await designService.findDesignTypeById(getDesign.DesignTypeId)
                    const UserDesign = await designService.createUserDesign(userId, getDesign.DesignTypeId, "دیزاین بدون عنوان", date.toString(), dateTimePersian, offcialLink, false, designType.DesignWidth, designType.DesignHeight, "")
                    const init = await designService.createUserDesignInit(UserDesign.Id, userId, '')


                    if (UserDesign !== null) {
                        const designFile = await downloadFile(getDesign.DesignFile)
                        const fileName = getDesign.DesignLink + ".json"
                        const FileNameAndAddress = `SaveDesigns/User/${fileName}`;  //Canvas = برای فایل کنواس 

                        const paramsForFiles = {
                            Bucket: 'arastme',
                            Key: FileNameAndAddress,
                            ACL: 'public-read',

                            Body: JSON.stringify(designFile),  // تبدیل محتوا به رشته
                            ContentType: 'application/json'   // افزودن نوع محتوا             
                        };

                        // Upload mainFile
                        client.send(new PutObjectCommand(paramsForFiles), (error, data) => {
                            if (error) {
                                console.log(error);
                            } else {
                                console.log(data);
                            }
                        });


                        await designService.updateDesignPhoto(UserDesign.Id, getDesign.DesignShowImage)

                    }
                    return res.json(offcialLink)

                }


            }
        }


    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});












router.post('/CreateNewDesignInUserDesign', async (req, res) => {
    const UserId = parseInt(req.body.UserId); // Get the count parameter
    const Stoken = req.body.Stoken
    const UserDesignId = parseInt(req.body.UserDesignId); // Get the count parameter
    const DesignLink = req.body.DesignLink

    try {

        //احراز هویت
        const authCheck = await AuthenticateCheck(UserId, Stoken)

        if (authCheck === true) {

            const design = await designService.getUserDesignByLinkAndUserDesignId(DesignLink, UserDesignId)

            if (design !== null) {
                const parent = await designService.findParentUserDesign(DesignLink)

                if (parent !== null) {
                    const date = new Date()

                    const option = {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                    }
                    const dateTimePersian = date.toLocaleDateString("fa-IR", option)
                    const offcialLink = generateRandomStringwithWOrd(30)
                    const ImageNameAndAddress = `SaveDesigns/User/Preview/${offcialLink + ".png"}`;  //Image = برای فایل عکس پیش نمایش

                    const UserDesign = await designService.createUserDesign(UserId, parent.DesignTypeId, parent.DesignName, date.toString(), dateTimePersian, DesignLink, false, parent.OriginalWidth, parent.OriginalHeight, ImageNameAndAddress, offcialLink)



                    if (UserDesign !== null) {

                        return res.json(UserDesign)
                    }
                }
            }

        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});









router.post('/getDesignsByDesignCategory', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const CategoryId = req.body.CategoryId
        const Page = req.body.Page

        if (UserId !== null && Stoken !== null && CategoryId !== null && Page !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {

                const design = await designService.getDesignsByCategoryIdAndPage(Page, CategoryId)

                const secured = []
                if (design) {

                    for (let index = 0; index < design.length; index++) {
                        const des = design[index]
                        const store = await storeService.findStoreById(des.StoreId)

                        if (store) {
                            secured.push(
                                {
                                    DesignName: des.DesignName,
                                    DesignLink: des.DesignLink,
                                    StoreName: store.StoreName,
                                    StoreUserName: store.StoreUserName,
                                    StoreProfile: store.StoreProfile,
                                    DesignShowImage: des.DesignShowImage,

                                }
                            )
                        }

                    }

                    return res.json(secured)
                }
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});





router.post('/setNewNameForUserDesign', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const DesignId = req.body.DesignId
        const DesignName = req.body.DesignName

        if (UserId !== null && Stoken !== null && DesignId !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {
                const design = await designService.getDesignInitByUserDesignId(DesignId)

                if (design) {
                    await designService.updateNameOfUserDesign(DesignId,DesignName)
                    return res.status(200).json("OK")

                }
            }

        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});






router.post('/getTopDesignsByDesignTypesInDashboard', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken

        if (UserId !== null && Stoken !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {

                const allTypes = await designService.getAllDesignTypes()
                const designsByTypes = []

                if (allTypes) {


                    for (let index = 0; index < allTypes.length; index++) {
                        const type = allTypes[index];
                        const designs = await designService.getStoreDesignByDesignTypeIdAndPage(1,type.Id)

                        if (designs) {
                            
                            const readyDesigns = []

                            for (let index = 0; index < designs.length; index++) {
                                const des = designs[index];
                                const store = await storeService.findStoreById(des.StoreId)

                                if (store) {
                                    readyDesigns.push({
                                        DesignName: des.DesignName,
                                        DesignDescription: des.Description,
                                        DesignShowImage: des.DesignShowImage,
                                        DesignDateCreated: des.DesignDateCreated,
                                        DesignLink: des.DesignLink,
                                        StoreName : store.StoreName,
                                        StoreProfile : store.StoreProfile
                                    })
                                    
                                }
                       
                            }

                            designsByTypes.push({
                                DesignTypeId : type.Id,
                                DesignTypeCategoryId : type.DesignTypeCategoryId,
                                DesignTypeName : type.DesignName,
                                Designs : readyDesigns
                            })
                        }
                    }


                    return res.json(designsByTypes)

                }
            }


        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});



module.exports = router;
