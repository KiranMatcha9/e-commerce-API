const Product = require('../models/Product')
const Order = require('../models/Order')
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors')
const {checkPermissions} = require('../utils')


const fakeStripeAPI = async ({amount,currency}) => {
    const client_secret = "SomeRandomValue"
    return {client_secret,amount}
}
const createOrder = async (req,res) => {
    const {tax,shippingFee,items:cartItems} = req.body

    if(!cartItems || cartItems.length<0){
        throw new customError.BadRequestError('No cart items provided')
    }

    if(!shippingFee || !tax){
        throw new customError.BadRequestError('Please provide the items')
    }

    let orderItems = []
    let subtotal = 0

    for (const item of cartItems){
        const dbProduct = await Product.findOne({_id:item.product})
        if(!dbProduct){
            throw new customError.NotFoundError(`Product not found with ID ${item.product}`)
        }
        const {name,price,image,_id} = dbProduct 
        const singleOrderItem = {
            amount:item.amount,
            name,
            image,
            price,
            product:_id
        }

        // Add Item to orders
         orderItems = [...orderItems,singleOrderItem]
         console.log(orderItems);

        // calculate subtotal
        subtotal += item.amount *price
        console.log((subtotal));
        
    }

    //calculate total
    const total = tax+shippingFee+subtotal
    //Stripe

    const paymentIntent = await fakeStripeAPI({
        amount:total,
        currency:'usd'
    })

    const order = await Order.create({
        orderItems,
        total,
        subtotal,
        tax,
        shippingFee,
        clientSecret:paymentIntent.client_secret,
        user:req.user.userId
    })

    res.status(StatusCodes.CREATED).json({order,client_secret: order.client_secret})
}

const updateOrder = async (req,res) => {
    const {id:orderId} = req.params

    const {paymentIntentId} = req.body

    if(!orderId){
        throw new customError.BadRequestError('Please provide the orderId')
    }

    const order = await Order.findOne({_id:orderId})

    if(!order){
        throw new customError.NotFoundError(`There is no order with ID ${orderId}`)
    }
    checkPermissions(req.user,order.user)
    order.paymentIntentId = paymentIntentId
    order.status = 'paid'
    await order.save()

    res.status(StatusCodes.OK).json({order})
    
}

const getAllOrders = async (req,res) => {
    const orders = await Order.find({})
    res.status(StatusCodes.OK).json({ orders,count:orders.length })
}

const getSingleOrder = async (req,res) => {

    const {id:orderId} = req.params

    if(!orderId){
        throw new customError.BadRequestError('Please provide the orderId')
    }
    const order = await Order.findOne({_id:orderId})

    if(!order){
        throw new customError.NotFoundError(`There is no order with ID ${orderId}`)
    }
    checkPermissions(req.user,order.user)
    res.status(StatusCodes.OK).json({order})
}


const getCurrentUserOrders = async (req,res) => {
//     const orders = await Order.find({ user: req.user.userId });
//   res.status(StatusCodes.OK).json({ orders, count: orders.length });

    const orders = await Order.find({user:req.user.userId})

    if(!orders){
        throw new customError.NotFoundError(`There is no order for this user ${req.user.userId}`)
    }
    res.status(StatusCodes.OK).json({orders,count:orders.length})
}


module.exports = {getAllOrders,getSingleOrder,getCurrentUserOrders,createOrder,updateOrder}