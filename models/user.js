import mongoose from "mongoose";
mongoose.connect('mongodb://localhost:27017/authapp')

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    age:Number
});

export const User = mongoose.model("User", userSchema);
