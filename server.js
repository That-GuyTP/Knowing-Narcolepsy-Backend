const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.static("public"));
app.use(express.static("public/images"));
app.use(express.json());
app.use(cors());
const Joi = require("joi");
const multer = require("multer");
const mongoose = require("mongoose");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({storage : storage });

//Declare Mongoose variable and connect to MongoDB
mongoose
    .connect("mongodb+srv://hdrive250:qFXZEwXCQL8HNVG5@cluster0.hitk9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("Error. Couldn't connect to MongoDB. Reason: ", error);
    });

const ssSchema = new mongoose.Schema({
    first_name:String,
    last_name:String,
    img_name:String,
    narc_details:Array,
    date_diagnosed:Number, 
    type_of_narcolepsy:Number || "",
    user_text:String,
    state:String,
    city:String
});
const Story = mongoose.model("Story", ssSchema);

//Send index.html on page load.
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.hmtl");
});

//Set and get API
app.get("/api/success-stories", async(req, res)=>{
    // console.log("Sending stories:", stories); DEBUG
    const stories = Story = await Story.find(); // Find stories and send them through the response.
    res.send(stories);
});

app.get("/api/success-stories", async (req, res) => {
    const story = await Story.findOne({ _id: id});
    res.send(story);
});

app.post("/api/success-stories", upload.single("img"), async(req, res) => {
    // console.log("Request body:", req.body); // ****** DEBUG **********
    // console.log("Request file:", req.file); // ****** DEBUG **********
    const result = validateStory(req.body);
    
    //Check for error
    if(result.error) {
        res.status(400).send(result.error.details[0].message);
        console.log("Error validating Story", result.error.details[0].message);
        return;
    }
    console.log("Successfully validated story");
    
    //Making A Story Object
    const story = new Story({
        first_name:req.body.firstName,
        last_name: req.body.lastName,
        img_name: req.file ? req.body.filename : "",
        narc_details: [
            {
                date_diagnosed: req.body.diagnosed, 
                type_of_narcolepsy: req.body.type || "",
                user_text: req.body.story
            }
        ],
        city: req.body.city || "",
        state: req.body.state
    });
    if(req.file) {
        story.img_name = req.file.filename;
    }

    //Save newly added stories
    const newStory = await story.save();
    //res.status(200).send(story);
    res.send(newStory);
});

//Validate Inputs
const validateStory = (story) => {
    const schema = Joi.object({
        _id: Joi.number().allow(""),
        firstName: Joi.string().required(),
        lastName: Joi.string().required(),
        diagnosed: Joi.number().required(),
        type: Joi.number().allow(""),
        story: Joi.string().required(),
        img: Joi.any(),
        city: Joi.string().allow(""),
        state: Joi.string().required()
    });
    return schema.validate(story);
};

//Delete a Success Story
app.delete("/api/success-stories/:id", async(req, res) => {
    const story = await Story.findByIdAndDelete(req.params.id);
    res.status(200).send("The story was deleted");

    // ------------ Old Way using Render/Localhost --------------------
    // console.log("Recieved Success Story ID to delete:", req.params.id); // *********** DEBUG ***************
    // const story = stories.find((ss)=>ss._id === parseInt(req.params.id)); // Find the story from our array of success stories using the id provided. Find works like a for each loop. If a house is found, it sets the const story to that value.

    // //If story not found
    // if(!story) {
    //     res.status(404).send("The Success Story with the provided id was not found");
    //     return;
    // }

    // //If story is found
    // const index = stories.indexOf(story); //Remove one item at the index provided in the ArrayList SuccessStories
    // stories.splice(index, 1);
    // res.status(200).send("The Success Story was deleted");
});

//Edit a Success Story
app.put("/api/success-stories/:id", upload.single("img"), async(req, res) => {
    // console.log("Request body:", req.body); // Debugging
    // console.log("Uploaded file:", req.file); // Debugging

    const result = validateStory(req.body);
    if(result.error) {
        console.error("validation errr:", result.error.details[0].message); // DEBUG
        res.status(400).send(result.error.details[0].message);
        return;
    }

    const fieldsToUpdate = {
        first_name:req.body.firstName,
        last_name:req.body.lastName,
        narc_details:[
            {
                date_diagnosed: req.body.diagnosed || "", 
                type_of_narcolepsy: req.body.type || "",
                user_text: req.body.story || "",
            }
        ],
        diagnosed:req.body.diagnosed,
        type:req.body.type,
        text:req.body.story,
        city:req.body.city,
        state:req.body.state,
        img_name:req.file ? req.file.filename : story.img_name
    };
    if (req.file) {
        fieldsToUpdate.img_name = req.file.filename;
    }
    const wentThrough = await Story.updateOne({_id:req.params.id}, fieldsToUpdate); //Find it and update it. First parameter is how to find, second is what to change it with.
    const updatedStory = await Story.findOne({_id:req.params.id}); // Find it and return it.
    res.status(200).send(updatedStory); // Send back the edited story.

    // --------------- Old Way -------------------
    // const story = stories.find((ss)=>ss._id === parseInt(req.params.id));

    // //If story not found
    // if(!story) {
    //     console.error("Story not found"); // DEBUG
    //     res.status(404).send("The Success Story with the provided id was not found");
    //     return;
    // }
    // //Verify new story edits pass JOI requirements
    // const result = validateStory(req.body);
    // if(result.error) {
    //     console.error("validation errr:", result.error.details[0].message); // DEBUG
    //     res.status(400).send(result.error.details[0].message);
    //     return;
    // }

    // //Edit the Story
    // //story._id = stories.length + 1,
    // story.first_name = req.body.firstName || story.first_name,
    // story.last_name = req.body.lastName || story.last_name,
    // //story.narc_details = req.body.details ? JSON.parse(req.body.details) : story.narc_details,
    // story.narc_details = [
    //     {
    //         date_diagnosed: req.body.diagnosed || "", 
    //         type_of_narcolepsy: req.body.type || "",
    //         user_text: req.body.story || "",
    //     }
    // ],
    // story.diagnosed = req.body.diagnosed,
    // story.type = req.body.type,
    // story.story = req.body.story,
    // story.city = req.body.city || story.city,
    // story.state = req.body.state || story.state,
    // story.img_name = req.file ? req.file.filename : story.img_name
    // if(req.file) {
    //     story.img_name = req.file.filename;
    // }
    // console.log("Details Array: ", story.narc_details); // Debugging
    // console.log("SuccessStory Object:", story); // DEBUGGING
    // res.status(200).send({ //Send editted story
    //     ...story,
    //     first_name: story.first_name,
    //     last_name: story.last_name,
    //     details: story.narc_details,
    // });
});

//Localhost port declaration
app.listen(3001, () => {
    console.log("Beginning start of server.js");
});