const nodemailer = require('nodemailer');
const config = require('config');

const email = process.env.No_REPLY_EMAIL;
const password = process.env.NO_REPLY_PASSWORD;

const smtpTransport = nodemailer.createTransport({
	service:'Gmail',
	auth: {
		user: email,
		pass: password
	}
});

const sendWelcomeEmail = (email, name) => {
	const data = {
		to: email,
		subject: 'Thanks for joining in!',
		text: `${name} Welcome to the Task Manager app. You have signed up successfully.`
	};
	
	smtpTransport.sendMail(data);
}

module.exports = {
	sendWelcomeEmail
}

