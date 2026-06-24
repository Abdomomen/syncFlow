import connectDB from "./db/connectDb";
import Sub from "./db/models/sub";

export const subServices = {
  getSubs: async (id, limit = 10, skip = 0) => {
    await connectDB();
    let subs = await Sub.find({ user: id })
      .sort({ next: 1 })
      .limit(limit)
      .skip(skip);
    return subs;
  },
  addSub: async (id, title, price, next) => {
    await connectDB();
    let sub = {
      title,
      price,
      next,
      user: id,
    };

    let newSub = await Sub.create(sub);

    return newSub;
  },
  editSub: async (id, title, price, next, subId) => {
    await connectDB();
    let sub = await Sub.findOneAndUpdate(
      { _id: subId, user: id },
      { title, price, next },
      { new: true },
    );
    if (!sub) {
      throw new Error("subscription not found");
    }

    return sub;
  },
  deleteSub: async (id, subId) => {
    await connectDB();
    let sub = await Sub.findOneAndDelete({ _id: subId, user: id });
    if (!sub) {
      throw new Error("Subscription Not Found");
    }
    return true;
  },
  searchSubs: async (id, query, limit = 10, skip = 0) => {
    await connectDB();
    const regex = new RegExp(query, "i");
    let subs = await Sub.find({ user: id, title: regex })
      .limit(limit)
      .skip(skip);
    return subs;
  },
};
