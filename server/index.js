const express = require("express");
const bycrypt = require("bcrypt");
const cors = require("cors");
const passport = require("passport");
const initialize = require("./passport/passport.js");
const initialiseGoogle = require("./passport/passportGoogle.js");
const flash = require("express-flash");
const session = require("express-session");
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config({ path: __dirname + "/.env" });
}
const User = require("./models/user");
const googleUser = require("./models/googleUser");
const socketio = require("socket.io");

const http = require("http");
const app = express();
const server = http.createServer(app);
const io = socketio(server);

mongoose.connect(
  process.env.DB,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("connect to db")
);
const router = require("./routes/routes");
const groupRouter = require("./routes/grouproutes");
const indiGroupRouter = require("./routes/indiGroupRoutes");
initialiseGoogle(passport, async (id) => await User.findOne({ _id: id }));

initialize(
  passport,
  async (email) => await User.findOne({ email: email }),
  async (id) => await User.findOne({ _id: id })
);

app.set("view-engine", "ejs");

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(flash());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public2/")));

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/");
  }
);

app.get("/register", checkNotAuthenticated, (req, res) => {
  res.render("register.ejs", { error: null });
});
app.get("/login", checkNotAuthenticated, (req, res) => {
  res.render("login.ejs");
});

app.post("/register", checkNotAuthenticated, async (req, res) => {
  try {
    const password = await bycrypt.hash(req.body.password, 10);
    console.log(password);
    const emailExist = await User.findOne({ email: req.body.email });
    if (emailExist == null) {
      const user = new User({
        name: req.body.name,
        email: req.body.email,
        password,
      });
      const savedUser = await user.save();
      console.log("registered");
      res.redirect("/login");
    } else {
      res.render("register.ejs", { error: "Email already exists" });
    }
  } catch (err) {
    res.send(err);
    console.log(err);
  }
});

app.post(
  "/login",
  checkNotAuthenticated,
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    console.log(req.user);
  }
);

app.delete("/logout", function (req, res) {
  req.logOut();
  req.session.destroy(function (err) {
    res.redirect("/");
  });
});

//check if the user is authenticated
app.use(function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/login");
});

app.use(express.static(path.join(__dirname, "/public/")));
app.use(express.static(path.join(__dirname, "/public/groups")));

io.on("connection", (socket) => {
  //catching todo
  socket.on("joinGroup", (group) => {
    socket.join(group);
    socket.on("todo", ({ todo, name }) => {
      io.to(group).emit("todoValue", { todo, name });
    });
  });
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/", `index.html`));
});
app.get("/groups/indigroup", (req, res) => {
  res.sendFile(path.join(__dirname + "/public/groups", `indigroup.html`));
});
//router use
app.use("/api/user/", router);
app.use("/groups/api/group/", groupRouter);
app.use("/groups/api/indigroup/", indiGroupRouter);

function checkNotAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return res.redirect("/");
  }
  next();
}
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Listening on port", PORT));
