const Review = require('../models/Review')
const Product = require('../models/Product')
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors')
const {checkPermissions} = require('../utils')

const createReview = async (req,res) => {
    const userId = req.user.userId 
    const {product:productId} = req.body
    const isValidProduct = await Product.findOne({_id:productId})
    
    if(!isValidProduct){
        throw new customError.BadRequestError(`There is no prduct with Id ${productId}`)
    }

    const reviewSubmitted = await Review.findOne({product:productId,user:userId})

    if(reviewSubmitted){
        throw new customError.BadRequestError(`Already review submitted`)
    }

    req.body.user = userId
    const review = await Review.create(req.body)
    res.status(StatusCodes.OK).json({review})
}

const getAllReviews = async (req,res) => {

    const reviews = await Review.find({})
            .populate({path:'product',select:'name company price'})


    res.status(StatusCodes.OK).json({reviews,count:reviews.length})
}

const getSingleReview = async (req,res) => {

    const {id:reviewId} = req.params
    const review = await Review.findOne({_id:reviewId})
    console.log("review"+review)

    if(!review){
        console.log('In the review clause')
        throw new customError.NotFoundError(`There is no review with ID ${reviewId}`)
    }

    res.status(StatusCodes.OK).json({ review })
}

const updateReview = async (req,res) => {
    const {id:reviewId} = req.params
    const {rating,title,comment} = req.body

    const review = await Review.findOne({_id:reviewId})

    if(!review){
        throw new customError.NotFoundError(`There is no review with ID ${reviewId}`)
    }

    if(!rating || !title || !comment){
        throw new customError.BadRequestError(`Please provide rating,title,comment`)
    }

    checkPermissions(req.user,review.user)

    review.rating = rating
    review.title = title
    review.comment = comment

    await review.save()

    res.status(StatusCodes.OK).json({review})
}

const deletereview = async (req,res) => {

    const {id:reviewId} = req.params
    const review = await Review.findOne({_id:reviewId})

    if(!review){
        throw new customError.NotFoundError(`There is no review with Id ${reviewId}`)
    }

    checkPermissions(req.user,review.user)

    await review.remove()

    res.status(StatusCodes.OK).json({mgs:'Deleted Review successfully'})
}


const getSingleProductReview = async (req,res) => {
    const {id:productId} = req.params
    const review = await Review.find({product:productId})
    res.status(StatusCodes.OK).json({ review,count:review.length })
}


module.exports = { 
    createReview, getAllReviews,
    getSingleReview, updateReview,
    deletereview ,getSingleProductReview
}