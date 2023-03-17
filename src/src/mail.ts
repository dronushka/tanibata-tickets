import nodemailer from 'nodemailer'

export const emailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
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
      from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
      subject: "Нян-фест 2023 | Одноразовая ссылка для входа в систему приобретения билетов",
      html: `<p><b>>> <a href="${url}" target="_blank">Вход в систему покупки билетов</a> <<</b></p>
      <br />
      <p>По любым вопросам, связанным с покупкой или возвратом билета, можно обратиться к билетёру фестиваля Чешире:</p>
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