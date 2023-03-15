import nodemailer from 'nodemailer'

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

export async function sendVerificationRequest({ identifier, url }: { identifier: string, url: string}) {
    const result = await emailTransporter.sendMail({
      to: identifier,
      from: `"Tanibata" <${process.env.MAIL_USER}>`,
      subject: "Нян-Фест 2023 | Одноразовая ссылка для входа в систему приобритения билетов",
      html: `<p>>> <a href="${url}" target="_blank">Вход в систему покупки билетов</a> <<</p>
      <p>По любым вопросам, связанным с покупкой или возвратом билета вы можете связаться с билетёром фестиваля Чеширой:</p>
      <p><a href="mailto:tanibatafest@yandex.ru">tanibatafest@yandex.ru</a></p>
      <p><a href="tel:79054536789">+7 (905) 4536789</a></p>
      <p><a href="https://t.me/anna_cheshira">t.me/anna_cheshira</a></p>
      <p><a href="https://vk.com/cheshira_rnd">vk.com/cheshira_rnd</a><p>
  `
    })

    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
      throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
    }
  }