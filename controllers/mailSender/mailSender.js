const nodemailer = require('nodemailer');

const secrets = require('../../localconfigs/secrets');
const MAIL_PASSWORD = secrets.MAIL_PASSWORD;
const MAIL_USER = secrets.MAIL_USER;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASSWORD
  }
});

let mailOptions = {
  from: "chavesguido94@gmail.com",
  to: undefined,
  subject: undefined,
  text: "Por favor ingresá en el siguiente enlace para activar tu usuario:",
  html: undefined
}

const setMailOptions = (to, token) => {
  const urlConfirmacion = `http://localhost:3000/confirmation/${token}`;
  const html = `<h1><b>S.U.M.AR.</b></h1><h2>Enlace de verificación único generado por el sistema:</h2><br><br><a href="${urlConfirmacion}">Click aqui para activar tu cuenta!</a><p>Este email fue generado automáticamente por el sistema. Por favor no responderlo.</p>`
  const subject = "Confirmación nueva cuenta S.U.M.AR.";
  mailOptions.to = to;
  mailOptions.html = html;
  mailOptions.subject = subject;
  return mailOptions;
};

const setMailOptionsPassword = (to, codigo) => {
  const html = `<h1><b>S.U.M.AR.</b></h1><h2>Código único generado por el sistema:</h2><br><br><h3>${codigo}</h3><p>Este email fue generado automáticamente por el sistema. Por favor no responderlo.</p>`
  const subject = "Olvido de constraseña."
  mailOptions.to = to;
  mailOptions.html = html;
  mailOptions.subject = subject;
  return mailOptions;
};

const sendEmail = (transporter, mailOptions) => {
  transporter.sendMail(mailOptions, (error, response) => {
    if(error)
      console.log(error)
    else
      console.log("Mensaje enviado: ",response.message);
  });
};

module.exports = {
  transporter,
  setMailOptions,
  setMailOptionsPassword,
  sendEmail
}
