

const express = require("express");
const router = express.Router();
const uploadService = require("../../services/userUploads.service");
const userService = require("../../services/users.service")
const authService = require("../../services/authenticate.service")

const jwt = require('jsonwebtoken');
const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const jwtSecret = process.env.JWT_SECRET;
const fs = require('fs');
const multer = require('multer');
const sharp = require("sharp");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");


function generateRandomString(length = 6) {
  const chars = '0123456789'; // Possible characters for the string
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars[randomIndex];
  }



  return parseInt(randomString);
}



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

const client = new S3Client({
  region: "default",
  endpoint: process.env.ARAST_ENDPOINT,
  credentials: {
    accessKeyId: process.env.ARAST_ACCESS_KEY,
    secretAccessKey: process.env.ARAST_SECRET_KEY
  },
});


const upload = multer({ dest: 'uploads/temp' }); // Configure upload destination (optional)

async function CompressAndSaveImage(imageFileName, imageBuffer, format) {
  let imagePipeline = sharp(imageBuffer);

  // تنظیم کیفیت تصویر بر اساس فرمت
  if (format === 'image/jpeg') {
    imagePipeline = imagePipeline.jpeg({ quality: 50 });
  } else if (format === 'image/png') {
    imagePipeline = imagePipeline.png({ quality: 50 });
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  const compressedImage = await imagePipeline.toBuffer();

  const fileName = `uploads/users/images/compressed/${imageFileName}`;
  const paramsForCompressedImage = {
    Bucket: 'arastme',
    Key: fileName,
            ACL: 'public-read',

    Body: compressedImage,
  };

  try {
    const data = await client.send(new PutObjectCommand(paramsForCompressedImage));
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}




router.post('/UploadNewFileByUserArast', upload.single('File'), async (req, res) => {
  try {
    // Check if req.file is defined and contains the expected file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const UserId = req.body.UserId
    const Stoken = req.body.Stoken

    //احراز هویت
    const authCheck = await AuthenticateCheck(UserId, Stoken)

    if (authCheck === true) {

      const imageFileName = req.file.originalname; // دریافت نام فایل اصلی
      const format = req.file.mimetype; // تشخیص فرمت تصویر
      const mainFile = req.file; // تبدیل به بافر

      const imageNameChanged = generateRandomStringwithWOrd() + "_" + req.file.originalname; // دریافت نام فایل اصلی
      const MAIN_BUFFER = fs.readFileSync(mainFile.path);  // خواندن فایل

      const FileNameAndAddress = `uploads/users/images/${imageNameChanged}`;
      const fileNameCompressed = `uploads/users/images/compressed/${imageNameChanged}`;

      console.log(format);
      if (format === 'image/jpeg' || format === 'image/png') {
        await CompressAndSaveImage(imageNameChanged, MAIN_BUFFER, format);
      }

      const paramsForMain = {
        Bucket: 'arastme',
        Key: FileNameAndAddress,
        ACL: 'public-read',

        Body: MAIN_BUFFER
      };

      // انتظار برای پایان عملیات آپلود فایل
      await client.send(new PutObjectCommand(paramsForMain));

      const fileUpload = {
        FileId: 1,
        UserId: UserId,
        FileName: imageFileName,
        FileCompressed: fileNameCompressed,
        MainFile: FileNameAndAddress,
        UploadDateTime: new Date().toString()
      };

      await uploadService.NewUserUpload(fileUpload.FileId, fileUpload.UserId, fileUpload.FileName, fileUpload.FileCompressed, fileUpload.MainFile, fileUpload.UploadDateTime);

      return res.status(200).json({ message: 'File uploaded successfully' });
    }
  } catch (error) {
    console.error('Error in file upload:', error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});







router.post('/GetUploadsForUser', async (req, res) => {
  const count = parseInt(req.body.count); // Get the count parameter
  const UserId = req.body.UserId
  const Stoken = req.body.Stoken

  try {
    const authCheck = await AuthenticateCheck(UserId, Stoken)

    if (authCheck === true) {

      console.log('\n \n ------>' + Stoken + UserId + "--" + count);

      // Fetch 30 users starting from the specified offset (count * 30)
      const uploads = await uploadService.getAuthenticateUserUploadsByPageCount(count, UserId)

      // Send the retrieved users as JSON response
      res.json(uploads);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});







router.post('/getUserUploadFileExpireLinkPrivate', async (req, res) => {

  try {

    const UserId = req.body.UserId
    const Stoken = req.body.Stoken
    const FileId = req.body.FileId

    if (UserId !== null && Stoken !== null && FileId !== null) {

      //احراز هویت
      const authCheck = await AuthenticateCheck(UserId, Stoken)

      if (authCheck === true) {
        const upload = await uploadService.findUserUploadById(FileId)

        if (upload) {

          const paramsForFiles = {
            Bucket: 'arastme',
            Key: upload.MainFile,
            Expires : 3600
          };


          const command = new GetObjectCommand(paramsForFiles);
          const url = await getSignedUrl(client, command)
          
          return res.json(url)

        }
      }

    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});




module.exports = router;
