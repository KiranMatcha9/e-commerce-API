const {StatusCodes} = require('http-status-codes')
const User = require('../models/User')
const customError = require('../errors/index')
const {createTokenUser,attachCookiesToResponse} = require('../utils')


const register = async (req,res) => {
    const {email,name,password}  = req.body

    const emailAlreadyExists = await User.findOne({email})
    if(emailAlreadyExists){
        throw new customError.BadRequestError('Email already exist')
    }

    const isFirstUser = await User.countDocuments({})
    role = isFirstUser ? 'user': 'admin' 

    const user = await User.create({name,email,password,role})
    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    res.status(StatusCodes.CREATED).json( { user:tokenUser} )
}

const login = async (req,res) => {

    const {email,password} = req.body

    if(!email || !password){
        throw new customError.BadRequestError('Please provide email and password')
    }

    const user = await User.findOne({email})

    if(!user){
        throw new customError.UnauthenticatedError('Invalid Credentials')
    }

    const isMatch = await user.comparePassword(password)
     
    if(!isMatch){
        throw new customError.UnauthenticatedError('Invalid Credentials')
    }

    const tokenUser = createTokenUser(user)
    attachCookiesToResponse({res,user:tokenUser})
    res.status(StatusCodes.OK).json({user:tokenUser})
}

const logout = async (req,res) => {

    res.cookie('token','logout',
    {httpOnly:true,
    expires:new Date(Date.now()+ 5*1000)})
    res.status(StatusCodes.OK).json({msg:'User logged out'})
}

module.exports = {register,login,logout}