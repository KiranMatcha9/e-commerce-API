const mongoose = require('mongoose')
const Review = require('./Review')

const productSchema = new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:[true,'Please provide the name of the product'],
        maxlength:[100,'Name cannot be more than 100 characters']
    },
    price:{
        type:Number,
        required:[true,'Please provide the price'],
        default:0
    },
    description:{
        type:String,
        required:[true,'Please provide the decsription'],
        maxlength:[1000,'Description cannot be more than 100 characters']
    },
   image:{
        type:String,
        default:'/uploads/example.jpg'
    },
    category:{
        type:String,
        required:[true,'Please provide the category'],
        enum:['office','kitchen','bedroom']
    },
    company:{
        type:String,
        required:[true,'Please provide the company name'],
        enum:{
            values:['ikea','liddy','marcos'],
            message:`{VALUE} is not supported`
        }
    },
    colors:{
        type:[String],
        required:true,
        default:['#222']
    },
    featured:{
        type:Boolean,
        default:false
    },
    freeShipping:{
        type:Boolean,
        default:false
    },
    inventory:{
        type:Number,
        required:true,
        default:15
    },
    averagerating:{
        type:Number,
        default:0
    },
    numOfReviews:{
        type:Number,
        default:0
    },
    user:{
        type:mongoose.Types.ObjectId,
        ref:'User',
        required:true
    }
},{timestamps:true,toJSON:{virtuals:true},toObject:{virtuals:true}}

)


productSchema.virtual('reviews',{
    ref:'Review',
    localField:'_id',
    foreignField:'product',
    justOne:false,
})

productSchema.pre('remove', async function() {
    await this.model('Review').deleteMany({ product:this._id })
})

module.exports = mongoose.model('Product',productSchema)