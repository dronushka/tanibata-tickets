export default function getErrorText (symbol: string) {
    switch (symbol) {
        case "overbooking":
            return "Похоже кто-то успел купить эти билеты. Попробуйте выбрать другое количество."
        case "tickets_pending":
            return "К сожалению выбранные места уже заняты, попробуйте выбрать другие."
        default:
            return "Упс. Что-то пошло не так..."
    }
}