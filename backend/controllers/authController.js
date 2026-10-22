import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const register = async (req, res)=>{
    try{
        const {name, email, password} = req.body

        if(!name || !email || !password){
            return res.status(400).json({message: "All fields are required"});
        }
        if(password.length < 8){
            return res.status(400).json({message: "Password must be at least 8 characters" })
        }

        const existingUser = await User.findOne({email: email.toLowerCase().trim()})

        if(existingUser){
            return res.status(409).json({message: "Email already registered"})
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = await User.create({
            name, 
            email: email.toLowerCase().trim(),
            password: hashedPassword
        })

        res.status(201).json({
            message: "Registration successful",
            user: {id: user._id, name: user.name, email: user.email}
        })
    } catch(error){
        res.status(500).json({message: "Registration failed"})
    }
}


export const login = async (req, res)=>{
    try{
        const {email, password} = req.body

        if(!email || !password){
            return res.status(400).json({message: "Email and password are required"})
        }

        const user = await User.findOne({email: email.toLowerCase().trim()})

        if(!user || !(await bcrypt.compare(password, user.password))){
            return res.status(401).json({message: "Ivalid email or password"})
        }
        console.log("User ID during login:", user._id);

        const token = jwt.sign(
            {userId: user._id},
            process.env.JWT_SECRET,
            {expiresIn: "1d"}
        )

        res.json({
            message: "Login successful",
            token,
            user: {id: user._id, name: user.name, email: user.email}
        })
    } catch(error){
        res.status(500).json({message: "Login failed"})
    }
}


export const getMe = async (req, res)=>{
    try{
        console.log("User ID from token:", req.userId);
        const user = await User.findById(req.userId).select("-password");

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }
        res.json({ user })
    } catch(error){
        res.status(500).json({message: "Failed to fetch profile"})
    }
}