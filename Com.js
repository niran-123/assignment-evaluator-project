const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const axios = require("axios");
const cors = require("cors");
const fs = require("fs");

const app = express();

app.use(cors());

const upload = multer({ dest: "uploads/" });

const GEMINI_API_KEY = "PASTE_YOUR_API_KEY_HERE";


// FRONTEND + BACKEND IN SAME FILE

app.get("/", (req, res) => {

    res.send(`

<html>

<head>

<title>Assignment Evaluator</title>

<style>

body{

background:black;
color:white;
font-family:Arial;
text-align:center;
padding:40px;

}

button{

padding:10px;
margin:10px;

}

pre{

background:#222;
padding:20px;
margin-top:20px;

}

</style>

</head>

<body>

<h1>Student Assignment Evaluator</h1>

<input type="file" id="file">

<br>

<button onclick="upload()">Evaluate</button>

<pre id="result"></pre>

<script>

async function upload(){

const file =
document.getElementById("file").files[0];

const formData = new FormData();

formData.append("file", file);

document.getElementById("result").innerText =
"Evaluating...";

const res =
await fetch("/evaluate", {

method:"POST",
body:formData

});

const data =
await res.json();

document.getElementById("result").innerText =
data.result;

}

</script>

</body>

</html>

`);

});


// PDF + GEMINI EVALUATION

app.post("/evaluate", upload.single("file"), async (req, res) => {

    const buffer =
        fs.readFileSync(req.file.path);

    const pdf =
        await pdfParse(buffer);

    const text =
        pdf.text;

    try {

        const response =
            await axios.post(

                "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=" + GEMINI_API_KEY,

                {

                    contents: [{

                        parts: [{

                            text:
                                "Evaluate this assignment and give score out of 100 with feedback:\\n" + text

                        }]

                    }]

                }

            );

        const result =
            response.data.candidates[0].content.parts[0].text;

        res.json({ result });

    } catch (e) {

        res.json({ result: "Error evaluating assignment" });

    }

});



app.listen(3000, () =>

    console.log("Open http://localhost:3000")

);