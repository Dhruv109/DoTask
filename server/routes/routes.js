const router = require("express").Router();
const User = require("../models/user");
const googleUser = require("../models/googleUser");

router.get("/getname", async (req, res) => {
  try {
    let user = await googleUser.findOne({ _id: req.session.passport.user });
    if (!user) user = await req.user;

    res.send(user.name);
  } catch (err) {
    console.log(err);
  }
});

router.put("/addtodo", async (req, res) => {
  try {
    const user = await getUser(req);

    if (user.isGoogle) {
      await googleUser.updateOne(
        { _id: user.user._id },
        { $push: { todo: req.body.todo } }
      );
    } else {
      await User.updateOne(
        { _id: user.user.id },
        { $push: { todo: req.body.todo } }
      );
      res.send("updated");
    }
  } catch (err) {
    res.send(err);
  }
});
router.put("/addcomplete", async (req, res) => {
  try {
    const user = await getUser(req);
    let myUser = user.isGoogle ? googleUser : User;

    await myUser.updateOne(
      { _id: user.user._id },
      { $push: { complete: req.body.complete } }
    );
    res.send("added complete");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/gettodo", async (req, res) => {
  //console.log(req.params.id);
  try {
    const user = await getUser(req);
    let myUser = user.isGoogle ? googleUser : User;
    const { todo } = await myUser.findOne({ _id: user.user._id });
    // console.log(todo);
    res.send(todo);
  } catch (err) {
    res.send(err);
  }
});
router.put("/updatecomplete", async (req, res) => {
  try {
    const user = await getUser(req);
    let myUser = user.isGoogle ? googleUser : User;
    const index = req.body.index;
    await myUser.updateOne(
      { _id: user.user._id },
      { $set: { [`complete.${index}`]: req.body.complete } }
    );
    res.send("updated c");
  } catch (err) {
    res.status(400).send(err);
  }
});
router.get("/getcomplete", async (req, res) => {
  //console.log(req.params.id);
  try {
    const user = await getUser(req);
    const complete = user.user.complete;
    // console.log(todo);
    res.send(complete);
  } catch (err) {
    res.send(err);
  }
});
router.put("/deletecomplete", async (req, res) => {
  try {
    const user = await getUser(req);
    let myUser = user.isGoogle ? googleUser : User;
    const index = req.body.index;
    await myUser.updateOne(
      { _id: user.user._id },
      { $unset: { [`complete.${index}`]: 1 } }
    );
    await myUser.updateOne(
      { _id: user.user._id },
      { $pull: { complete: null } }
    );
    res.send("deleted");
  } catch (err) {
    res.status(400).send("not deleted");
  }
});
router.put("/deletetodo", async (req, res) => {
  try {
    const user = await getUser(req);
    let myUser = user.isGoogle ? googleUser : User;
    await myUser.updateOne(
      { _id: user.user._id },
      { $pull: { todo: req.body.todo } }
    );
    res.send("deleted");
  } catch (err) {
    res.status(400).send("not deleted");
  }
});

async function getUser(req) {
  let isGoogle = true;
  let user = await googleUser.findOne({ _id: req.session.passport.user });

  if (!user) {
    user = await req.user;
    isGoogle = false;
  }
  let obj = { user, isGoogle };

  return obj;
}

module.exports = router;
