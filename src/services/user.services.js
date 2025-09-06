import User from '../models/user.model.js'
export const createUserService = async ({ username, email, phoneNumber }) => {
    const created = await User.create({ username, email, phoneNumber })
    return { username: created.username, email: created.email }
}

