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
        // Validate required fields
        if (!name || !email || !password || !student) {
            console.log('Registration failed - Missing fields:', { name: !!name, email: !!email, password: !!password, student: !!student });
            return res.status(400).json({ 
                message: 'Missing required fields: name, email, password, and student type are required' 
            });
        }

        // Validate student type
        if (!['school', 'college'].includes(student)) {
            console.log('Registration failed - Invalid student type:', student);
            return res.status(400).json({ 
                message: 'Student type must be either "school" or "college"' 
            });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email: email.toLowerCase() });

        if (userExists) {
            console.log('Registration failed - Email already exists:', email);
            return res.status(400).json({ 
                message: 'Email already exists' 
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
        console.log('User created successfully:', { id: user._id, email: user.email, name: user.name, student: user.student });

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
            message: 'User created successfully',
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
        
        // Handle specific MongoDB errors
        if (error.code === 11000) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const validationErrors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ 
                message: 'Validation failed', 
                errors: validationErrors 
            });
        }
        
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Validate required fields
        if (!email || !password) {
            console.log('Login failed - Missing fields:', { email: !!email, password: !!password });
            return res.status(400).json({ 
                message: 'Missing fields: email and password are required' 
            });
        }

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            console.log('Login failed - User not found:', email);
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed - Invalid password for user:', email);
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

        console.log('Login successful for user:', { id: user._id, email: user.email, name: user.name });
        
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