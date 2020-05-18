const jwt = require('jsonwebtoken')
const secret = 'SeCrEtKeYfOrHaShInG'
const crypto = require('crypto')


module.exports = (function () {
    const User = require('../models/user')

    // https://mongoosejs.com/docs/guide.html#id

    async function getAllUsers() {
        return await User.find()
    }

    async function getUser(username) {
        return await User.findOne({username: username}) // 없을땐 null
    }

    async function loginUser(username, password) {
        const user = await getUser(username)
        let p = null
        if (!user){
            console.log(user)
            throw 'login failed'
        }
        else {
            if (user.verify(password)) {
                p = new Promise((resolve, reject) => {
                    jwt.sign(
                        {
                            _id: user._id,
                            username: user.username,
                            password: user.password,
                            admin: user.admin
                        },
                        secret,
                        {
                            expiresIn: '7d',
                        }, (err, token) => {
                            if (err) reject(err)
                            resolve(token)
                        })
                })
            } else {
                throw 'login failed'
            }
            console.log(await p)
            return ({user: {username: username, password: password}, token: p})
        }
    }

    async function check(token) {
        // read the token from header or url
        if(!token) {
            throw 'not logged in'
        }

        // create a promise that decodes the token
        let p = new Promise(
            (resolve, reject) => {
                jwt.verify(token, secret, (err, decoded) => {
                    if(err) reject(err)
                    resolve(decoded)
                })
            }
        )
        p = await p

        // if token is valid, it will respond with its info
        return ({user: {username: p.username, password: p.password}, token: token})
    }

    async function joinUser(username, password) {
        const user = await getUser(username)
        if (user) throw 'username is existed'

        const encrypted = crypto.createHmac('sha1', secret)
            .update(password)
            .digest('base64')

        console.log(encrypted)

        const newUser = new User({username: username, password: encrypted})


        User.count({}, function (err, count) {
            if (count == 1) {
                newUser.assignAdmin()
            }
        })

        const result = await newUser.save()

        return result
    }

    return {
        getAllUsers: getAllUsers,
        getUser: getUser,
        loginUser: loginUser,
        joinUser: joinUser,
        check: check,
    }

})()
