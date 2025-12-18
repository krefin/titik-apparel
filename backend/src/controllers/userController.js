import * as userServices from "../services/userServices.js";

export const getUserById = async (req, res, next) => {
  try {
    const user = await userServices.getUserById(req.params.id);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
};

export const updateUserById = async (req, res, next) => {
  try {
    const userId = req.params.id === "me" ? req.user.id : req.params.id;
    const updatedUser = await userServices.updateUserById(userId, req.body);
    res.json({ success: true, data: updatedUser });
  } catch (err) {
    next(err);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await userServices.getAllUsers();
    res.json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};
