import { ApolloError } from "apollo-server-errors";
import getLoggedInUserId from "../../middleware/getLoggedInUserId.js";
import Food from "../../models/Food.js";

export default {
  Mutation: {
    async createFood(_, { foodInput: { value, label } }, ctx) {
      const loggedInUserId = getLoggedInUserId(ctx);
      const userId = loggedInUserId?.userId;

      if (!userId) {
        throw new ApolloError("User does not exist!");
      }

      const newFood = new Food({
        value,
        label,
      });

      const res = await newFood.save();
      return res;
    },
  },
  Query: {
    async getAllFoods(_, args, ctx) {
      const loggedInUserId = getLoggedInUserId(ctx);
      const userId = loggedInUserId?.userId;

      if (!userId) {
        throw new ApolloError("User does not exist!");
      }

      const allFoods = await Food.find();
      return allFoods;
    },
  },
};
