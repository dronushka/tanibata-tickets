import nodemailer from 'nodemailer'
import { render } from '@react-email/render'
import Authorize from "@/emails/Authorize"
import RefundRequest from "@/emails/RefundRequest"
import Refund from '@/emails/Refund'
import Tickets from '@/emails/Tickets'

export const emailTransporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: process.env.MAIL_PORT === "465",
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD,
    },
    // debug: true,
    // logger: true
})

export async function sendVerificationRequest({ identifier, url }: { identifier: string, url: string }) {
    const result = await emailTransporter.sendMail({
        to: identifier,
        from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
        subject: "Нян-фест 2023 | Одноразовая ссылка для входа в систему приобретения билетов",
        html: render(<Authorize url={url} />),
        text: render(<Authorize url={url} />, { plainText: true })
    })

    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
    }
}

export async function sendRefundRequested(mailTo: string, orderId: number) {
    const result = await emailTransporter.sendMail({
        from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
        to: mailTo,
        subject: "Нян-фест 2023. Запрос на возврат билетов. Номер заказа: " + orderId,
        html: render(<RefundRequest url={`${process.env.NEXTAUTH_URL}/dashboard/orders/${orderId}`} orderId={orderId} />),
        text: render(<RefundRequest url={`${process.env.NEXTAUTH_URL}/dashboard/orders/${orderId}`} orderId={orderId} />,
            { plainText: true })
    })

    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
    }
}

export async function sendRefund(mailTo: string, orderId: number) {
    const result = await emailTransporter.sendMail({
        from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
        to: mailTo,
        subject: "Нян-Фест 2023 | Возврат билетов | Номер заказа: " + orderId,
        html: render(<Refund />),
        text: render(<Refund />, { plainText: true })
    })

    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
    }
}

export async function sendTickets(mailTo: string, orderId: number, ticketPDF: Buffer) {
    const result = await emailTransporter.sendMail({
        from: `"Нян-фест 2023" <${process.env.MAIL_FROM}>`,
        to: mailTo,
        subject: "Нян-Фест 2023 | Билеты на фестиваль", 
        html: render(<Tickets />),
        text: render(<Tickets />, { plainText: true }),
        attachments: [{   
            filename: "tanibata-tickets-" + orderId + ".pdf",
            content: ticketPDF,
            contentType: "application/pdf"
        }],
    })

    const failed = result.rejected.concat(result.pending).filter(Boolean)
    if (failed.length) {
        throw new Error(`Email(s) (${failed.join(", ")}) could not be sent`)
    }
}