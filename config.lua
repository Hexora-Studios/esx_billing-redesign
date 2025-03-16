Config = {}
Config.Locale = GetConvar('esx:locale', 'en')


Config.EnableDiscordLogs = false -- true / false

Config.Webhooks = {
    General = "DISCORD_WEBHOOK",
    Jobs = {
        police = "DISCORD_WEBHOOK",
        mechanic = "DISCORD_WEBHOOK",
    }
}