const axios = require('axios');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

class AuthController {
    // Register new user
    async register(req, res) {
        console.log('Register attempt for email:', req.body.email);
        try {
            const {email, password, name} = req.body;

            // Check if user already exists
            const checkResponse = await axios.get(
                `${process.env.FIREBASE_URL}/user.json`
            );

            const users = checkResponse.data || {};

            const existingUser = Object.values(users).find(
                (user) => user.email === email
            );
            if (existingUser) {
                return res.status(400).json({
                    error: 'Registration Failed',
                    message: 'Email already registered',
                });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user in Firebase
            const newUser = {
                email,
                name,
                password: hashedPassword,
                createdAt: new Date().toISOString(),
            };

            const response = await axios.post(
                `${process.env.FIREBASE_URL}/user.json`,
                newUser
            );

            // Generate token
            const token = jwt.sign(
                {userId: response.data.name, email},
                process.env.JWT_SECRET,
                {expiresIn: '24h'}
            );
            console.log('User registered with ID:', response.data.name);

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: response.data.name,
                    email,
                    name,
                },
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Login user
    async login(req, res) {
        try {
            const {email, password} = req.body;
            console.log('Login attempt for email:', email);

            // Find user
            const response = await axios.get(`${process.env.FIREBASE_URL}/user.json`);
            if (!response.data) {
                console.log('No users found in database');
                return res.status(401).json({
                    error: 'Authentication Failed',
                    message: 'Invalid email or password',
                });
            }

            const users = response.data;
            console.log('Found users in database');

            const userEntry = Object.entries(users).find(
                ([_, user]) => user.email === email
            );

            if (!userEntry) {
                console.log('User not found with email:', email);
                return res.status(401).json({
                    error: 'Authentication Failed',
                    message: 'Invalid email or password',
                });
            }

            const [userId, user] = userEntry;
            console.log('Found user:', userId);

            // For non-hashed passwords in the database
            if (!user.password.startsWith('$2')) {
                // Direct password comparison for non-hashed passwords
                if (password !== user.password) {
                    console.log('Invalid password for user:', email);
                    return res.status(401).json({
                        error: 'Authentication Failed',
                        message: 'Invalid email or password',
                    });
                }
            } else {
                // For hashed passwords, use bcrypt
                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) {
                    console.log('Invalid password for user:', email);
                    return res.status(401).json({
                        error: 'Authentication Failed',
                        message: 'Invalid email or password',
                    });
                }
            }

            // Generate token
            const token = jwt.sign(
                {userId, email: user.email},
                process.env.JWT_SECRET,
                {expiresIn: '24h'}
            );

            console.log('Login successful for user:', email);
            res.status(200).json({
                message: 'Login successful',
                token,
                user: {
                    id: userId,
                    email: user.email,
                    name: user.name,
                },
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Get user profile
    async getProfile(req, res) {
        try {
            const {userId} = req.user;
            const response = await axios.get(
                `${process.env.FIREBASE_URL}/user/${userId}.json`
            );

            if (!response.data) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found',
                });
            }

            const {password: _password, ...userWithoutPassword} = response.data;

            res.status(200).json({
                id: userId,
                ...userWithoutPassword,
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }

    // Update user profile
    async updateProfile(req, res) {
        try {
            const {userId} = req.user;
            const {name, email, currentPassword, newPassword} = req.body;

            // Get current user data
            const currentUserResponse = await axios.get(
                `${process.env.FIREBASE_URL}/user/${userId}.json`
            );

            if (!currentUserResponse.data) {
                return res.status(404).json({
                    error: 'Not Found',
                    message: 'User not found',
                });
            }

            const updateData = {...currentUserResponse.data};

            // If updating email, check if new email is already taken
            if (email && email !== updateData.email) {
                const checkResponse = await axios.get(
                    `${process.env.FIREBASE_URL}/user.json`
                );
                const users = checkResponse.data || {};
                const emailExists = Object.values(users).some(
                    (user) => user.email === email
                );

                if (emailExists) {
                    return res.status(400).json({
                        error: 'Update Failed',
                        message: 'Email already in use',
                    });
                }
                updateData.email = email;
            }

            // Update name if provided
            if (name) {
                updateData.name = name;
            }

            // Handle password update if provided
            if (currentPassword && newPassword) {
                const isValidPassword = await bcrypt.compare(
                    currentPassword,
                    updateData.password
                );
                if (!isValidPassword) {
                    return res.status(401).json({
                        error: 'Update Failed',
                        message: 'Current password is incorrect',
                    });
                }

                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(newPassword, salt);
            }

            // Update user in Firebase
            await axios.put(
                `${process.env.FIREBASE_URL}/user/${userId}.json`,
                updateData
            );

            const {password: _password, ...userWithoutPassword} = updateData;

            res.status(200).json({
                message: 'Profile updated successfully',
                user: {
                    id: userId,
                    ...userWithoutPassword,
                },
            });
        } catch (error) {
            res.status(500).json({
                error: 'Internal Server Error',
                message: error.message,
            });
        }
    }
}

module.exports = new AuthController();
