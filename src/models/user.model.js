import mongoose, { Schema, model } from 'mongoose'

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
       
    },
    email: {
        type: String,
        required: true,
        unique: true,
        
    },
    phoneNumber: {
        type: String,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        enum: ['admin']
    },

    cart: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product'
            },
            quantity: {
                type: Number,
                default: 1
            }
        }
    ]
})

const User = model('User', userSchema)

export default User

