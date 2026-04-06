const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse/lib/pdf-parse");
const ExcelJS = require("exceljs");
const axios = require("axios");
const cors = require("cors");
const bodyParser = require("body-parser");
const { google } = require("googleapis");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));


// ✅ PUT YOUR GROQ API KEY HERE
//const GROQ_API_KEY = "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";


// ensure uploads folder exists
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

const upload = multer({ dest: "uploads/" });



// Google Drive authentication
const auth = new google.auth.GoogleAuth({

    keyFile: "credentials.json",

    scopes: ["https://www.googleapis.com/auth/drive.readonly"],

});

const drive = google.drive({ version: "v3", auth });




// extract folder ID safely
function extractFolderId(link) {

    try {

        return link.split("folders/")[1].split("?")[0];

    }

    catch {

        throw new Error("Invalid Google Drive folder link");

    }

}



// download file list
async function downloadFiles(folderId) {

    try {

        const res = await drive.files.list({

            q: `'${folderId}' in parents and mimeType='application/pdf'`,

            fields: "files(id, name)",

        });

        if (!res.data.files.length)
            throw new Error("No PDF files found");

        return res.data.files;

    }

    catch (error) {

        console.log("Drive error:", error.message);

        throw error;

    }

}



// download file
async function downloadFile(file) {

    try {

        const filePath = path.join("uploads", file.name);

        const dest = fs.createWriteStream(filePath);

        const response = await drive.files.get({

            fileId: file.id,

            alt: "media"

        }, { responseType: "stream" });


        return new Promise((resolve, reject) => {

            response.data
                .pipe(dest)
                .on("finish", () => resolve(filePath))
                .on("error", reject);

        });

    }

    catch (error) {

        console.log("Download error:", error.message);

        throw error;

    }

}




// evaluate assignment using GROQ
async function evaluateAssignment(text, criteria) {

    try {

        const prompt = `

Evaluate this student assignment strictly.

Criteria:
${criteria}

Assignment:
${text.substring(0, 4000)}

Give output exactly in this format:

Marks: number
Feedback: text

`;


        const response = await axios.post(

            "https://api.groq.com/openai/v1/chat/completions",

            {

                model: "llama-3.1-8b-instant",

                messages: [

                    {
                        role: "user",
                        content: prompt
                    }

                ],

                temperature: 0.3

            },

            {

                headers: {

                    "Authorization": `Bearer ${GROQ_API_KEY}`,

                    "Content-Type": "application/json"

                }

            }

        );


        const result =
            response.data.choices[0].message.content;


        const marksMatch =
            result.match(/Marks:\s*(\d+)/i);


        return {

            marks: marksMatch ? marksMatch[1] : "N/A",

            feedback: result

        };

    }

    catch (error) {

        console.log("Groq error:", error.response?.data || error.message);

        throw error;

    }

}





// MAIN ROUTE
app.post("/evaluate-batch",

    upload.single("criteria"),

    async (req, res) => {

        try {

            console.log("Evaluation started");


            const folderId =
                extractFolderId(req.body.link);


            const criteria =
                fs.readFileSync(req.file.path, "utf8");


            const files =
                await downloadFiles(folderId);


            const workbook =
                new ExcelJS.Workbook();


            const sheet =
                workbook.addWorksheet("Results");


            sheet.columns = [

                { header: "File Name", key: "file", width: 30 },

                { header: "Marks", key: "marks", width: 10 },

                { header: "Feedback", key: "feedback", width: 80 }

            ];



            for (const file of files) {

                console.log("Processing:", file.name);


                const filePath =
                    await downloadFile(file);


                const buffer =
                    fs.readFileSync(filePath);


                const pdf =
                    await pdfParse(buffer);


                const evaluation =
                    await evaluateAssignment(pdf.text, criteria);


                sheet.addRow({

                    file: file.name,

                    marks: evaluation.marks,

                    feedback: evaluation.feedback

                });

            }



            const resultPath = "results.xlsx";


            await workbook.xlsx.writeFile(resultPath);


            console.log("Excel created");


            res.download(resultPath);

        }

        catch (error) {

            console.log("FULL ERROR:", error.message);

            res.status(500).send(error.message);

        }

    }

);




// start server
app.listen(3000, () => {

    console.log("Server running at http://localhost:3000");

});