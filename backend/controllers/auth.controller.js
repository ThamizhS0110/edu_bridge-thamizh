const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register a new user
const registerUser = async (req, res) => {
    const { 
        name, 
        email, 
        password, 
        student, 
        college, 
        degree, 
        fieldOfStudy, 
        school, 
        grade, 
        goals, 
        interests, 
        bio, 
        location 
    } = req.body;

    try {
        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ 
                message: 'User with this email already exists' 
            });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user data object
        const userData = {
            name,
            email,
            password: hashedPassword,
            student,
            bio: bio || '',
            location: location || '',
            goals: goals || [],
            interests: interests || [],
            connections: [],
            preferences: {
                notifications: {
                    email: true,
                    push: true,
                    connectionRequests: true
                },
                privacy: {
                    profileVisibility: 'public',
                    showEmail: false
                }
            }
        };

        // Add student-specific fields
        if (student === 'college') {
            userData.college = college || '';
            userData.degree = degree || '';
            userData.fieldOfStudy = fieldOfStudy || '';
        } else if (student === 'school') {
            userData.school = school || '';
            userData.grade = grade || '';
        }

        // Create user
        const user = await User.create(userData);

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                student: user.student, 
                name: user.name,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                student: user.student,
                college: user.college,
                school: user.school,
                degree: user.degree,
                fieldOfStudy: user.fieldOfStudy,
                grade: user.grade
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                id: user._id, 
                student: user.student, 
                name: user.name,
                email: user.email 
            },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                student: user.student,
                college: user.college,
                school: user.school,
                degree: user.degree,
                fieldOfStudy: user.fieldOfStudy,
                grade: user.grade
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Logout user (mostly handled on frontend)
const logoutUser = async (req, res) => {
    try {
        // In a stateless JWT system, logout is primarily handled on the frontend
        // by removing the token from localStorage
        // Here we can add any server-side cleanup if needed
        res.status(200).json({ message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ message: 'Server error during logout' });
    }
};

module.exports = { registerUser, loginUser, logoutUser };