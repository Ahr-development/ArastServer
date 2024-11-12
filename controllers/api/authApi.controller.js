
const express = require("express");
const router = express.Router();
const authService = require("../../services/authenticate.service");
const assetService = require("../../services/assets.service")
const userService = require("../../services/users.service")
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;

function generateRandomString(length = 6) {
  const chars = '0123456789'; // Possible characters for the string
  let randomString = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    randomString += chars[randomIndex];
  }



  return parseInt(randomString);
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






router.post('/CheckUserIsNew', async (req, res) => {

  const mobile = req.body.mobile; // Get the count parameter
  console.log(":::::::::::::::::::::" + mobile)

  if (mobile != null) {
    try {
      const getUser = await authService.findUserByMobile(mobile)
      if (getUser != null) {
        console.log("--------------------> " + getUser.ActiveCode)
        return res.status(200).send('Error fetching users');
      }
      else {
        const newUser = await userService.createNewUser(generateRandomString(), 4, "کاربر", "آراست", null, mobile, false)
        //ارسال پیامک
        return res.status(204).send('Error fetching users');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error fetching users');
    }
  }
  else{
    return res.status(500).send('Error fetching users');

  }
});




router.post('/GetUserByServerCode', async (req, res) => {

  const code = req.body.serverCode; 
  const roleId = req.body.roleId; 
  const token = req.body.token; 
  const UUID = req.body.UUID

  if (code != null && roleId != null && token != null) {
    try {

      const auth = await authService.FindAuthenticateByAuthCode(code)
      if (auth != null) {
        const getUser = await userService.findUserById(auth.UserId)

        if (UUID === auth.UUID) {
          if (getUser != null && getUser.RoleId == roleId && auth.AuthenticateCode == token && auth.IsValid) {
            const user = {
              FirstName : getUser.FirstName,
              LastName : getUser.LastName,
              Mobile : getUser.Mobile,
              UserId : getUser.Id
            }
            console.log(user);
            return res.json(user);
          }
          else{
            return null;
          }
        }
        else{
          return null;

        }

      }
      else{
        return null;
      }

    } catch (error) {
      console.error(error);
      return res.status(500).send('Error fetching users');
    }
  }
  else{
    return res.status(500).send('Error fetching users');

  }
});



router.post('/SignInByMobile', async (req, res) => {

  const mobile = req.body.mobile; // Get the count parameter
  if (mobile != null) {

    try {
      const getUser = await authService.findUserByMobile(mobile)

      if (getUser != null) {
        ////////// ارسال پیامک تایید
        return res.status(200).send('Error fetching users');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching users');
    }
  }
});








router.post('/ResumeSignInByMobile', async (req, res) => {

  const activecode = req.body.activecode; // Get the count parameter
  const mobile = req.body.mobile; // Get the count parameter
  const UUID = req.body.UUID

  console.log("------------))))" + UUID);
  if (activecode != null && mobile != null) {
    try {
      const getUser = await authService.findUserByMobileAndActiveCode(mobile, activecode)
      if (getUser != null) {
        await authService.updateUserActiveCode(getUser.Id, generateRandomString(6))
        console.log(getUser);

        const TokenServer = generateRandomStringwithWOrd(6)
        const expiresIn = 30 * 24 * 60 * 60;

        const userData = {
          SToken: TokenServer,
          RoleId: getUser.RoleId,
          Mobile: getUser.Mobile,
          DateExpire : expiresIn
        }


        const accessToken = jwt.sign(userData, jwtSecret, { expiresIn });
        const now = new Date();
        const auth = await authService.createAuthenticates(getUser.Id, accessToken, null, now, getUser.RoleId, true,TokenServer,UUID)
        await authService.destroyTokenSameUUID(UUID,auth.Id)


        const authenticated = {
          Token: auth.AuthenticateCode,
          SToken: auth.AuthCodeServer,
          RoleId: auth.RoleId
        }


        return res.json(authenticated);
      }
      else {
        res.status(500).send('Error fetching users');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching users');
    }
  }
});






router.post('/SignUpNewUser', async (req, res) => {

  const FirstName = req.body.Name;
  const LastName = req.body.Family;
  const Mobile = parseInt(req.body.mobile); // Get the count parameter
  const ActiveCode = req.body.ActiveCode;
  const UUID = req.body.UUID

  
  if (Mobile != null) {
    try {
      const getUser = await authService.findUserByMobileAndActiveCode(Mobile,ActiveCode)

      if (getUser != null) {

        await userService.updateUserFullNameAndActiveCode(getUser.Id,FirstName,LastName,generateRandomString())

        const TokenServer = generateRandomStringwithWOrd(6)
        const expiresIn = 30 * 24 * 60 * 60;

        const userData = {
          SToken: TokenServer,
          RoleId: getUser.RoleId,
          Mobile: getUser.Mobile,
          DateExpire : expiresIn
        }

        const accessToken = jwt.sign(userData, jwtSecret, { expiresIn });
        const now = new Date();
        const auth = await authService.createAuthenticates(getUser.Id, accessToken, null, now, getUser.RoleId, true,TokenServer,UUID)
        
        await authService.destroyTokenSameUUID(UUID,auth.Id)

        const authenticated = {
          Token: auth.AuthenticateCode,
          SToken: auth.AuthCodeServer,
          RoleId: auth.RoleId
        }

        return res.json(authenticated);

      }
      else {
        res.status(409).send('Error fetching users');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching users');
    }
  }
});










module.exports = router;
