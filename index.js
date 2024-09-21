const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();
var nodemailer = require("nodemailer");

//middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://shabuj-global-reg.web.app",
      "https://registration.studyuk.today",
    ],
    credentials: true,
  })
);
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
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

    app.get("/registrations", async (req, res) => {
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

    app.post(`/registrations`, async (req, res) => {
      const registration = req.body;
      const result = await registrations.insertOne(registration);
      res.send(result);
    });

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
    app.post("/sendMail", async (req, res) => {
      const mail = req.body.mail;
      const name = req.body.name;
      const to = req.body.to;
      const subject = req.body.subject;
      console.log(mail, to, subject);
      var nodemailer = require("nodemailer");

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL_USER}`,
          pass: `${process.env.EMAIL_PASS}`,
        },
      });

      var mailOptions = {
        from: "shabujglobaleducation24@gmail.com",
        to: to,
        subject: subject,
        html: `<div>
                        <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
                            <div style="background-color: #0073e6; color: #ffffff; padding: 20px; text-align: center;">
                                <h1 style="margin: 0;">Shabuj Global Education</h1>
                            </div>
                            <div style="padding: 20px;">
                        <p style="font-size: 16px; color: #333333;">Hello, ${name}</p>
                        <p style="font-size: 16px; color: #333333;">${mail}</p>
                    
                         </div>
                            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #888888;">
                                <p style="font-size: 14px; margin: 0;">© 2024 Shabuj Global Education. All rights reserved.</p>
                                <p style="font-size: 14px; margin: 0;">759, Delvista Fuljhuri(Lift-5)
                    Satmosjid Road, Dhanmondi, Dhaka-1207</p>
                    </div>
    </div>
            </div>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(500).send({ error: "Failed to send email" });
        } else {
          console.log("Email sent: " + info.response);
          return res.send({ message: "Email sent successfully" });
        }
      });
    });
    app.post("/sendMails", async (req, res) => {
      const mail = req?.body?.mail;
      const firstName = mail.firstName;
      const lastName = mail.lastName;
      const mobileNo = mail.mobileNo;
      const email = mail.email;
      const academic = mail.academic;
      const country = mail.country;
      const university = mail.university;
      const course = mail.course;
      const name = req.body.name;
      const to = req.body.to;
      const subject = req.body.subject;
      console.log(mail, to, subject);
      var nodemailer = require("nodemailer");

      var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: `${process.env.EMAIL_USER}`,
          pass: `${process.env.EMAIL_PASS}`,
        },
      });

      var mailOptions = {
        from: "shabujglobaleducation24@gmail.com",
        to: to,
        subject: subject,
        html: `
                <div>
                    <div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); overflow: hidden;">
                        <div style="background-color: #0073e6; color: #ffffff; padding: 20px; text-align: center;">
                            <h1 style="margin: 0;">Shabuj Global Education</h1>
                        </div>
                        <div style="padding: 20px;">
                            <p style="font-size: 16px; color: #333333;">Hello, ${name}</p>
                            <p style="font-size: 16px; color: #333333;">You have a meeting with ${
                              firstName + " " + lastName
                            }</p>
                            <p style="font-size: 16px; color: #333333;">Phone no: ${mobileNo}</p>
                            <p style="font-size: 16px; color: #333333;">Email: ${email}</p>
                            <p style="font-size: 16px; color: #333333;">Academic qualification: ${academic}</p>
                            <p style="font-size: 16px; color: #333333;">Interested country: ${country}</p>
                            <p style="font-size: 16px; color: #333333;">Interested University: ${university}</p>
                            <p style="font-size: 16px; color: #333333;">Interested course: ${course}</p>
                
                        </div>
                        <div style="background-color: #f4f4f4; padding: 20px; text-align: center; color: #888888;">
                            <p style="font-size: 14px; margin: 0;">© 2024 Shabuj Global Education. All rights reserved.</p>
                            <p style="font-size: 14px; margin: 0;">759, Delvista Fuljhuri(Lift-5)
                            Satmosjid Road, Dhanmondi, Dhaka-1207</p>
                        </div>
                    </div>
                </div>`,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(500).send({ error: "Failed to send email" });
        } else {
          console.log("Email sent: " + info.response);
          return res.send({ message: "Email sent successfully" });
        }
      });
    });
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
