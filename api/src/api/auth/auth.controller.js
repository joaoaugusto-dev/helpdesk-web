export function createAuthController(authService) {
    return {
        login(req, res) {
            res.json(authService.login(req.body ?? {}))
        },

        me(req, res) {
            res.json(authService.profile(req.user))
        }
    }
}
