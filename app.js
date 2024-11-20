
require('dotenv').config();
const express = require('express')
const app = express();
const cors = require("cors");
const expressLayout = require('express-ejs-layouts') // Support Your App From < ejs >
var path = require('path');
const authService = require("./services/authenticate.service");
const cookieParser = require('cookie-parser');



const port = 5000 || process.env.PORT

app.use(express.json()); 
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); 
app.use(expressLayout)
app.use(cors())
app.set('layout','./layouts/main');
app.set('view engine' , 'ejs');

app.use(express.static(path.resolve('./public')));





app.use("/", require("./controllers/main.controller"));
app.use("/asset", require("./controllers/asset.controller"));
app.use("/person", require("./controllers/person.controller"));
app.use("/category", require("./controllers/category.controller"));
app.use("/fonts", require("./controllers/font.controller"));
app.use("/design", require("./controllers/design.controller"));
app.use("/store", require("./controllers/store.controller"));

app.use("/api/asset", require("./controllers/api/assetsApi.controller"));
app.use("/api/authorize", require("./controllers/api/authApi.controller"));
app.use("/api/upload/byUser", require("./controllers/api/uploadApi.controller"));
app.use("/api/design", require("./controllers/api/designApi.controller"));
app.use("/api/store", require("./controllers/api/storeApi.controller"));
app.use("/api/user/dashboard", require("./controllers/api/userApi.controller"));



app.listen(port, () => console.log("Server listening on port " + port));
app.listen(port, '0.0.0.0', () => {
    console.log(`Server listening on port ${port}`);
  });
  


  app.use((req, res, next) => {
    console.log(`Request made to: ${req.url}`);
    next();
  });
  