
const db = require("../config/db");
const userService = require("../services/users.service");
const { Op } = require("sequelize");


const getAll = async () => {
  return await db.Authenticates.findAll();
};

const createAuthenticates = async (UserId, AuthenticateCode, BrowserName, AuthDate, RoleId, IsValid, AuthCodeServer,UUID) => {
  const newAuthenticates = await db.Authenticates.create({
    UserId,
    AuthenticateCode,
    BrowserName,
    AuthDate,
    RoleId,
    IsValid, // Set IsValid value explicitly
    AuthCodeServer, // Set AuthCodeServer value explicitly
    UUID
  });

  return newAuthenticates;
};



const findPersonByAuthCode = async (authCode) => {
  const userLogin = await db.Authenticates.findOne({
    where: {
      AuthCodeServer: authCode,
    },
  });

  const user = await userService.findUserById(userLogin.UserId)

  if (userLogin && userLogin.IsValid == true && user != null && user.RoleId == 1 || user.RoleId == 2) {
    return userLogin;

  } else {
    return null;
  }
};


const FindAuthenticateByAuthCode = async (authCode) => {
  const auth = await db.Authenticates.findOne({
    where: {
      AuthCodeServer: authCode,
    },
  });

  return auth;  
}


const findUserByAuthCodeForPanel = async (authCode,roleId) => {
  const userLogin = await db.Authenticates.findOne({
    where: {
      AuthCodeServer: authCode,
      RoleId : roleId
    },
  });

  const user = await userService.findUserById(userLogin.UserId)

  if (userLogin && userLogin.IsValid == true && user != null) {
    return userLogin;

  } else {
    return null;
  }
};



const findUserByAuthCodeForStore = async (authCode) => {
  const userLogin = await db.Authenticates.findOne({
    where: {
      AuthCodeServer: authCode,
    },
  });

  const user = await userService.findUserById(userLogin.UserId)

  if (userLogin && userLogin.IsValid == true && user != null) {
    return userLogin;

  } else {
    return null;
  }
};




const findUserByMobile = async (mobile) => {
  const user = await db.Users.findOne({
    where: {
      Mobile : mobile,
    },
  });

  return user;
}


const findUserByMobileAndActiveCode = async (mobile,activecode) => {
  const user = await db.Users.findOne({
    where: {
      Mobile : mobile,
      ActiveCode : activecode
    },
  });

  return user;
}


const updateUserActiveCode = async ( Id, ActiveCode ) => {
   await db.Users.update(
    { ActiveCode },
    {
      where: {
        Id: Id,
      },
    }
  );
  return null;
};



const destroyTokenSameUUID = async (UUID, Id) => {
  try {
    await db.Authenticates.destroy({
      where: {
        UUID,
        Id: {
          [Op.ne]: Id,
        },
      },
    });
  } catch (error) {
    console.error("Error while deleting token:", error);
  }
};




module.exports = {
  getAll,
  createAuthenticates,
  findPersonByAuthCode,
  findUserByMobile,
  findUserByMobileAndActiveCode,
  updateUserActiveCode,
  findUserByAuthCodeForPanel,
  FindAuthenticateByAuthCode,
  findUserByAuthCodeForStore,
  destroyTokenSameUUID
};