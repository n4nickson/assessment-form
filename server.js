const express = require("express");
const nodemailer = require("nodemailer");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.post("/submit", async (req, res) => {
  const { name, email, incidents, notes } = req.body;

  // Create PDF
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 400]);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const drawText = (text, y) => page.drawText(text, { x: 50, y, size: 12, font, color: rgb(0, 0, 0) });

  drawText(`Assessment Report`, 350);
  drawText(`Name: ${name}`, 320);
  drawText(`Email: ${email}`, 300);
  drawText(`Incidents: ${incidents}`, 280);
  drawText(`Notes: ${notes}`, 260);

  const pdfBytes = await pdfDoc.save();

  // Save PDF temporarily
  const filename = `Assessment_${Date.now()}.pdf`;
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, pdfBytes);

  // Send Email
  let transporter = nodemailer.createTransport({
    service: "gmail", // or use SMTP credentials
    auth: {
      user: "joshuanicksona@gmail.com",
      pass: "xjdz lnzq cyix kngh"
    }
  });

  await transporter.sendMail({
    from: '"Assessment Bot" <yourgmail@gmail.com>',
    to: email, // or any admin email
    subject: "Your Safety Assessment Report",
    text: "Please find the attached assessment PDF.",
    attachments: [
      {
        filename,
        path: filepath
      }
    ]
  });

  // Clean up
  fs.unlinkSync(filepath);

  res.send("Form submitted and PDF emailed!");
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
