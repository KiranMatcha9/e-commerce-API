const mongoose = require('mongoose')

const reviewSchema = mongoose.Schema({
    rating:{
        type:Number,
        min:1,
        max:5,
        required:[true,'Please provide rating']
    },
    title:{
        type:String,
        trim:true,
        required:[true,'Please provide review title'],
        maxlength:100
    },
    comment:{
        type:String,
        required:[true,'Please provide the review comment']
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User'
    },
    product:{
        type:mongoose.Types.ObjectId,
        ref:'Product'
    }
},
    {timestamps:true}
)

reviewSchema.index({product:1,user:1},{unique:true})

reviewSchema.statics.calculateAverageRating = async function(productId) {

    const result = await this.aggregate([
        { $match:{product:productId} },
        { $group:{
            _id:null,
            averageRating:{$avg:'$rating'},
            numOfReviews:{$sum:1}
        }}
    ])
    console.log(result)
    try {
        await this.model('Product').findOneAndUpdate({_id:productId},{averagerating: result[0]?.averageRating || 0, numOfReviews: result[0]?.numOfReviews || 0 })
    } catch (error) {
        console.log(error)
    }
}


reviewSchema.post('save', async function(){ 
    await this.constructor.calculateAverageRating(this.product)
})

reviewSchema.post('remove', async function(){
    await this.constructor.calculateAverageRating(this.product)
})

module.exports = mongoose.model('Review',reviewSchema)