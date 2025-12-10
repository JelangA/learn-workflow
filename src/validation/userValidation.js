const Joi = require('joi');

const registerSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2).optional(),
    email: Joi.string().email().optional(),
    currentPassword: Joi.string().optional(),
    newPassword: Joi.string().min(6).optional(),
}).with('newPassword', 'currentPassword');

const validateRegister = (req, res, next) => {
    const {error} = registerSchema.validate(req.body, {abortEarly: false});
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            })),
        });
    }
    next();
};

const validateLogin = (req, res, next) => {
    const {error} = loginSchema.validate(req.body, {abortEarly: false});
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            })),
        });
    }
    next();
};

const validateProfileUpdate = (req, res, next) => {
    const {error} = updateProfileSchema.validate(req.body, {
        abortEarly: false,
    });
    if (error) {
        return res.status(400).json({
            error: 'Validation Error',
            details: error.details.map((detail) => ({
                field: detail.path.join('.'),
                message: detail.message,
            })),
        });
    }
    next();
};

module.exports = {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
};
