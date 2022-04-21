const express = require('express')
const router = express.Router()

const {register,login,logout} = require('../controllers/authController')

router.route('/register').get(register)
router.route('/login').post(login)
router.route('/logout').post(logout)


module.exports = router

