import nodemailer from 'nodemailer'

console.log(process.env.MAIL_HOST)
export const emailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    secure: true,
    auth: {
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASSWORD, 
    },
})

export const sendPassword = async (email: string, password: string) => {
    return await emailTransporter.sendMail({
        from: `"Tanibata" <${process.env.MAIL_USER}>`, // sender address
        to: email, // list of receivers
        subject: "Танибата. Одноразовый пароль.", // Subject line
        // text: "Hello world?", // plain text body
        html: `<p>Ваш одноразовый пароль для входа:</p><p><b>${password}</b></p>`, // html body
      })
}