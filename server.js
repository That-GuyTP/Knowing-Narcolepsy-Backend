const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.static("public"));
app.use(express.static("public/images"));
app.use(express.json());
app.use(cors());
const Joi = require("joi");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public/images");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({storage : storage });

//Defining Success-Stories json file
const stories = [
    {
        _id: 0,
        first_name: "Susan",
        last_name: "Miller",
        img_name: "Susan.jpg",
        narc_details: [
            {
            date_diagnosed: "2011",
            type_of_narcolepsy: "2",
            user_text: "Susan is a strong advacate of Narcolepsy in her state. She has contributed to many research programs."
            }
        ],
        state: "Dakota",
        city: "Bismarck"
    },
    {
        _id: 1,
        first_name: "Thomas",
        last_name: "Peterson",
        img_name: "Thomas.jpg",
        narc_details: [
            {
            date_diagnosed: "2022",
            type_of_narcolepsy: "2",
            user_text: "Blah blah blah random text here"
            }
        ],
        state: "South Carolina",
        city: "Columbia"
    },
    {
        _id: 2,
        first_name: "James",
        last_name: "Thompson",
        img_name: "James.jpg",
        narc_details: [
            {
                date_diagnosed: "2018",
                type_of_narcolepsy: "1",
                user_text: "James experiences excessive daytime sleepiness and uses medication to manage his symptoms."
            }
        ],
        state: "California",
        city: "Los Angeles"
    },
    {
        _id: 3,
        first_name: "Emily",
        last_name: "Johnson",
        img_name: "Emily.jpg",
        narc_details: [
            {
                date_diagnosed: "2021",
                type_of_narcolepsy: "2",
                user_text: "Emily was diagnosed during college and is now managing her condition with lifestyle changes."
            }
        ],
        state: "Texas",
        city: "Austin"
    },
    {
        _id: 4,
        first_name: "David",
        last_name: "Martinez",
        img_name: "David.jpg",
        narc_details: [
            {
                date_diagnosed: "2019",
                type_of_narcolepsy: "1",
                user_text: "David experiences cataplexy and has found support through a local narcolepsy group."
            }
        ],
        state: "Florida",
        city: "Miami"
    },
    {
        _id: 5,
        first_name: "Olivia",
        last_name: "Parker",
        img_name: "Olivia.jpg",
        narc_details: [
            {
                date_diagnosed: "2024",
                type_of_narcolepsy: "2",
                user_text: "Olivia is learning to balance work and narcolepsy with the help of her healthcare team."
            }
        ],
        state: "New York",
        city: "Albany"
    },
    {
        _id: 6,
        first_name: "Michael",
        last_name: "Anderson",
        img_name: "Michael.jpg",
        narc_details: [
            {
                date_diagnosed: "2004",
                type_of_narcolepsy: "1",
                user_text: "Michael was diagnosed in his late twenties and has been navigating work-life balance with his condition."
            }
        ],
        state: "Ohio",
        city: "Columbus"
    },
    {
        _id: 7,
        first_name: "Sophia",
        last_name: "Lee",
        img_name: "Sophia.jpg",
        narc_details: [
            {
                date_diagnosed: "2010",
                type_of_narcolepsy: "2",
                user_text: "Sophia is adjusting to her recent diagnosis and exploring different treatment options. She loves being a Narcoleptic."
            }
        ],
        state: "Washington",
        city: "Seattle"
    }
];

//Send index.html on page load.
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.hmtl");
});

//Set and get API
app.get("/api/success-stories", (req, res)=>{
    // console.log("Sending stories:", stories);
    res.send(stories);
});

app.post("/api/success-stories", upload.single("img"), (req, res) => {
    try { // ********DEBUG ******** REMOVE AFTER
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
        const story = {
            _id: stories.length + 1,
            first_name: req.body.firstName,
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
        }
        if(req.file) {
            story.img_name = req.file.filename;
        }
        stories.push(story);
        res.status(200).send(story);
    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).send("Internal Server Error");
    }
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
app.delete("/api/success-stories/:id", (req, res) => {
    console.log("Recieved Success Story ID to delete:", req.params.id); // *********** DEBUG ***************
    const story = stories.find((ss)=>ss._id === parseInt(req.params.id)); // Find the story from our array of success stories using the id provided. Find works like a for each loop. If a house is found, it sets the const story to that value.

    //If story not found
    if(!story) {
        res.status(404).send("The Success Story with the provided id was not found");
        return;
    }

    //If story is found
    const index = stories.indexOf(story); //Remove one item at the index provided in the ArrayList SuccessStories
    stories.splice(index, 1);
    res.status(200).send("The Success Story was deleted");
});

//Edit a Success Story
app.put("/api/success-stories/:id", upload.single("img"), (req, res) => {
    console.log("Request body:", req.body); // Debugging
    console.log("Uploaded file:", req.file); // Debugging

    const story = stories.find((ss)=>ss._id === parseInt(req.params.id));

    //If story not found
    if(!story) {
        console.error("Story not found"); // DEBUG
        res.status(404).send("The Success Story with the provided id was not found");
        return;
    }
    //Verify new story edits pass JOI requirements
    const result = validateStory(req.body);
    if(result.error) {
        console.error("validation errr:", result.error.details[0].message); // DEBUG
        res.status(400).send(result.error.details[0].message);
        return;
    }

    //Edit the Story
    //story._id = stories.length + 1,
    story.first_name = req.body.firstName || story.first_name,
    story.last_name = req.body.lastName || story.last_name,
    //story.narc_details = req.body.details ? JSON.parse(req.body.details) : story.narc_details,
    story.narc_details = [
        {
            date_diagnosed: req.body.diagnosed || "", 
            type_of_narcolepsy: req.body.type || "",
            user_text: req.body.story || "",
        }
    ],
    story.diagnosed = req.body.diagnosed,
    story.type = req.body.type,
    story.story = req.body.story,
    story.city = req.body.city || story.city,
    story.state = req.body.state || story.state,
    story.img_name = req.file ? req.file.filename : story.img_name
    if(req.file) {
        story.img_name = req.file.filename;
    }
    console.log("Details Array: ", story.narc_details); // Debugging
    console.log("SuccessStory Object:", story); // DEBUGGING
    res.status(200).send({ //Send editted story
        ...story,
        first_name: story.first_name,
        last_name: story.last_name,
        details: story.narc_details,
    });
});

//Localhost port declaration
app.listen(3001, () => {
    console.log("Beginning start of server.js");
});