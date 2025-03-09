


const db = require("../config/db");

const getAll = async () => {
  return await db.Users.findAll();
};

const findUserById = async (id) => {
  return await db.Users.findByPk(id);
};


const findUserByMobile = async (mobile) => {
  const user = await db.Users.findOne({
    where: {
      Mobile: mobile,
    },
  });

  return user;

};


const createNewUser = async (ActiveCode, RoleId, FirstName, LastName, Password, Mobile, IsActivateNumber) => {
  const user = await db.Users.create({
    ActiveCode,
    RoleId,
    FirstName,
    LastName,
    Password,
    Mobile,
    IsActivateNumber,
    IsBan : false,
  });

  return user;
};


const updateUserFullNameAndActiveCode = async (Id, FirstName, LastName, ActiveCode) => {
  await db.Users.update(
    { FirstName, LastName, ActiveCode },
    {
      where: {
        Id: Id,
      },
    }
  );
  return null;
};


const findUserByPhoneAndPassword = async (Mobile, Password) => {

  // 1. Query the User table using phoneNumber and hashedPassword
  const user = await db.Users.findOne({
    where: {
      Mobile,
      Password,
    },
  });

  // 3. Return the user if found, otherwise null
  if (user) {
    return user;
  } else {
    return null;
  }
};


const deleteUser = async (Id) => {
  await db.Users.destroy({
    where: { Id: Id },
  });
};



const createUserCollectionAccess = async (data) => {
  try {
    const collection = await db.UserCollectionAccess.create(data);
    return collection;
  } catch (error) {
    console.error('Error creating asset:', error.message);
    throw error; // Re-throw the error for handling at a higher level
  }
};

const findAllUserCollectionAccess = async (UserId) => {
  const user = await db.UserCollectionAccess.findAll({
    where: {
      UserId: UserId,
      CollectionAccess : true
    },
  });

  return user;

};



const userCollectionAccessAny = async (UserId,CollectionId) => {
  const user = await db.UserCollectionAccess.findOne({
    where: {
      UserId,
      CollectionId
    },
  });

  return user;

};



const findAllUserDesignAccess = async (UserId) => {
  const access = await db.UserDesignAccess.findAll({
    where: {
      UserId: UserId,
      AccessStatus : true
    },
  });

  return access;

};

const findAnyUserDesignAccess = async (UserId,DesignId) => {
  const access = await db.UserDesignAccess.findOne({
    where: {
      UserId,
      DesignId,
      AccessStatus : true
    },
  });

  return access;

};



module.exports = {
  getAll,
  findUserById,
  findUserByPhoneAndPassword,
  deleteUser,
  createNewUser,
  findUserByMobile,
  updateUserFullNameAndActiveCode,
  createUserCollectionAccess,
  findAllUserCollectionAccess,
  userCollectionAccessAny,
  findAllUserDesignAccess,
  findAnyUserDesignAccess
};