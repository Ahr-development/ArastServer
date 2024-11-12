const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const userService = require("../services/users.service");
const authService = require("../services/authenticate.service");
const assetCategory = require("../services/assetCategory.service")
const adminLayout = "../views/layouts/adminLayout"
const mainLayout = "../views/layouts/mainLayout"
const simpleLayout = "../views/layouts/simpleLayout"



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
    await res.render('admin/category/categories', { local, category, layout: adminLayout })
  } catch (error) {

  }

})





//ایجـــاد دسته بندی
router.get('/AddNewCategory/:id/:type', authMiddleware, async (req, res) => {

  const typeCategory = req.params.type;
  const categoryID = req.params.id;

  try {
    const data = {
      title: "ADMIN",
      description: "توضحیات",
      typeCategory,
      categoryID
    }

    await res.render('admin/category/insertAssetCategory', { data, layout: simpleLayout })
  } catch (error) {

  }

})



router.post("/AddNewCategory", authMiddleware, async (req, res) => {
  try {

    console.log(req.body.SubCategoryName + "yyyyyyyyyyyyyyyyyyyyyyyyyyyy");

    if (req.body.TypeCategory == "SubCategory") {
      await assetCategory.createSubCategory(req.body.SubCategoryName,req.body.CategoryId)
    }
    else{
      await assetCategory.createCategory(req.body.CategoryPersianName,
        req.body.CategoryEnglishName,req.body.CategoryArabicName,req.body.CategoryDescription);
    }


    return res.redirect("/category")
  } catch (error) {
    return res.json(error);
  }
});







//ویرایش دسته بندی
router.get('/editAssetCategory/:id/:type', authMiddleware, async (req, res) => {

  const idCategory = req.params.id;
  const typeCategory = req.params.type;
  let category;

  if (typeCategory == "SubCategory") {
    category = await assetCategory.findSubCategoryById(idCategory);
  }
  else {
    category = await assetCategory.findCategoryById(idCategory);

  }
  try {
    const data = {
      title: "ADMIN",
      description: "توضحیات",
      idCategory,
      typeCategory,
      category
    }
    await res.render('admin/category/editAssetCategory', { data, layout: simpleLayout })
  } catch (error) {

  }

})


//ویرایش دسته بندی
router.post("/editCategory", authMiddleware, async (req, res) => {
  try {

    console.log(req.body.TypeCategory + req.body.TypeCategory + req.body.TypeCategory + req.body.CategoryId);
    if (req.body.TypeCategory == "SubCategory") {
      await assetCategory.updateSubCategory(req.body.CategoryId,req.body.SubCategoryName)
    }
    else{
      await assetCategory.updateCategory(req.body.CategoryId,req.body.CategoryPersianName,
        req.body.CategoryEnglishName,req.body.CategoryArabicName,req.body.CategoryDescription);
    }


    return res.redirect("/category")

  } catch (error) {
    return res
      .statusCode(500)
      .json({ statusCode: 500, error: "Something went wrong" });
  }
});





//حذف دسته بندی
router.get('/deleteAssetCategory/:id/:type', authMiddleware, async (req, res) => {

  const idCategory = req.params.id;
  const typeCategory = req.params.type;
  let category;
  if (typeCategory == "SubCategory") {
    category = await assetCategory.findSubCategoryById(idCategory);
  }
  else {
    category = await assetCategory.findCategoryById(idCategory);

  }
  try {
    const data = {
      title: "ADMIN",
      description: "توضحیات",
      idCategory,
      typeCategory,
      category
    }
    await res.render('admin/category/deleteAssetCategory', { data, layout: simpleLayout })
  } catch (error) {

  }

})





//ساب کتگوری برای فایل های ASSETS
router.get('/getCategory/:id', authMiddleware, async (req, res) => {
  const category = await assetCategory.getAllCategories()
  const subCategory = await assetCategory.getAllSubCategoriesByCategoryId(req.params.id)

  try {
    const local = {
      title: "ADMIN",
      description: "توضحیات",
      isAuthorized: false
    }


    // برگرداندن لیست زیر دسته ها به صورت JSON
    return res.json(subCategory);
  } catch (error) {
    console.log(error);
  }

})






router.get('/DesignCategory', authMiddleware, async (req, res) => {
  try {
    const category = await assetCategory.getAllDesignCategory()

    await res.render('admin/category/designCategory', { category, layout: adminLayout })
  } catch (error) {

  }

})



//ساب کتگوری برای DESIGN CATEGORY
router.get('/getDesignCategory/:id', authMiddleware, async (req, res) => {
  const subCategory = await assetCategory.getAllSubDesignCategoriesByCategoryId(req.params.id)

  try {

    // برگرداندن لیست زیر دسته ها به صورت JSON
    return res.json(subCategory);
  } catch (error) {
    console.log(error);
  }

})



//ایجـــاد دسته بندی designCategory
router.get('/AddNewDesignCategory/:id/:type', authMiddleware, async (req, res) => {

  const typeCategory = req.params.type;
  const categoryID = req.params.id;

  try {
    const data = {
      title: "ADMIN",
      description: "توضحیات",
      typeCategory,
      categoryID
    }

    await res.render('admin/category/insertDesignCategory', { data, layout: simpleLayout })
  } catch (error) {

  }

})



router.post("/AddNewDesignCategory", authMiddleware, async (req, res) => {
  try {


    if (req.body.TypeCategory == "SubCategory") {
      await assetCategory.createDesignCategory(req.body.CategoryId,req.body.CategoryName)
    }
    else{
      await assetCategory.createDesignCategory(0,req.body.CategoryName);
    }


    return res.redirect("/category/DesignCategory")
  } catch (error) {
    return res.json(error);
  }
});



module.exports = router;

// route functions
