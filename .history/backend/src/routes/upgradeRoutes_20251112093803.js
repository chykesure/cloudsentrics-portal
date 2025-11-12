//src/routes/ upgradeRoutes.js
const express = require("express");
const router = express.Router();

const { getUserUpgradeStatus, requestUpgrade, getAllUpgrades, approveUpgrade, denyUpgrade, getUpgradeByEmail, getRequestByEmail } = require("../controllers/upgradeController");

router.get("/status/:email", getUserUpgradeStatus);
router.post("/request", requestUpgrade);
router.get("/all", getAllUpgrades);
router.post("/:id/approve", approveUpgrade);
router.post("/:id/deny", denyUpgrade);
router.get("/by-email/:email", getUpgradeByEmail);
router.get("/request/by-email/:email", getRequestByEmail);



module.exports = router;
