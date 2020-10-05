const router = require("express").Router();
const Group = require("./groupUser");
const googleUser = require("./googleUser");

router.get("/getname/:id", async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id });
    res.send(group.name);
  } catch (err) {
    console.log(err);
  }
});

router.put("/addtodo/:id", async (req, res) => {
  console.log("adding!");
  try {
    const user = await getUser(req);

    await Group.updateOne(
      { _id: req.params.id },
      { $push: { todo: req.body.todo } }
    );
    console.log("added");
    res.send("updated");
  } catch (err) {
    res.send(err);
  }
});
router.put("/addcomplete/:id", async (req, res) => {
  try {
    await Group.updateOne(
      { _id: req.params.id },
      { $push: { complete: req.body.complete } }
    );
    res.send("added complete");
  } catch (err) {
    res.status(400).send(err);
  }
});

router.get("/gettodo/:id", async (req, res) => {
  //console.log(req.params.id);
  try {
    const { todo } = await Group.findOne({ _id: req.params.id });
    // console.log(todo);
    res.send(todo);
  } catch (err) {
    res.send(err);
  }
});
router.put("/updatecomplete/:id", async (req, res) => {
  try {
    const index = req.body.index;
    await Group.updateOne(
      { _id: req.params.id },
      { $set: { [`complete.${index}`]: req.body.complete } }
    );
    res.send("updated c");
  } catch (err) {
    res.status(400).send(err);
  }
});
router.get("/getcomplete/:id", async (req, res) => {
  //console.log(req.params.id);
  try {
    const { complete } = await Group.findOne({ _id: req.params.id });
    // console.log(todo);
    res.send(complete);
  } catch (err) {
    res.send(err);
  }
});
router.put("/deletecomplete/:id", async (req, res) => {
  try {
    const index = req.body.index;
    await Group.updateOne(
      { _id: req.params.id },
      { $unset: { [`complete.${index}`]: 1 } }
    );
    await Group.updateOne(
      { _id: req.params.id },
      { $pull: { complete: null } }
    );
    res.send("deleted");
  } catch (err) {
    res.status(400).send("not deleted");
  }
});

router.put("/addwhosetodo/:id", async (req, res) => {
  console.log("adding name");
  try {
    const user = await getUser(req);
    await Group.updateOne(
      { _id: req.params.id },
      { $push: { todoNames: user.user.name } }
    );
  } catch (error) {
    console.log(error);
  }
});
router.get("/whosetodo/:id", async (req, res) => {
  try {
    const { todoNames } = await Group.findOne({ _id: req.params.id });
    res.send(todoNames);
  } catch (err) {
    console.log(err);
  }
});

router.put("/deletewhosetodo/:id", async (req, res) => {
  try {
    const index = req.body.index;
    await Group.updateOne(
      { _id: req.params.id },
      { $unset: { [`todoNames.${index}`]: 1 } }
    );
    await Group.updateOne(
      { _id: req.params.id },
      { $pull: { todoNames: null } }
    );
    res.send("deleted");
  } catch (err) {
    res.status(400).send("not deleted");
  }
});

router.put("/deletetodo/:id", async (req, res) => {
  try {
    console.log("deleting");
    await Group.updateOne(
      { _id: req.params.id },
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
