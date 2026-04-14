import * as UserModel from "../models/UserModel.js";

export const register = async (req, res) =>{
    const {
        name,
        birthdate,
        address,
        program,
        studentStatus,
        email,
        password} = req.body;

    try{
        const userProfile = await UserModel.createUser(name, birthdate, address, program, studentStatus);
        const user = await UserModel.createUser(userProfile, email, password);
        res.status(201).json({success: true, message: user});
    }catch(err){
        console.log(err);
        res.status(400).json({success: false, message: err});
    }
}

export const login = async (req, res) =>{
    const {email, password} = req.body;

    try{
        const token = await UserModel.login(email, password);
        res.status(200).json({
            success: true,
            message: [
                {result: "Login Successful"}
            ],
            token: token
        });
    }catch(err){
        console.log(err);
        res.status(400).json({success: false, message: err});
    }
}
