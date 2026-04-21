import pool from '../models/db.js';
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const getUser = async (id) => {
    const userId = Number(id);
    if (Number.isNaN(userId)) {
        throw new Error('Invalid id');
    }
    const [rows] = await pool.query('SELECT * FROM tbluser WHERE id = ?', [userId]);
    return rows[0] ?? null;
}

export const createUser = async (userProfile, email, password) => {
    if (!email || email.trim() === '') {
        throw new Error('Invalid email');
    }

    if (!validator.isEmail(email)) {
        throw new Error('Invalid email format');
    }

    const [rows] = await pool.query(
        "SELECT * FROM tbluser WHERE email = ?",
        [email]
    );

    if (rows.length > 0) {
        const error = new Error(`The email ${email} is already in use.`);
        error.statusCode = 400;
        throw error;
    }

    if (!password || password === '') {
        throw new Error('Invalid password');
    }

    if (!validator.isStrongPassword(password)) {
        throw new Error('Password too weak.');
    }

    const salt = bcrypt.genSaltSync(10);
    const newPassword = bcrypt.hashSync(password, salt);

    
    const transformedProfile = {
        name: userProfile.firstName + ' ' + userProfile.lastName,
        birthdate: userProfile.dob,
        program: userProfile.course + ' ' + userProfile.major,
        address: userProfile.address,
        studentStatus: userProfile.status
    };

    try {
        await fetch('https://ais-simulated-legacy.onrender.com/api/students', {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transformedProfile)
        });
    } catch (fetchError) {
        console.log("AIS Fetch Warning:", fetchError.message);
    }

    const [result] = await pool.query(
        "INSERT INTO tbluser(email, password) VALUES(?, ?)",
        [email, newPassword]
    );

    return result.insertId;
}

export const login = async (email, password) => {
    if (!email || !password) {
        throw new Error('Email and Password is required');
    }

    const [user] = await pool.query("SELECT * FROM tbluser WHERE email = ?", [email]);
    if (user.length === 0) {
        throw new Error(`An Account with email: ${email} does not exist.`);
    }

    if (!bcrypt.compareSync(password, user[0].password)) {
        throw new Error('Incorrect password');
    }

    const token = jwt.sign({ id: user[0].id }, process.env.SECRET, { expiresIn: '1d' });
    return token;
}