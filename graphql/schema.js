const dao = require('../business/dao')
var {buildSchema} = require('graphql')

var schema = buildSchema(`

type User{
    username: String
    password: String
    admin: Boolean!
}

type UserWithToken{
    user: User!
    token: String!
}

input CreateUserInput{
    username: String!
    password: String!
}

type Query {
    users: [User!]!
    user(username: String!): User
    login(username: String!, password: String!): UserWithToken
    check(token: String!): UserWithToken
}

type Mutation {
    createUser(username: String!, password: String!): User
}
`)
// 맞춤 스칼라 타입 지정은 어떻게?
var resolver = {
    users: async () => {
        return await dao.um.getAllUsers()
    },
    user: async (args) => {
        const {username} = args

        return await dao.um.getUser(username)
    },
    login: async (args) => {
        const {username, password} = args

        return await dao.um.loginUser(username, password)
    },
    check: async (args) => {
        const {token} = args

        return await dao.um.check(token)
    },
    createUser: async (args) => {
        const {username, password} = args

        return await dao.um.joinUser(username, password)
    },
}

module.exports = {schema: schema, root: resolver}
