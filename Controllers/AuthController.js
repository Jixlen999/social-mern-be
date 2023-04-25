import bcrypt from 'bcrypt';
import UserModel from '../Models/userModel.js';

export const registerUser = async (req, res) => {
	const { userName, password, firstName, lastName } = req.body;

	const salt = await bcrypt.genSalt(10);
	const hashedPassword = await bcrypt.hash(password, salt);

	const newUser = new UserModel({
		userName,
		password: hashedPassword,
		firstName,
		lastName,
	});

	try {
		await newUser.save();
		res.status(200).json(newUser);
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
