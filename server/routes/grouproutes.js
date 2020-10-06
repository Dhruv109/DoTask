const router = require("express").Router();
const Group = require("../models/groupUser");
const User = require("../models/user");
const googleUser = require("../models/googleUser");

//Making a group
router.post("/makegroup", async (req, res) => {
  const mems = req.body.members;
  const myuser = await getUser(req);
  mems.push(myuser.user.email);
  try {
    const newGroup = new Group({
      name: req.body.name,
      members: req.body.members,
    });
    const savedGroup = await newGroup.save();
    const id = savedGroup._id;
    req.body.members.forEach(async (member) => {
      await User.updateOne({ email: member }, { $push: { groups: id } });
      await googleUser.updateOne({ email: member }, { $push: { groups: id } });
    });
    console.log("made new group");
    res.send("made new group");
  } catch (error) {
    console.log(error);
  }
});

router.get(`/getmembername/:id`, async (req, res) => {
  try {
    let member = await User.findOne({ email: req.params.id });
    if (!member) member = await googleUser.findOne({ email: req.params.id });
    if (member) res.send(member.name);
  } catch (error) {
    console.log(error);
  }
});

router.get("/getgroups", async (req, res) => {
  const myuser = await getUser(req);
  const groups = myuser.user.groups;
  res.send(groups);
});
router.get("/groupname/:id", async (req, res) => {
  try {
    if (req.params.id) {
      let mygroup = await Group.findById(req.params.id);
      res.send(mygroup.name);
    }
  } catch (error) {
    console.log(error);
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
