
const express = require('express')
const router = express.Router()

const {authenticateUser} = require('../middleware/authentication')

const { 
    createReview, getAllReviews,
    getSingleReview, updateReview,
    deletereview
}  = require('../controllers/reviewController')


router.route('/')
        .get(getAllReviews)
        .post(authenticateUser,createReview)
router.route('/:id')
        .get(getSingleReview)
        .patch(authenticateUser,updateReview)
        .delete(authenticateUser,deletereview)

module.exports = router