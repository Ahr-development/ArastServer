
const express = require("express");
const router = express.Router();
const adminLayout = "../../views/layouts/adminLayout"
const simpleLayout = "../../views/layouts/simpleLayout"

const authService = require("../../services/authenticate.service");
const usersService = require("../../services/users.service");
const assetService = require("../../services/assets.service")
const assetCategoryService = require("../../services/assetCategory.service");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");

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
    const authenticate = await authService.FindAuthenticateByAuthCode(Stoken)
    if (authenticate !== null) {
      if (userId === authenticate.UserId) {
        const user = await usersService.findUserById(userId)
        if (user !== null) {
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




// Controller function to fetch data based on count parameter
router.get('/getAssetsByArastApi/:count', async (req, res) => {
  const count = parseInt(req.params.count); // Get the count parameter

  try {
    // Fetch 30 users starting from the specified offset (count * 30)
    const assets = await assetService.getAssetsApi(count)

    // Send the retrieved users as JSON response
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});







router.get('/getAllFontsApi', async (req, res) => {

  try {

    // Fetch 30 users starting from the specified offset (count * 30)
    const fonts = await assetService.getAllFonts()

    // Send the retrieved users as JSON response
    res.json(fonts);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});






router.get('/getAllAssetsCategoryAndSubCategories', async (req, res) => {

  try {

    //احراز هویت
    const Categories = {
      category: {},
      subCategory: {}
    };

    Categories.category = await assetCategoryService.getAllCategories()
    Categories.subCategory.subPhotos = await assetService.getAllSubCategoriesByCategoryId(11)
    Categories.subCategory.subGraphics = await assetService.getAllSubCategoriesByCategoryId(10)
    Categories.subCategory.subLogos = await assetService.getAllSubCategoriesByCategoryId(13)

    // Send the retrieved users as JSON response
    res.json(Categories);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});





router.get('/getInitAssets', async (req, res) => {

  try {

    //احراز هویت
    const assets = {
      photos: [],
      stickerCollections: [],
      logoCollections: [],
      graphics: [],
      shapes: []
    };

    assets.photos = await assetService.getAssetsByCategoryIdWithLimition(11, 10)
    assets.graphics = await assetService.getAssetsByCategoryIdWithLimition(10, 40)
    assets.shapes = await assetService.getAssetsByCategoryIdWithLimition(9, 40)

    const initCollection = await assetService.getCollectionByCategoryId(12, 1, 3)
    const logosCollection = await assetService.getCollectionByCategoryId(13, 1, 20)

    let assetStickerCollection = []
    let assetLogosCollection = []

    for (let index = 0; index < initCollection.length; index++) {
      const collection = initCollection[index]
      const assets = await assetService.getAllAssetCollectionByCollectionId(collection.Id)
      assetStickerCollection.push(
        {
          CollectionName: collection.PersianName,
          CollectionDescription: collection.Description,
          CollectionFiles: [assets],
          CollectionId: collection.Id
        }
      )
    }


    for (let index = 0; index < logosCollection.length; index++) {
      const collection = logosCollection[index]
      const assets = await assetService.getAllAssetCollectionByCollectionId(collection.Id)
      assetLogosCollection.push(
        {
          CollectionName: collection.PersianName,
          CollectionDescription: collection.Description,
          CollectionFiles: [assets],
          CollectionId: collection.Id

        }
      )
    }
    assets.stickerCollections = assetStickerCollection;
    assets.logoCollections = assetLogosCollection;

    // Send the retrieved users as JSON response
    res.json(assets);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});








router.get('/getSomeAssetsByCategories', async (req, res) => {

  try {
    const assets = {};
    assets.graphics = await assetService.getAllAssetsByCategoryId(10);
    assets.photos = await assetService.getAllAssetsByCategoryId(11);
    assets.stickers = await assetService.getAllAssetsByCategoryId(12);
    assets.logos = await assetService.getAllAssetsByCategoryId(13);
    return res.json(assets);
  } catch (error) {
    console.error("Error fetching assets:", error);
    // Handle errors appropriately, e.g., return an empty array or throw a custom error
    return []; // Example: Return an empty array on error
  }
});




// Controller function to fetch data based on count parameter
router.get('/getMoreAssetsByPageRequestAndCategoryId/:categoryId/:page', async (req, res) => {
  const page = parseInt(req.params.page); // Get the count parameter
  const categoryId = parseInt(req.params.categoryId); // Get the count parameter

  try {

    const assets = await assetService.getAssetsApiByCategoryIdAndPageNumber(page, categoryId)
    res.json(assets);

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});





router.post('/getStickerPacksById', async (req, res) => {
  const CollectionId = req.body.CollectionId

  try {
    if (CollectionId !== null) {

      const collections = await assetService.getAllAssetsByCollectionId(CollectionId)
      const pack = [{ CollectionId: { collections } }]
      res.json(pack);

    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});






router.post('/getAssetInfoByAssetId', async (req, res) => {
  const AssetId = req.body.AssetId

  try {
    if (AssetId !== null) {

      const asset = await assetService.findAssetById(AssetId)
      if (asset !== null) {

        const minimal = {
          PersianName: asset.PersianName,
          Description: asset.Description,
          ColorUsing: asset.ColorUsing,
          KeyWord: asset.KeyWord,
        }
        return res.json(minimal);
      }

    }

  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});






router.post('/getAssetFileExpirePrivateLink', async (req, res) => {

  try {

    const UserId = req.body.UserId
    const Stoken = req.body.Stoken
    const AssetId = req.body.AssetId

    if (UserId !== null && Stoken !== null && AssetId !== null) {

      //احراز هویت
      const authCheck = await AuthenticateCheck(UserId, Stoken)

      if (authCheck === true) {
        const asset = await assetService.findAssetById(AssetId)

        if (asset) {

          const paramsForFiles = {
            Bucket: 'arastme',
            Key: asset.AssetsFileName,
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
