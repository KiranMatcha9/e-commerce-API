const express = require('express')
const router = express.Router()
const {authenticateUser,authorizePermissions}= require('../middleware/authentication')
const {
    createProduct,getAllProducts,
    getSingleProduct,updateproduct,
    deleteProduct,uploadImage } = require('../controllers/productController')

const {getSingleProductReview} = require('../controllers/reviewController')

router.route('/')
    .post([authenticateUser,authorizePermissions('admin')],createProduct)
    .get(getAllProducts)

router.route('/uploadImage')
    .post([authenticateUser,authorizePermissions('admin')],uploadImage)

router.route('/:id')
    .get(getSingleProduct)
    .patch([authenticateUser,authorizePermissions('admin')],updateproduct)
    .delete([authenticateUser,authorizePermissions('admin')],deleteProduct)

router.route('/:id/reviews').get(getSingleProductReview)

module.exports = router