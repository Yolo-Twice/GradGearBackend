import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  recommended: {
    type: Number,
    required: true
  },
  minimum: {
    type: Number,
    required: true
  },
  max: {
    type: Number,
    required: true
  },
  justification: {
    type: String,
    required: true
  }
});

const RecommendedBudget = mongoose.model("RecommendedBudget", budgetSchema);

export default RecommendedBudget;
