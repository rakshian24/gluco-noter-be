import { ApolloError } from "apollo-server-errors";
import User from "../../models/User.js";
import getLoggedInUserId from "../../middleware/getLoggedInUserId.js";
import GlucoseReading from "../../models/glucoseReadingModel.js";
import Food from "../../models/Food.js";
import moment from "moment";
import { subtractISOTime } from "../../utils/index.js";

export default {
  Mutation: {
    async createGlucoseReading(_, args, ctx) {
      const {
        type,
        reading,
        description,
        isMedsTaken,
        isExercised,
        consumedFoods,
        insulinUnits,
        createdAt,
        updatedAt,
      } = args;
      const parsedConsumedFoodIds = JSON.parse(consumedFoods);
      const loggedInUserId = getLoggedInUserId(ctx);
      const userId = loggedInUserId?.userId;

      if (!userId) {
        throw new ApolloError(
          "Cannot create reading for this user as this user does not exist!"
        );
      }

      const newReading = new GlucoseReading({
        type,
        reading,
        description,
        isExercised,
        isMedsTaken,
        consumedFoods: parsedConsumedFoodIds,
        user: userId,
        insulinUnits,
        createdAt,
        updatedAt,
      });

      const res = await newReading.save();

      const user = await User.findById(userId);

      const foods = await Food.find({
        _id: {
          $in: [...newReading.consumedFoods],
        },
      });

      const response = {
        ...res._doc,
        ...{ user },
        ...{ consumedFoods: foods },
      };
      return response;
    },
  },
  Query: {
    async getAllReadingsGroupedByDate(_, args, ctx) {
      const loggedInUserId = getLoggedInUserId(ctx);
      const userId = loggedInUserId?.userId;

      if (!userId) {
        throw new ApolloError(
          "Cannot get the reading for this user as this user does not exist!"
        );
      }

      const user = await User.findById(userId);

      const readings = await GlucoseReading.aggregate([
        {
          $match: {
            user: user._doc._id,
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "consumedFoods",
            foreignField: "_id",
            as: "consumedFoods",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$createdAt",
              },
            },
            results: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);

      return readings;
    },

    async getAllReadingForDate(_, { date }, ctx) {
      const loggedInUserId = getLoggedInUserId(ctx);
      const userId = loggedInUserId?.userId;

      if (!userId) {
        throw new ApolloError(
          "Cannot get the reading for this user as this user does not exist!"
        );
      }

      const startDate = moment(date, "DD-MM-YYYY").startOf("day").toDate();
      const endDate = moment(date, "DD-MM-YYYY").endOf("day").toDate();

      const user = await User.findById(userId);

      const readings = await GlucoseReading.find({
        user: user._doc._id,
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      })
        .populate("consumedFoods")
        .populate("user");

      return readings;
    },

    async getReadingsReport(_, args, ctx) {
      const loggedInUserId = getLoggedInUserId(ctx);
      const userId = loggedInUserId?.userId;

      if (!userId) {
        throw new ApolloError(
          "Cannot get the reading for this user as this user does not exist!"
        );
      }

      const user = await User.findById(userId);

      const readings = await GlucoseReading.aggregate([
        {
          $match: {
            user: user._doc._id,
          },
        },
        {
          $lookup: {
            from: "foods",
            localField: "consumedFoods",
            foreignField: "_id",
            as: "consumedFoods",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "user",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%d-%m-%Y",
                date: "$createdAt",
              },
            },
            results: {
              $push: "$$ROOT",
            },
          },
        },
        {
          $sort: { _id: -1 },
        },
      ]);

      const transformedData = readings.map((group) => {
        const timeFormat = "h:mm A";
        const date = group._id.split("-").reverse().join("-");
        const readings = {
          date: date,
          bb: null,
          breakfast: null,
          ab: null,
          bl: null,
          lunch: null,
          al: null,
          bd: null,
          dinner: null,
          ad: null,
          morningInsulinUnits: null,
          afternoonInsulinUnits: null,
          eveningInsulinUnits: null,
          nightInsulinUnits: null,
        };

        const time = {
          date: "time",
          bb: null,
          breakfast: null,
          ab: null,
          bl: null,
          lunch: null,
          al: null,
          bd: null,
          dinner: null,
          ad: null,
          morningInsulinUnits: null,
          afternoonInsulinUnits: null,
          eveningInsulinUnits: null,
          nightInsulinUnits: null,
        };

        group.results.forEach((result) => {
          const type = result.type.toLowerCase();
          readings[type] = result.reading;

          if (type === "bb") {
            readings["morningInsulinUnits"] = result.insulinUnits;
            time["bb"] = result.createdAt;
            time["morningInsulinUnits"] = result.createdAt;
          } else if (type === "ab") {
            const timeString = result.createdAt;
            readings["breakfast"] = result.consumedFoods
              .map((food) => food.label)
              .join(", ");
            time["ab"] = timeString;
            time["breakfast"] = subtractISOTime(timeString, 1);
          } else if (type === "bl") {
            readings["afternoonInsulinUnits"] = result.insulinUnits;
            time["bl"] = result.createdAt;
            time["afternoonInsulinUnits"] = result.createdAt;
          } else if (type === "al") {
            const timeString = result.createdAt;
            readings["lunch"] = result.consumedFoods
              .map((food) => food.label)
              .join(", ");
            time["al"] = timeString;
            time["lunch"] = subtractISOTime(timeString, 1);
          } else if (type === "bd") {
            const timeString = result.createdAt;
            readings["eveningInsulinUnits"] = result.insulinUnits;
            time["bd"] = timeString;
            time["eveningInsulinUnits"] = timeString;
          } else if (type === "ad") {
            const timeString = result.createdAt;
            readings["dinner"] = result.consumedFoods
              .map((food) => food.label)
              .join(", ");
            readings["nightInsulinUnits"] = result.insulinUnits;
            time["ad"] = timeString;
            time["nightInsulinUnits"] = timeString;
            time["dinner"] = subtractISOTime(timeString, 1);
          }
        });

        return {
          [date]: {
            reading: readings,
            time: time,
          },
        };
      });

      const transformedOutput = transformedData.flatMap((item) => {
        const date = Object.keys(item)[0];
        const reading = item[date].reading;
        const time = item[date].time;

        const firstEntry = {
          date,
          ...reading,
        };

        const secondEntry = {
          ...time,
          date: `${date}_time`,
        };

        return [firstEntry, secondEntry];
      });

      return transformedOutput;
    },
  },
};
