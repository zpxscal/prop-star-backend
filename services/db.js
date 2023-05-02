const mongoose = require("mongoose");

module.exports = async function connection() {
  try {
    const connectionOptions = {
      useNewUrlParser: true,
    };
    mongoose.set("strictQuery", false);

    if (process.env.NODE_ENV === "development")
      await mongoose.connect(
        "mongodb://127.0.0.1:27017/eventful",
        connectionOptions
      );
    else await mongoose.connect(process.env.EVENTFUL_DB, connectionOptions);
    console.log("Connected to database.");
  } catch (error) {
    console.log(error, "Could not connect to database.");
  }
};
