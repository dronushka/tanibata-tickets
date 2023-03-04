import nodemailer from 'nodemailer'

// console.log(process.env.MAIL_HOST, process.env.MAIL_PORT, process.env.MAIL_USER, process.env.MAIL_PASSWORD)
export const emailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: true,
    auth: { 
        user: process.env.MAIL_USER, 
        pass: process.env.MAIL_PASSWORD, 
    }, 
    // debug: true,
    // logger: true
}) 
// console.log(emailTransporter)
export const sendPassword = async (email: string, password: string) => {
    return await emailTransporter.sendMail({
        from: `"Tanibata" <${process.env.MAIL_USER}>`,
        to: email,
        subject: "Танибата. Одноразовый пароль.", // Subject line
        html: `<p>Ваш одноразовый пароль для входа:</p><p><b>${password}</b></p>`
      })
}