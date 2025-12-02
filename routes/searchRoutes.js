const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");

router.get("/search", searchController.search);

router.post("/recent-search", searchController.addRecentSearch);

router.get("/recent-searches/:user_id", searchController.getRecentSearches);

router.get("/popular-searches", searchController.getPopularSearches);

module.exports = router;
