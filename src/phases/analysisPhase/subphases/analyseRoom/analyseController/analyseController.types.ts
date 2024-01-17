export { }

declare global {
    type ControllerAnalysisData = {
        assignedBot: string | null
        mode: 'upgrade' | 'reserve' | 'claim'
    }
}
