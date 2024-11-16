const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.static("public"));
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
        "_id": 0,
        "first_name": "Susan",
        "last_name": "Miller",
        "img_name": "Susan.jpg",
        "narc_details": [
            {
            "date_diagnosed": "2011",
            "type_of_narcolepsy": "2",
            "user_text": "Susan is a strong advacate of Narcolepsy in her state. She has contributed to many research programs."
            }
        ],
        "state": "Dakota",
        "city": "Bismarck"
    },
    {
        "_id": 1,
        "first_name": "Thomas",
        "last_name": "Peterson",
        "img_name": "Thomas.jpg",
        "narc_details": [
            {
            "date_diagnosed": "2022",
            "type_of_narcolepsy": "2",
            "user_text": "Blah blah blah random text here"
            }
        ],
        "state": "South Carolina",
        "city": "Columbia"
    },
    {
        "_id": 2,
        "first_name": "James",
        "last_name": "Thompson",
        "img_name": "James.jpg",
        "narc_details": [
            {
                "date_diagnosed": "2018",
                "type_of_narcolepsy": "1",
                "user_text": "James experiences excessive daytime sleepiness and uses medication to manage his symptoms."
            }
        ],
        "state": "California",
        "city": "Los Angeles"
    },
    {
        "_id": 3,
        "first_name": "Emily",
        "last_name": "Johnson",
        "img_name": "Emily.jpg",
        "narc_details": [
            {
                "date_diagnosed": "2021",
                "type_of_narcolepsy": "2",
                "user_text": "Emily was diagnosed during college and is now managing her condition with lifestyle changes."
            }
        ],
        "state": "Texas",
        "city": "Austin"
    },
    {
        "_id": 4,
        "first_name": "David",
        "last_name": "Martinez",
        "img_name": "David.jpg",
        "narc_details": [
            {
                "date_diagnosed": "2019",
                "type_of_narcolepsy": "1",
                "user_text": "David experiences cataplexy and has found support through a local narcolepsy group."
            }
        ],
        "state": "Florida",
        "city": "Miami"
    },
    {
        "_id": 5,
        "first_name": "Olivia",
        "last_name": "Parker",
        "img_name": "Olivia.jpg",
        "narc_details": [
            {
                "date_diagnosed": "2024",
                "type_of_narcolepsy": "2",
                "user_text": "Olivia is learning to balance work and narcolepsy with the help of her healthcare team."
            }
        ],
        "state": "New York",
        "city": "Albany"
    },
    {
        "_id": 6,
        "first_name": "Michael",
        "last_name": "Anderson",
        "img_name": "Michael.jpg",
        "narc_details": [
            {
                "date_diagnosed": "2004",
                "type_of_narcolepsy": "1",
                "user_text": "Michael was diagnosed in his late twenties and has been navigating work-life balance with his condition."
            }
        ],
        "state": "Ohio",
        "city": "Columbus"
    },
    {
        "_id": 7,
        "first_name": "Sophia",
        "last_name": "Lee",
        "img_name": "Sophia.jpg",
        "narc_details": [
            {
                "date_diagnosed": "2010",
                "type_of_narcolepsy": "2",
                "user_text": "Sophia is adjusting to her recent diagnosis and exploring different treatment options."
            }
        ],
        "state": "Washington",
        "city": "Seattle"
    }
];

//Send index.html on page load.
app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.hmtl");
});

//Set and get API
app.get("/api/success-stories", (req, res)=>{
    
    res.send(stories);
});

app.post("/api/success-stories", upload.single("img"), (req, res) => {
    try { // ********DEBUG ******** REMOVE AFTER
        console.log("Request body:", req.body); // ****** DEBUG **********
        console.log("Request file:", req.file); // ****** DEBUG **********
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
            id: stories.length + 1,
            first_name: req.body.firstName,
            last_name: req.body.lastName,
            narc_details: [
                {
                    date_diagnosed: req.body.diagnosed, 
                    type_of_narcolepsy: req.body.type || "",
                    user_text: req.body.story
                }
    
            ],
            img_name: req.file ? req.body.img_name : "",
            city: req.body.city || "",
            state: req.body.state
        }
        if(req.file) {
            story.img = req.file.filename;
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
        id: Joi.number().allow(""),
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

//Localhost port declaration
app.listen(3001, () => {
    console.log("Beginning start of server.js");
});