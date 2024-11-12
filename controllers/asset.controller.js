

const express = require("express");
const router = express.Router();
const userService = require("../services/users.service");
const authService = require("../services/authenticate.service");
const sharp = require("sharp");

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
const translate = require('@vitalets/google-translate-api');

const adminLayout = "../views/layouts/adminLayout"
const mainLayout = "../views/layouts/mainLayout"
const simpleLayout = "../views/layouts/simpleLayout"

const assetCategory = require("../services/assetCategory.service")
const assetService = require("../services/assets.service")

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



const uploadFile = async (file, fileName,buffer) => {
  
  const fileStream = fs.createReadStream(file.path);

  const paramsForMain = {
    Bucket: 'arastme',
    Key: fileName,
    Body: fileStream
  };


  // Upload mainFile
  client.send(new PutObjectCommand(paramsForMain), (error, data) => {
    if (error) {
      console.log(error);
    } else {
      console.log(data);
    }
  });


}



async function CompressAndSaveImage(imageFileName, imageBuffer, format) {
  let imagePipeline = sharp(imageBuffer);

  // تنظیم کیفیت تصویر بر اساس فرمت
  if (format === 'image/jpeg') {
    imagePipeline = imagePipeline.jpeg({ quality: 10 });
  } else if (format === 'image/png') {
    imagePipeline = imagePipeline.png({ quality: 10 });
  } else {
    throw new Error(`Unsupported format: ${format}`);
  }

  const compressedImage = await imagePipeline.toBuffer();

  const paramsForCompressedImage = {
    Bucket: 'arastme',
    Key: imageFileName,
    Body: compressedImage,
  };

  try {
    const data = await client.send(new PutObjectCommand(paramsForCompressedImage));
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}


function generateUniqueFilename() {
  // Generate a random string of characters
  const randomString = Math.random().toString(36).substring(2, 8);
  // Generate a timestamp to ensure uniqueness
  const timestamp = Date.now().toString(36);
  // Combine random string and timestamp to create unique filename
  return `${randomString}_${timestamp}`;
}


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
    const category = await assetCategory.getAllCategories()

    const local = {
      title: "ADMIN",
      description: "توضحیات",
      isAuthorized: false
    }
    await res.render('admin/assets/assets', { local, category, layout: adminLayout })
  } catch (error) {

  }

})





//Main Admin
router.get('/UploadAsset/:categoryId/:assetId', authMiddleware, async (req, res) => {
  try {
    const local = {
      title: "ADMIN",
      description: "توضحیات",
      isAuthorized: false,
      categoryID: req.params.categoryId,
      assetId: req.params.assetId
    }
    await res.render('admin/assets/uploadAsset', { local, layout: simpleLayout })
  } catch (error) {

  }

})





router.get('/getFileAssetsByCategoryId/:id', authMiddleware, async (req, res) => {
  const assets = await assetService.getAllAssetsByCategoryId(req.params.id)

  try {
    const local = {
      title: "ADMIN",
      description: "توضحیات",
      isAuthorized: false
    }


    // برگرداندن لیست زیر دسته ها به صورت JSON
    return res.json(assets);
  } catch (error) {
    console.log(error);
  }

})







router.get('/getAssetInfo/:id', authMiddleware, async (req, res) => {

  try {
    const assets = await assetService.findAssetById(req.params.id)
    let assetLink;

    const params = {
      Bucket: process.env.ARAST_BUCKET_NAME,
      Key: assets.AssetsFileName,
    };

    const command = new GetObjectCommand(params);
    await getSignedUrl(client, command).then((url) => {
      assetLink = url;
    });

    const local = {
      title: "ADMIN",
      description: "توضحیات",
      assets,
      assetLink
    }


    // برگرداندن لیست زیر دسته ها به صورت JSON
    await res.render('admin/assets/assetInfo', { local, layout: simpleLayout })
  } catch (error) {
    console.log(error);
  }

})




router.get('/AddCollectionByCategory/:id', authMiddleware, async (req, res) => {

  try {

    const categoryId = req.params.id
    let NotAccess = false
    let subCategories;

    if (categoryId !== 11) {
      subCategories = await assetCategory.getAllSubCategoriesByCategoryId(categoryId)


    }
    else {
      NotAccess = true
    }


    // برگرداندن لیست زیر دسته ها به صورت JSON
    await res.render('admin/assets/addCollection', { NotAccess, subCategories, categoryId, layout: simpleLayout })
  } catch (error) {
    console.log(error);
  }

})








router.post('/AddCollectionByCategory', authMiddleware, upload.any(), async (req, res) => {

  try {

    const collection = {
      CategoryId: req.body.CategoryId,
      SubCategoryId: req.body.SubCategoryId,
      StoreId: 1,
      PersianName: req.body.PersianName,
      ColorUsing: req.body.ColorUsing,
      KeyWord: req.body.keywordInput,
      Description: req.body.Description
    }


    const newCollect = await assetService.createCollection(collection)
    const collectionFolderName = removeSpaces((await translate.translate(collection.PersianName, { to: 'en' })).text)

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const sectionIndex = file.fieldname.split('_')[1]; // گرفتن اندکس از نام فایل

      const newFilename = `Assets/Collection/${collectionFolderName}/${generateUniqueFilename()}_${file.originalname}`;
      const originalName = String(file.originalname)
      const staticPNGname = changeFileExtension(originalName, '.png');
      const staticFileName = `Assets/Collection/${collectionFolderName}/${generateUniqueFilename()}_${staticPNGname}`;

      const buffer = fs.readFileSync(file.path)
      await uploadFile(file, newFilename);
      await sharp(buffer).png({ quality: 20 }).toBuffer().then(pngBuffer => {

        const paramsForMain = {
          Bucket: 'arastme',
          Key: staticFileName,
          Body: pngBuffer
        };
      
      
        // Upload mainFile
        client.send(new PutObjectCommand(paramsForMain), (error, data) => {
          if (error) {
            console.log(error);
          } else {
            console.log(data);
          }
        });

      })

      const englishTitle = await translate.translate(collection.PersianName + " " + req.body[`fileName_${sectionIndex}`], { to: 'en' })
      const arabicTitle = await translate.translate(collection.PersianName + " " + req.body[`fileName_${sectionIndex}`], { to: 'ar' })

      // تطبیق فایل با داده‌های متنی
      const asset = {
        TypeId: 1,
        CategoryId: collection.CategoryId,
        SubCategoryId: collection.SubCategoryId,
        CollectionId: newCollect.Id,
        AssetId: 1,
        StoreId: 1,
        PersianName: collection.PersianName + " " + req.body[`fileName_${sectionIndex}`],
        EnglishName: englishTitle.text,
        ArabicName: arabicTitle.text,
        Description: collection.Description,
        PriceIRR: 0,
        PriceUSD: 0,
        UsingNumber: 0,
        StarCounter: 0,
        ColorUsing: collection.ColorUsing,
        AssetsFileName: newFilename,
        AssetsStaticFile: staticFileName,
        KeyWord: collection.KeyWord + " " + req.body[`hashtags_${sectionIndex}`],
      };

      await assetService.createAsset(asset);
      // پاک کردن فایل‌های موقتی از سرور
      fs.unlinkSync(file.path);
    }




    return res.redirect("/asset");


  } catch (error) {
    console.log(error);
  }

})









router.post('/UploadAsset', authMiddleware, upload.single('MainFile'), async (req, res) => {
  try {
    // Check if req.files is defined and contains the expected files
    if (!req.file) {
      return res.status(400).send('No file uploaded');
    }

    const mainFile = req.file; // Access the first file in MainFile array
    const format = req.file.mimetype; // تشخیص فرمت تصویر

    const MAIN_BUFFER = fs.readFileSync(mainFile.path);

    const newStaticFilename = `Assets/${generateUniqueFilename()}_${mainFile.originalname}`;
    const newMainFilename = `ArastAssets/${generateUniqueFilename()}_${mainFile.originalname}`;

    await CompressAndSaveImage(newStaticFilename, MAIN_BUFFER, format);

    const englishTitle = await translate.translate(req.body.PersianName, { to: 'en' })
    const arabicTitle = await translate.translate(req.body.PersianName, { to: 'ar' })

    /*     const paramsForStatic = {
          Bucket: 'arastme',
          Key: newStaticFilename,
          Body: STATIC_BUFFER
        }; */

    const paramsForMain = {
      Bucket: 'arastme',
      Key: newMainFilename,
      Body: MAIN_BUFFER
    };


    // Assuming "client" is your S3 client

    // Upload mainFile
    client.send(new PutObjectCommand(paramsForMain), (error, data) => {
      if (error) {
        console.log(error);
      } else {
        console.log(data);
      }
    });

    // Upload staticFile
    /*     client.send(new PutObjectCommand(paramsForStatic), (error, data) => {
          if (error) {
            console.log(error);
          } else {
            console.log(data);
          }
        }); */

    // Get signed URL for staticFile
    /*     const staticCommand = new GetObjectCommand(paramsForStatic);
        let staticAssetLink;
        await getSignedUrl(client, staticCommand).then((url) => {
          staticAssetLink = url;
        }); */


    const subCategory = await assetCategory.findSubCategoryById(req.body.CategoryId)


    const data = {
      TypeId: 1,
      SubCategoryId: req.body.CategoryId,
      CategoryId: subCategory.CategoryId,
      CollectionId: 0,
      StoreId: 1,
      PersianName: req.body.PersianName,
      EnglishName: englishTitle.text,
      ArabicName: arabicTitle.text,
      Description: req.body.Description,
      PriceIRR: req.body.PriceIRR,
      PriceUSD: 0,
      UsingNumber: 0,
      StarCounter: 0,
      ColorUsing: req.body.ColorUsing,
      AssetsFileName: newMainFilename,
      AssetsStaticFile: newStaticFilename,
      AssetId: 0,
      KeyWord: req.body.KeyWord

    };

    // Assuming "assetService" handles asset creation
    await assetService.createAsset(data);

    // Delete the temporary files
    await fs.promises.unlink(mainFile.path);

    return res.redirect("/asset");
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file to S3');
  }
});













router.get('/Collection/:id', authMiddleware, async (req, res) => {


  try {

    const data = [

    ]
    const categoryId = req.params.id
    const category = await assetCategory.findCategoryById(categoryId)
    const collection = await assetService.getCollectionByCategoryId(categoryId)

    for (let index = 0; index < collection.length; index++) {
      const c = collection[index]
      const collect = {
        CollectionName : c.PersianName,
        CollectionId : c.Id,
        Assets : await assetService.getAllAssetCollectionByCollectionId(c.Id)
      }
      data.push(collect)
      
    }


    await res.render('admin/assets/collection', { data,category, layout: adminLayout })

    // برگرداندن لیست زیر دسته ها به صورت JSON
  } catch (error) {
    console.log(error);
  }

})



router.get('/LoadAssetsCollection/:id', authMiddleware, async (req, res) => {


  try {


    const collectionId = req.params.id
    const getCollection = await assetService.findAssetCollectionById(collectionId)
    const getAssets = await assetService.getAllAssetCollectionByCollectionId(getCollection.Id)
    const category = await assetCategory.findCategoryById(getCollection.CategoryId)


    await res.render('admin/assets/loadAssetCollection', { getAssets,getCollection,category, layout: adminLayout })

    // برگرداندن لیست زیر دسته ها به صورت JSON
  } catch (error) {
    console.log(error);
  }

})





router.get('/OverrideCollection/:id', authMiddleware, async (req, res) => {

  try {

    const CollectionId = req.params.id

    // برگرداندن لیست زیر دسته ها به صورت JSON
    await res.render('admin/assets/overrideCollection', {CollectionId, layout: simpleLayout })
  } catch (error) {
    console.log(error);
  }

})




router.post('/OverrideCollection', authMiddleware, upload.any(), async (req, res) => {

  try {

    const Collect = await assetService.findAssetCollectionById(req.body.CollectionId)
    const folderName = removeSpaces((await translate.translate(Collect.PersianName, { to: 'en' })).text)

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const sectionIndex = file.fieldname.split('_')[1]; // گرفتن اندکس از نام فایل

      const newFilename = `Assets/Collection/${collectionFolderName}/${generateUniqueFilename()}_${file.originalname}`;
      const originalName = String(file.originalname)
      const staticPNGname = changeFileExtension(originalName, '.png');
      const staticFileName = `Assets/Collection/${collectionFolderName}/${generateUniqueFilename()}_${staticPNGname}`;

      const buffer = fs.readFileSync(file.path)
      await uploadFile(file, newFilename);
      await sharp(buffer).png({ quality: 20 }).toBuffer().then(pngBuffer => {

        const paramsForMain = {
          Bucket: 'arastme',
          Key: staticFileName,
          Body: pngBuffer
        };
      
      
        // Upload mainFile
        client.send(new PutObjectCommand(paramsForMain), (error, data) => {
          if (error) {
            console.log(error);
          } else {
            console.log(data);
          }
        });

      })

      const englishTitle = await translate.translate(Collect.PersianName + " " + req.body[`fileName_${sectionIndex}`], { to: 'en' })
      const arabicTitle = await translate.translate(Collect.PersianName + " " + req.body[`fileName_${sectionIndex}`], { to: 'ar' })

      // تطبیق فایل با داده‌های متنی
      const asset = {
        TypeId: 1,
        CategoryId: Collect.CategoryId,
        SubCategoryId: Collect.SubCategoryId,
        CollectionId: Collect.Id,
        AssetId: 1,
        StoreId: 1,
        PersianName: Collect.PersianName + " " + req.body[`fileName_${sectionIndex}`],
        EnglishName: englishTitle.text,
        ArabicName: arabicTitle.text,
        Description: Collect.Description,
        PriceIRR: 0,
        PriceUSD: 0,
        UsingNumber: 0,
        StarCounter: 0,
        ColorUsing: Collect.ColorUsing,
        AssetsFileName: newFilename,
        AssetsStaticFile: staticFileName,
        KeyWord: Collect.KeyWord + " " + req.body[`hashtags_${sectionIndex}`],
      };

      await assetService.createAsset(asset);
      // پاک کردن فایل‌های موقتی از سرور
      fs.unlinkSync(file.path);
    }




    return res.redirect("/asset");


  } catch (error) {
    console.log(error);
  }

})



router.get('/UploadAssetsWithoutInformation/:subCategoryId', authMiddleware, async (req, res) => {

  try {

    const CategoryId = req.params.subCategoryId

    // برگرداندن لیست زیر دسته ها به صورت JSON
    await res.render('admin/assets/uploadAssetWithoutInformation', {CategoryId, layout: simpleLayout })
  } catch (error) {
    console.log(error);
  }

})




router.post('/UploadAssetsWithoutInformation', authMiddleware, upload.any(), async (req, res) => {

  try {
    const subCategory = await assetCategory.findSubCategoryById(req.body.SubCategoryId)

    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];

      const newFilename = `Assets/Shapes/${generateUniqueFilename()}_${file.originalname}`;
      await uploadFile(file, newFilename);

      // تطبیق فایل با داده‌های متنی
      const asset = {
        TypeId: 2,
        CategoryId: subCategory.CategoryId,
        SubCategoryId: subCategory.Id,
        CollectionId: 0,
        AssetId: 1,
        StoreId: 1,
        PersianName: null,
        EnglishName: null,
        ArabicName: null,
        Description: null,
        PriceIRR: 0,
        PriceUSD: 0,
        UsingNumber: 0,
        StarCounter: 0,
        ColorUsing: null,
        AssetsFileName: newFilename,
        AssetsStaticFile: null,
        KeyWord: null,
      };

      await assetService.createAsset(asset);
      // پاک کردن فایل‌های موقتی از سرور
      fs.unlinkSync(file.path);
    }




    return res.redirect("/asset");


  } catch (error) {
    console.log(error);
  }

})



module.exports = router;

// route functions
