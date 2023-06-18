"use client"

import { Stepper, Text } from "@mantine/core"
import { OrderStage } from "../hooks/useOrder"

const getStepNumber = (step?: OrderStage) => {
    const stages = ["authenticate", "form", "tickets", "payment", "complete"]
    return stages.findIndex(s => s === step)
}

export default function OrderStepper ({stage, isPending, noSeats = false}: {stage: OrderStage, isPending: boolean, noSeats?: boolean}) {
    return (
        <Stepper active={getStepNumber(stage)} breakpoint="sm" allowNextStepsSelect={false}>
                <Stepper.Step allowStepClick={false} label="Авторизация">
                    Введите email, на него будет отправлена ссылка для входа.
                </Stepper.Step>
                <Stepper.Step allowStepClick={false} label="Персональная информация">
                    {!isPending && <>
                        <Text>
                            При оплате со своей банковской карты используй только реальные ФИО — это
                            нужно для успешной идентификации платежа, а ещё для того, чтобы ты смог попасть на фестиваль.
                        </Text>
                        <Text>
                            Также указывай свой актуальный номер телефона, желательно привязанный к банковской карте,
                            с которой производится платеж.
                        </Text>
                        <Text>
                            По возможности следует указать и адрес страницы VK. Опыт прошлых фестивалей подсказывает,
                            что это самый оперативный способ связи со зрителями при необходимости 😉
                        </Text>
                        <Text>
                            Если оплата производится с банковской карты, зарегистрированной на другого человека,
                            ФИО посетителя указывается в поле «ФИО».
                            В поле «Комментарий» в этом случае нужно вписать ФИО владельца банковской карты.
                        </Text>
                        <Text>
                            Мы просим указывать свои реальные данные, потому что этого требуют правила.
                            Чтобы провести мероприятие на площадке Областного Дома Народного Творчества,
                            нужно составить списки зрителей, по которым они будут допускаться на территорию.
                            Чтобы поход на «Нян-фест» не был омрачён досадными случайностями и неразберихой,
                            пожалуйста, следуй нашей инструкции и не забудь взять с собой оригинал паспорта
                            или свидетельства о рождении.
                        </Text>
                    </>}
                </Stepper.Step>
                <Stepper.Step allowStepClick={false} label={noSeats ? "Выбор количества билетов" : "Выбор мест"}>
                    {noSeats ? "Выбор количества билетов" : "Выбор мест"}
                </Stepper.Step>
                <Stepper.Step allowStepClick={false} label="Оплата">
                    Оплата
                </Stepper.Step>
                <Stepper.Completed>
                    Заказ завершен
                </Stepper.Completed>
            </Stepper>
    )
}