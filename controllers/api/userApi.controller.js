
const express = require("express");
const router = express.Router();
const designService = require("../../services/design.service")
const storeService = require("../../services/store.service")
const authService = require("../../services/authenticate.service")
const userService = require("../../services/users.service")

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



const AuthenticateCheck = async (userId, Stoken) => {

    if (userId !== null && Stoken !== null) {
        console.log('\n \n ------>' + userId + Stoken);
        const authenticate = await authService.FindAuthenticateByAuthCode(Stoken)
        if (authenticate !== null) {
            console.log('\n \n ------>' + authenticate.UUID);

            if (userId == authenticate.UserId) {
                const user = await userService.findUserById(userId)
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



/* 


router.post('/transformDesignsFromStoreCollectionToUser', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const CollectionId = req.body.CollectionId

        if (UserId !== null && Stoken !== null && CollectionId !== null ) {

            //احراز هویت
            const user = await authService.findUserByAuthCodeForStore(Stoken)

            if (user !== null && user.Id === UserId) {
                
                const collection = await storeService.findDesignCollectionById(CollectionId)

                if (collection !== null) {
                    const store = await storeService.findStoreById(collection.StoreId)

                    if (store !== null && store.UserId !== UserId) {
                        
                        const designs = await designService.getAllStoreDesignsByCollectionId(collection.Id)
                        
                        if (designs !== null) {
                            
                            const persian = getPersianDate()

                            for (let index = 0; index < designs.length; index++) {
                                let current = designs[index]
                                const type = await designService.findDesignTypeById(current.DesignTypeId)

                                await designService.createUserDesign(UserId,current.DesignTypeId,current.DesignName,current.DesignDateOverride,persian,current.DesignLink,true,type.DesignWidth,type.DesignHeight,current.DesignShowImage)

                            }


                        }

                    }
                    else{
                        return res.status(300).json("SAME")
                    }
                }
                

            }
       
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching users');
    }
});

 */






router.post('/applyUserCollectionAccess', async (req, res) => {

    try {

        const UserId = req.body.UserId
        const Stoken = req.body.Stoken
        const CollectionId = req.body.CollectionId

        if (UserId !== null && Stoken !== null && CollectionId !== null) {

            //احراز هویت
            const authCheck = await AuthenticateCheck(UserId, Stoken)

            if (authCheck === true) {

                const Collection = await storeService.findDesignCollectionById(CollectionId)

                if (Collection !== null) {
                    
                    const userCollection = await userService.userCollectionAccessAny(UserId,CollectionId)

                    if (userCollection === null) {
                        
                        const data = {
                            UserId : UserId,
                            StoreId : Collection.StoreId,
                            CollectionId : CollectionId,
                            CollectionAccess : true
                        }
                        await userService.createUserCollectionAccess(data)

                        res.status(200).send('OK');

                    }

                }


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









module.exports = router;
