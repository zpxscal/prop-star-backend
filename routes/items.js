const express = require("express");

const {
  checkAuthenticated,
  checkNotAuthenticated,
} = require("../services/authcheck");
const { Item, ItemType } = require("../models/shemas");

const router = express.Router();

router.get("/own", checkAuthenticated, async (req, res) => {
  let items = await Item.find({ seller: req.user._id });

  res.send(items);
});

router.get("/near", async (req, res) => {
  if (!req.query.lat || !req.query.lng)
    return res.status(400).send({ where: "location", error: "missing" });

  const { lat, lng } = req.query;

  let items = await Item.find({
    "location.lat": {
      $gte: lat - 0.5,
      $lte: lat + 0.5,
    },
    "location.lng": {
      $gte: lng - 0.5,
      $lte: lng + 0.5,
    },
  })
    .populate("seller")
    .lean();

  items = items.map((e) => ({ ...e, "seller.password": "hidden" }));

  res.send(items);
});

router.post("/create", checkAuthenticated, async (req, res) => {
  const { tumbnail, title, description, type, location } = req.body;

  let error = [];
  error.push(new TypeCheck(tumbnail, "link").isLink());
  error.push(new TypeCheck(title, "title").isTitle());
  error.push(new TypeCheck(description, "description").isTitle());
  error.push(new TypeCheck(location, "location").isLocation());

  if (!Object.values(ItemType).includes(type))
    error.push({ where: "eventtype", error: "invalid" });

  error = error.filter((e) => e != null);

  if (error.length) return res.status(400).send(error);

  await Event.create({
    images: [{ data: tumbnail, tumbnail: true }],
    title,
    description,
    type,
    location: {
      lat: location.lat,
      lng: location.lng,
      place_id: location.place_id,
    },
    seller: req.user._id,
  });

  res.status(201).send();
});

router.put("/sold/:id", checkAuthenticated, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send();

  if (!(await Item.exists({ _id: req.params.id, seller: req.user._id })))
    return res.status(403).send();

  await Item.findByIdeAndUpdate(req.params.id, {
    soldAt: new Date(),
  });

  res.status(200).send();
});

router.get("/types", (req, res) => {
  res.send(Object.values(ItemType));
});

router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send();

  const item = await Item.findbyId(req.params.id).populate("seller").lean();

  if (!item) return res.status(404).send();

  item.seller.password = "hidden";

  res.send(item);
});

module.exports = router;
