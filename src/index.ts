import * as yargs from 'yargs'
import { PluginsServerConfig } from './types'
import { startPluginsServer } from './server'
import { makePiscina } from './worker/piscina'
import { defaultConfig, configHelp } from './config'

type Argv = {
    config: string
    disableWeb: boolean
    webPort: number
    webHostname: string
    concurrency: number
}

let app: any = yargs
    .wrap(yargs.terminalWidth())
    .scriptName('posthog-plugins')
    .option('config', { alias: 'c', describe: 'Config options JSON.', type: 'string' })

for (const [key, value] of Object.entries(defaultConfig)) {
    app = app.option(key.toLowerCase().replaceAll('_', '-'), {
        describe: `${configHelp[key] || key} [${value}]`,
        type: typeof value,
    })
}

app = app.help().command({
    command: ['start', '$0'],
    describe: 'start the server',
    handler: ({ config, ...otherArgs }: Argv) => {
        const parsedConfig: Record<string, any> = config ? JSON.parse(config) : {}
        for (const [key, value] of Object.entries(otherArgs)) {
            if (typeof value !== 'undefined') {
                const newKey = key
                    .replace(/(?:^|\.?)([A-Z])/g, (x, y) => '_' + y.toUpperCase())
                    .replace(/^_/, '')
                    .toUpperCase()
                if (newKey in defaultConfig) {
                    parsedConfig[newKey] = value
                }
            }
        }
        startPluginsServer(parsedConfig as PluginsServerConfig, makePiscina)
    },
}).argv
