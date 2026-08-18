// src/middlewares/validate.js
import { ZodError } from "zod";

const formatError = (err) => {
  if (err instanceof ZodError) {
    const issues = err.issues ?? err.errors ?? [];
    return issues.map((e) => ({
      field: e.path?.join(".") || e.path || "",
      message: e.message,
    }));
  }
  return [{ message: err.message || "Invalid data" }];
};

export const validate =
  (schema, source = "body") =>
  (req, res, next) => {
    try {
      req[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      return res
        .status(400)
        .json({ success: false, message: "Validation failed", errors: formatError(err) });
    }
  };

export const validateQuery = (schema) => validate(schema, "query");
