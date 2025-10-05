import * as cartService from "../services/cartService.js";

export const getCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const cart = await cartService.getUserCart(userId);
    res.json({ success: true, data: cart });
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { productId, quantity } = req.body;
    const item = await cartService.addToCart(userId, productId, quantity);
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    const item = await cartService.updateCartItem(Number(itemId), quantity);
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    await cartService.removeCartItem(Number(itemId));
    res.json({ success: true, message: "Item removed from cart" });
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await cartService.clearCart(userId);
    res.json({ success: true, message: "Cart cleared" });
  } catch (err) {
    next(err);
  }
};
