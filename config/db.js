/* 


const Sequelize = require('sequelize');

const database = new Sequelize('khorshi6_KhorshidiDB', 'khorshi6_amirhossinrayegan', 'ni$2t6C12', {
  host: '185.252.29.60',
  port: 2022, // Define port separately
  dialect: 'mssql'
});

(async () => {
  try {
    await database.authenticate();
    console.log('Connection to database successful!');
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }
})();

module.exports = database;
*/





const { Sequelize } = require("sequelize");
const personModel = require("../models/person.model");
const userModel = require("../models/users.model");
const authenticatesModel = require("../models/authenticates.model");
const assetsCategory = require("../models/assetsCategory.model");
const assetSubCategory = require("../models/assetSubCategory.model");
const assets = require("../models/assets.model");
const fonts = require("../models/font.model");
const userUpload = require("../models/userUpload.model");
const designType = require("../models/designType.model");
const userDesign = require("../models/userDesign.model");
const userDesignInit = require("../models/userDesignInit.model");
const assetCollection = require("../models/assetCollection.model");
const store = require("../models/store.model");
const design = require("../models/design.model");
const designCategory = require("../models/designCategory.model");
const designCollection = require("../models/designCollection.model");
const userCollectionAccess = require("../models/userCollectionAccess.model");
const userDesignAccess = require("../models/userDesignAccess.model");
const designTypesCategory = require("../models/designTypesCategory.model");


require("dotenv").config();



const sequelize = new Sequelize('Arast',"horay", "13831383", {
  host: 'DESKTOP-LKFSA9D', // یا هر host دیگر
  dialect: 'mssql',
  port: 1433,
  dialectOptions: {
    options: {
      encrypt: false, // این گزینه می‌تواند true یا false باشد بسته به نیاز شما
      trustServerCertificate: true
    }
  }
});




const db = {};
db.Users = userModel(sequelize);
db.Authenticates = authenticatesModel(sequelize);
db.AssetsCategory = assetsCategory(sequelize);
db.AssetSubCategory = assetSubCategory(sequelize);
db.Assets = assets(sequelize);
db.Fonts = fonts(sequelize)
db.UserUpload = userUpload(sequelize)
db.DesignType = designType(sequelize)
db.UserDesign = userDesign(sequelize)
db.UserDesignInit = userDesignInit(sequelize)
db.AssetCollection = assetCollection(sequelize)
db.Store = store(sequelize)
db.Design = design(sequelize)
db.DesignCategory = designCategory(sequelize)
db.DesignCollection = designCollection(sequelize)
db.UserCollectionAccess = userCollectionAccess(sequelize)
db.UserDesignAccess = userDesignAccess(sequelize)
db.DesignTypesCategory = designTypesCategory(sequelize)

// sync all models with database
sequelize.sync({ alter: true });

module.exports = db;

