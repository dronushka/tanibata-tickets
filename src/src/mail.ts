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
        subject: "Нян-Фест 2023 | Одноразовый пароль для входа в систему приобритения билетов", // Subject line
        html: `<p>Ваш одноразовый пароль для входа:</p><p><b>${password}</b></p>
            <p>По любым вопросам, связанным с покупкой или возвратом билета вы можете связаться с билетёром фестиваля Чеширой:</p>
            <p><a href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</a></p>
            <p><a href="tel:79054536789">+7 (905) 4536789</a></p>
            <p><a href="https://t.me/anna_cheshira">t.me/anna_cheshira</a></p>
            <p><a href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</a><p>
        `
    })
}