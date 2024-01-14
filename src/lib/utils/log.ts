import { config } from "config/config"

export const log = {
    debug(message: any) {
        if(config.logging.verbosity > 1) return
        console.log(`[LOG] ${JSON.stringify(message, null, 2)}`)
    }
}
