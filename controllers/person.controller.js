const express = require("express");
const router = express.Router();
const personService = require("../services/person.service");
const authService = require("../services/authenticate.service");
const adminLayout = "../views/layouts/adminLayout"
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET;
/* router.get("/", async (req, res) => {
  try {
    var people = await personService.getAll();
    res.json(people);
  } catch (error) {
    console.log(error);
    res.status(500).json({ statusCode: 500, error: "Something went wrong" });
  }
}); */









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
router.get('/', authMiddleware, async (req,res) => {
  try {

      await res.redirect("/")
  } catch (error) {
      
  }

})



//Create Person
router.get('/AddPerson', authMiddleware, async (req,res) => {
  try {
      const local ={
          title:"ADMIN",
          description:"توضحیات",
          isAuthorized:false
      }

      await res.render('admin/person/createPerson',{local,layout:adminLayout})
  } catch (error) {
      
  }

})



//Auth Person
router.get('/GetAuthenticated',authMiddleware, async (req,res) => {
  try {
    const allAuth = await authService.getAll()
    const local ={
        title:"ADMIN",
        description:"توضحیات",
        isAuthorized:false
    }
    console.log(allAuth);
    await res.render('admin/person/getAuthenticated',{local,allAuth,layout:adminLayout})
  } catch (error) {
      
  }

})




router.post("/AddPerson", authMiddleware, async (req, res) => {
  try {
    console.log(req.body);
    var createdPerson = await personService.createPerson(req.body.name,req.body.email);
    await res.status(201).json(createdPerson);
  } catch (error) {
    console.log(error);
    res.status(500).json({ statusCode: 500, error: "Something went wrong" });
  }
});


router.get("/editPerson/:id", async (req, res) => {
  try {
    var person = await personService.findPersonById(req.params.id);
    const local = {
        title:"ADMIN",
        description:"توضحیات",
        isAuthorized:false
    }
    console.log(person);
    await res.render('admin/person/editPerson',{local,person,layout:adminLayout})
} catch (error) {
    
}

});

router.post("/editPerson/:id", authMiddleware, async (req, res) => {
  try {
    var exisitingPerson = await personService.findPersonById(req.params.id);
    console.log(exisitingPerson);
    if (!exisitingPerson) {
      return res
        .status(404)
        .json({ statusCode: 404, error: "Person Does not exist" });
    }
    var updatedPerson = await personService.updatePerson(req.params.id,req.body.name,req.body.email);
    return res.json(updatedPerson);
  } catch (error) {
    return res
      .statusCode(500)
      .json({ statusCode: 500, error: "Something went wrong" });
  }
});



router.get("/deletePerson/:id", authMiddleware, async (req, res) => {
  try {
    var exisitingPerson = await personService.findPersonById(req.params.id);
    if (!exisitingPerson) {
      return res
        .status(404)
        .json({ statusCode: 404, error: "Person Does not exist" });
    }

    await personService.deletePerson(req.params.id);
    return res.json({
      statusCode: 200,
      message: `person with id: ${req.params.id} is deleted successfully`,
    });
  } catch (error) {
    return res
      .statusCode(500)
      .json({ statusCode: 500, error: "Something went wrong" });
  }
});

module.exports = router;

// route functions
