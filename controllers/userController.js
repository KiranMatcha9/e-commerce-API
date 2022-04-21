const User = require('../models/User')
const {StatusCodes} = require('http-status-codes')
const customError = require('../errors')
const {createTokenUser,attachCookiesToResponse,checkPermissions} = require('../utils')


const getAllUsers = async (req,res) => {
    const users = await User.find({role:'user'}).select('-password')
    console.log(req.user)
    res.status(StatusCodes.OK).json({ users})
}

const getSingleUser = async (req,res) => {
    const user = await User.findOne({_id:req.params.id}).select('-password')
    if(!user){
        throw new customError.NotFoundError(`There is no such user with id ${req.params.id}`)
    }
    checkPermissions(req.user,user._id)
    res.status(StatusCodes.OK).json({ user})
}

const showCurrentUser = async(req,res) => {
    res.status(StatusCodes.OK).json({user:req.user})
}

const updateUser = async (req,res) => {
    const {name,email} = req.body
    if(!name || !email) {
        throw new customError.BadRequestError('provide name and email')
    }
    const user = await User.findOne({_id:req.user.userId})

    user.email = email
    user.name = name

    await user.save()

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    res.status(StatusCodes.OK).json({user:tokenUser})
} 

const updateUserPassword = async (req,res) => {

    const {oldPassword,newPassword} = req.body

    if(!oldPassword || !newPassword ){
        throw new customError.BadRequestError('Please provide the old and new password')
    }
    
    const user = await User.findOne({_id:req.user.userId})

    const isPasswordCorrect =  await user.comparePassword(oldPassword)

    if(!isPasswordCorrect){
        throw new customError.UnauthenticatedError('Inavlid credentials')
    }

    user.password = newPassword
    await user.save()
    res.status(StatusCodes.OK).json({msg:'Success! password updated'})
}


module.exports = {getAllUsers,getSingleUser,showCurrentUser,updateUser,updateUserPassword}


// update user using findOneAndUpdate

// const updateUser = async (req,res) => {
//     const {name,email} = req.body
//     if(!name || !email){
//         throw new customError.BadRequestError('provide name and email')
//     }
//     const user = await User.findOneAndUpdate(
//         {_id:req.user.userId},
//         {name,email},
//         {new:true,runValidators:true})
//     const tokenUser = createTokenUser(user)
//     attachCookiesToResponse({res,user:tokenUser})
//     res.status(StatusCodes.OK).json({user:tokenUser})
// } 