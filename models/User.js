const mongoose = require("mongoose")
const validator = require('validator')
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,'provide the name'],
        minlength:3,
        maxlength:50
    },
    email:{
        type:String,
        required:[true,'provide the email'],
        validate:{
            validator: validator.isEmail,
            message:'provide valid email'
        }
    },
    password:{
        type:String,
        required:[true,'provide the password']
    },
    role:{
        type:String,
        enum: ['admin','user'],
        default:'user'
    }
})

userSchema.pre('save',async function (){
    console.log(this.modifiedPaths())

    if(!this.isModified('password')) return
    
    const genSalt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,genSalt)
} )

userSchema.methods.comparePassword = async function (candidatePassword) {
   const isMatch =  await bcrypt.compare(candidatePassword,this.password)
   return isMatch
} 
module.exports = mongoose.model("User",userSchema)