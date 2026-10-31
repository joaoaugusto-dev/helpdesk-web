export function createUsersController(usersService) {
    return {
        list(_req, res) {
            res.json(usersService.list())
        },

        create(req, res) {
            res.status(201).json(usersService.create(req.body ?? {}))
        }
    }
}
