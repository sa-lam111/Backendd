import { createUserService } from '../services/user.services.js'

export const createUser = async (req, res) => {
    try {
        const { username, email, phoneNumber } = req.body
        if (!username || !email) {
            return res.status(400).json({ success: false, message: 'username and email are required' })
        }
        const user = await createUserService({ username, email, phoneNumber })
        return res.status(201).json({ success: true, data: user })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Error creating user' })
    }
}

export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json({ success: false, message: 'User ID is required' })
        }
        
        const result = await createUserService(id)
        if (!result) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        return res.status(200).json({ success: true, message: 'User deleted successfully' })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Error deleting user' })
    }
}

export const getUser = async (req, res) => {
    try {
        const { id, email } = req.params
        if (!id && !email) {
            return res.status(400).json({ success: false, message: 'User ID or email is required' })
        }

        let user
        if (id) {
            user = await getUserService({ id })
        }
        if (email) {
            user = await getUserByEmailService(email)
        }

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' })
        }
        return res.status(200).json({ success: true, data: user })
    } catch (error) {
        return res.status(400).json({ success: false, message: error.message || 'Error fetching user' })
    }
}