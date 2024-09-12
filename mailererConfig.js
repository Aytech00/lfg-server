
const nodemailer = require('nodemailer');

// const transporter  = nodemailer.createTransport();

// transporter.sendMail({
//   from: '"Fred Foo" <magicfutureprediction@gmail.com>', // sender address
//   to: "magicfutureprediction@gmail.com", // list of receivers
//   subject: "Hello ✔", // Subject line
//   text: "Hello world?", // plain text body
//   html: "<b>Hello world?</b>", // html body
// })
//   .then(() => console.log('success'))
//   .catch(err => console.log(err))

async function main() {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();

  // create reusable transporter object using the default SMTP transport
  let transporter = nodemailer.createTransport({
    host: "gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'magicfutureprediction', // generated ethereal user
      pass: 'magicisFAKE', // generated ethereal password
    },
  });
  console.log(transporter)

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: '"Fred Foo" <magicfutureprediction@gmail.com>', // sender address
    to: "magicfutureprediction@gmail.com", // list of receivers
    subject: "Hello ✔", // Subject line
    text: "Hello world?", // plain text body
    html: "<b>Hello world?</b>", // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

main().catch(console.error);