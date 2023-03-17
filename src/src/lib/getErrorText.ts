export default function getErrorText (symbol: string) {
   
    const errors: Record<string, string> = {
        "overbooking": "Похоже кто-то успел купить эти билеты. Попробуйте выбрать другое количество.",
        "tickets_pending": "К сожалению выбранные места уже заняты, попробуйте выбрать другие.",
        "json_parse_error": "Не удалось считать код",
        "validation_fail": "Ошибка валидации",
        "order_not_found": "Заказ не найден",
        "order_qr_signature_error": "Подпись неверна",
    }

    return errors.hasOwnProperty(symbol) ? errors[symbol] : "Упс. Что-то пошло не так..."
}