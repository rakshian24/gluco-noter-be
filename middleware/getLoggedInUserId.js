import { AuthenticationError } from "apollo-server-errors";
import jwt from "jsonwebtoken";

const getLoggedInUserId = (context) => {
  const token = context.req.headers.authorization;

  if (token) {
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET);
      return user;
    } catch (error) {
      throw new AuthenticationError("Invalid/Expired token.");
    }
  }
  throw new AuthenticationError(
    "Authentication token is missing in the header."
  );
};

export default getLoggedInUserId;
