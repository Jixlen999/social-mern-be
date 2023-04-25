import bcrypt from 'bcrypt';
import UserModel from '../Models/userModel.js';

export const getUser = async (req, res) => {
	const id = req.params.id;

	try {
		const user = await UserModel.findById(id);

		if (user) {
			const { password, ...userData } = user._doc;
			res.status(200).json(userData);
		} else {
			res.status(404).json("User doesn't exist");
		}
	} catch (error) {
		res.status(500).json({ message: error.message });
	}
};

export const updateUser = async (req, res) => {
	const id = req.params.id;
	const { currentUserId, currentUserAdminStatus, password } = req.body;

	if (id === currentUserId || currentUserAdminStatus) {
		try {
			if (password) {
				const salt = await bcrypt.genSalt(10);
				req.body.password = await bcrypt.hash(password, salt);
			}
			const user = await UserModel.findByIdAndUpdate(id, req.body, {
				new: true,
			});
			res.status(200).json(user);
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	} else {
		res.status(403).json('Access denied');
	}
};

export const deleteUser = async (req, res) => {
	const id = req.params.id;
	const { currentUserId, currentUserAdminStatus } = req.body;
	if (id === currentUserId || currentUserAdminStatus) {
		try {
			await UserModel.findByIdAndDelete(id);
			res.status(200).json('User successfully deleted');
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	} else {
		res.status(403).json('Access denied');
	}
};

export const followUser = async (req, res) => {
	const id = req.params.id;
	const { currentUserId } = req.body;
	if (currentUserId === id) {
		res.status(403).json('Action forbidden');
	} else {
		try {
			const followedUser = await UserModel.findById(id);
			const followingUser = await UserModel.findById(currentUserId);
			if (!followedUser.followers.includes(currentUserId)) {
				await followedUser.updateOne({ $push: { followers: currentUserId } });
				await followingUser.updateOne({ $push: { following: id } });
				res.status(200).json('User followed successfully');
			} else {
				res.status(403).json('User is already followed by you');
			}
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
};

export const unfollowUser = async (req, res) => {
	const id = req.params.id;
	const { currentUserId } = req.body;
	if (currentUserId === id) {
		res.status(403).json('Action forbidden');
	} else {
		try {
			const followedUser = await UserModel.findById(id);
			const followingUser = await UserModel.findById(currentUserId);
			if (followedUser.followers.includes(currentUserId)) {
				await followedUser.updateOne({ $pull: { followers: currentUserId } });
				await followingUser.updateOne({ $pull: { following: id } });
				res.status(200).json('User unfollowed successfully');
			} else {
				res.status(403).json('User is not followed by you');
			}
		} catch (error) {
			res.status(500).json({ message: error.message });
		}
	}
};
