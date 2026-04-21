import * as UserModel from "../models/UserModel.js";

export const register = async (req, res) => {
    const { 
        email, 
        password,
        firstName, 
        lastName, 
        dob, 
        course, 
        major, 
        address, 
        status 
    } = req.body; 

    try {
        const userProfile = {
            firstName, 
            lastName, 
            dob, 
            course, 
            major, 
            address, 
            status
        };

       
        const userId = await UserModel.createUser(userProfile, email, password);
        
        res.status(201).json({
            success: true, 
            message: "User registered successfully", 
            id: userId
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: err.message });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body; 

    try {
        const token = await UserModel.login(email, password);
        res.status(200).json({
            success: true, 
            message: [{ result: "Login successful" }], 
            token: token 
        });
    } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, message: err.message });
    }
}