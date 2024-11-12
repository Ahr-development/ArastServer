const express = require("express");
const router = express.Router();
const userService = require("../services/users.service");
const authService = require("../services/authenticate.service");

const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

const adminLayout = "../views/layouts/adminLayout"
const mainLayout = "../views/layouts/mainLayout"


function generateRandomString(length = 6) {
    const chars = '0123456789'; // Possible characters for the string
    let randomString = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        randomString += chars[randomIndex];
    }

    return randomString;
}



const authMiddleware = async (req, res, next ) => {
    const token = req.cookies && req.cookies['arast-panel-token'];
    console.log(token);
  
    if(!token) {
      return res.redirect("/Login")
    }
    else{
      try {
        const decoded = jwt.verify(token, jwtSecret);
        const auth = await authService.findPersonByAuthCode(decoded.serverCode)
        if (auth != null) {
          next();
        }
       
      } catch(error) {
        return res.redirect("/Login")
      }
    }
}



//Main Admin
router.get('/', authMiddleware, async (req, res) => {
    try {
        const local = {
            title: "ADMIN",
            description: "توضحیات",
            isAuthorized: false
        }
        await res.render('admin/index', { local, layout: adminLayout })
    } catch (error) {

    }

})


//LOGIN
router.get('/Login', async (req, res) => {
    try {
        const local = {
            title: "ADMIN",
            description: "توضحیات",
            isAuthorized: false
        }
        await res.render('admin/login', { local, layout: mainLayout })
    } catch (error) {

    }

})



//LOGIN
router.post('/Login', async (req, res) => {
    try {
        console.log(req.body);
        var user = await userService.findUserByPhoneAndPassword(req.body.mobile, req.body.password)
        if (user != null) {


            // اطلاعات توکن را تعریف کنید
            const userData = {
                userId: user.Id, // شناسه کاربری
                username: user.FirstName + " " + user.LastName, // نام کاربری
                serverCode: generateRandomString(6), // عدد 6 رقمی تصادفی
                role: user.RoleId, // نقش تصادفی
            };
            const expiresIn = 30 * 24 * 60 * 60;

            const accessToken = jwt.sign(userData, jwtSecret, { expiresIn });

            const now = new Date();
            const auth = authService.createAuthenticates(user.Id, accessToken, "Chorome", now, user.RoleId, true, userData.serverCode);

            res.cookie('arast-panel-token', accessToken, { httpOnly: true });
            res.redirect('/person');
        }
        else {
            res.redirect('/login');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ statusCode: 500, error: "Something went wrong" });
    }

})


module.exports = router;

// route functions
