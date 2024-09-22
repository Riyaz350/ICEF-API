const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
const sendEmail = require("./controllers/sendEmail");

//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://shabuj-global-reg.web.app",
      "https://registration.studyuk.today",
      "https://registration.studyuk.today/registrations",
      "https://www.shabujglobal.com/iceflondon",
    ],
    credentials: true,
  })
);
// app.use(express.json());
app.use(express.json({ limit: "200mb" }));
app.use(express.urlencoded({ extended: true }));

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const sendMeetingEmail = require("./controllers/sendMeetingEmail");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gx7mkcg.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const registrations = client.db("ICEF").collection("registrations");

const dbConnect = async () => {
  try {
    await client.connect();

    app.get("/", async (req, res) => {
      res.send("Server is running");
    });

    app.get("/registrationsData", async (req, res) => {
      const result = await registrations.find().toArray();
      res.send(result);
    });
    app.get("/registration/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const studentData = registrations.find(filter);
      const result = await studentData.toArray();
      res.send(result);
    });

    app.get("/counsellors/:email", async (req, res) => {
      const query = { cpMail: req.params?.email };
      const result = await registrations.find(query).toArray();
      res.send(result);
    });

    //working on it
    const fs = require("fs");
    const multer = require("multer");
    const path = require("path");

    // Ensure the /files directory exists
    const filesDirectory = path.join(__dirname, "/files");
    if (!fs.existsSync(filesDirectory)) {
      fs.mkdirSync(filesDirectory, { recursive: true });
    }

    // Multer setup for file uploads
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, filesDirectory); // Files directory
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
          null,
          file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
      },
    });

    const upload = multer({
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
      fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif|bmp|webp|heic/;
        const extname = fileTypes.test(
          path.extname(file.originalname).toLowerCase()
        );
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
          return cb(null, true);
        } else {
          cb(
            new Error(
              "Only image formats (jpg, jpeg, png, gif, bmp, webp, heic) are allowed!"
            )
          );
        }
      },
    });

    // Store registration data
    app.post(`/registrations`, upload.single("image"), async (req, res) => {
      try {
        const {
          firstName,
          lastName,
          mobileNo,
          whatsAppNo,
          email,
          password,
          companyDetails,
        } = req.body;

        // Get the uploaded image's filename, or set to null if no image is uploaded
        const imagePath = req.file ? `/files/${req.file.filename}` : null;

        // Safely handle optional fields like companyDetails and image
        const registration = {
          firstName,
          lastName,
          mobileNo,
          whatsAppNo,
          email,
          password,
          companyDetails: {
            companyName: companyDetails?.companyName || null,
            address: companyDetails?.address || null,
            city: companyDetails?.city || null,
            website: companyDetails?.website || null,
            postcode: companyDetails?.postcode || null,
            country: companyDetails?.country || null,
            recruitCountry: companyDetails?.recruitCountry || null,
          },
          image: {
            name: req.file?.filename || null, // Save the filename or set null if no image
            path: imagePath, // Full file path or null
          },
          createdAt: new Date(), // Timestamp
        };

        // Insert registration into the database
        const result = await registrations.insertOne(registration);
        res.status(201).send(result);
      } catch (error) {
        console.error("Error inserting registration:", error.message);
        res.status(500).send({ error: "Failed to register data" });
      }
    });

    //start files api

    // Serve files from the /files directory
    app.get("/file/:filePath", (req, res) => {
      try {
        const filePath = req.params.filePath;
        const fullPath = path.join(__dirname, "/files", filePath);

        // Check if the file exists
        if (fs.existsSync(fullPath)) {
          res.sendFile(fullPath); // Serve the file directly for preview/download
        } else {
          res.status(404).send({ error: "File not found" });
        }
      } catch (error) {
        console.error("Error serving file:", error.message);
        res.status(500).send({ error: "Failed to retrieve the file" });
      }
    });

    //end of files api
    app.patch("/registrationPatchStatus/:_id", async (req, res) => {
      const id = req.params._id;
      const query = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          formData: req.body.formData,
          cpMail: req.body.counsellorMail,
          cpName: req.body.counsellorName,
        },
      };
      const result = await registrations.updateOne(query, updateDoc);
      res.send(result);
    });

    //   nodemailer
    //send mail
    app.post("/sendMail", sendEmail);
    //send meeting email
    app.post("/sendMeetingEmail", sendMeetingEmail);
  } catch (error) {
    console.log(error.name, error.message);
  } finally {
    console.log("Database Connected successfully ✅");

    app.listen(port, () => {
      console.log(`Your port is ${port}`);
    });
  }
};
dbConnect();
