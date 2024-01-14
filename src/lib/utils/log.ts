export const log = {
    debug(message: any) {
        console.log(`[LOG] ${JSON.stringify(message, null, 2)}`)
    }
}
