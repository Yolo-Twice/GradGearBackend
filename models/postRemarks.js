import mongoose from "mongoose";
const feedbackModel = new mongoose.Schema({
    remark : {
        type : String , 
        required : true ,
        trim : true 
    },

    createdAt : {
        type : Date,
        default : Date.now
    }
})

export default mongoose.model('postRemarks',feedbackModel)