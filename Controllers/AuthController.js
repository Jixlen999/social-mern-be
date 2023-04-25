/* eslint-disable consistent-return */
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../Models/userModel.js';

export const registerUser = async (req, res) => {
	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(req.body.password, salt);

	req.body.password = hashedPassword;
	const newUser = new UserModel(req.body);
	const { userName } = req.body;

	try {
		const oldUser = await UserModel.findOne({ userName });
		if (oldUser) {
			return res.status(400).json('The user name is already registered!');
		}
		const user = await newUser.save();
		const token = jwt.sign(
			{
				userName: user.userName,
				id: user._id,
			},
			process.env.JWT_KEY,
			{ expiresIn: '1h' }
		);
		res.status(200).json({ user, token });
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};

export const loginUser = async (req, res) => {
	const { userName, password } = req.body;

	try {
		const user = await UserModel.findOne({ userName });

		if (user) {
			const validity = await bcrypt.compare(password, user.password);

			if (validity) {
				res.status(200).json(user);
			} else {
				res.status(401).send('Invalid login or password');
			}
		} else {
			res.status(401).send('Invalid login or password');
		}
	} catch (error) {
		res.status(500).json({
			message: error.message,
		});
	}
};
