const express = require("express");
const router = express.Router();

const searchController = require("../controllers/searchController");

// SEARCH 2.0
router.get("/search", searchController.search);

// Recent search add
router.post("/recent-search", searchController.addRecentSearch);

// Recent searches
router.get("/recent-searches/:user_id", searchController.getRecentSearches);

// Popular searches
router.get("/popular-searches", searchController.getPopularSearches);

module.exports = router;
