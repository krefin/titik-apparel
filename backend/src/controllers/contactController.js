import * as contactService from "../services/contactService.js";

export const submitContact = async (req, res, next) => {
  try {
    const message = await contactService.createContactMessage(req.body);
    res.status(201).json({
      success: true,
      message: "Pesan berhasil dikirim. Kami akan segera menghubungi Anda.",
      data: { id: message.id },
    });
  } catch (err) {
    next(err);
  }
};
