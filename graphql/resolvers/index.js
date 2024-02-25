import userResolvers from "./users.js";
import glucoseReadingResolvers from "./glucoseReading.js";
import foodResolvers from "./food.js";

export default {
  Query: {
    ...userResolvers.Query,
    ...glucoseReadingResolvers.Query,
    ...foodResolvers.Query,
  },
  Mutation: {
    ...userResolvers.Mutation,
    ...glucoseReadingResolvers.Mutation,
    ...foodResolvers.Mutation,
  },
};
