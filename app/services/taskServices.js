import Task from "./db/models/task";
import connectDB from "./db/connectDb";
import User from "./db/models/user";
export const taskServices = {
  getTasks: async (id, limit = 10, skip = 0) => {
    await connectDB();
    let tasks = await Task.find({ user: id }).limit(limit).skip(skip);

    return tasks;
  },
  addTask: async (id, title, desc) => {
    await connectDB();
    let user = await User.findById(id).select("_id");
    if (!user) {
      throw new Error("User Not Found");
    }
    let task = {
      title,
      desc,
      user: id,
    };
    let newTask = await Task.create(task);

    return newTask;
  },
  editTask: async (id, title, desc, taskId) => {
    await connectDB();

    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, user: id },
      { title, desc },
      { new: true },
    );

    if (!updatedTask) {
      throw new Error("Task not found or unauthorized");
    }

    return updatedTask;
  },

  deleteTask: async (userId, taskId) => {
    await connectDB();
    let task = await Task.findOneAndDelete({ _id: taskId, user: userId });
    if (!task) {
      throw new Error("Task Not Found");
    }

    return true;
  },
  toggleComplete: async (userId, id) => {
    await connectDB();

    let task = await Task.findOne({ _id: id, user: userId });

    if (!task) {
      throw new Error("task not found or unauthorized");
    }
    task.status = !task.status;
    await task.save();
    return task;
  },
  searchTasks: async (userId, query, limit = 10, skip = 0) => {
    await connectDB();
    const regex = new RegExp(query, "i");
    const tasks = await Task.find({
      user:userId,
      $or: [{ title: regex }, { desc: regex }],
    })
      .limit(limit)
      .skip(skip);
    console.log(regex, query);

    console.log(tasks);

    return tasks;
  },
};
