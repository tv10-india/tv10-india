import {defineCliConfig} from 'sanity/cli'
import {projectId, dataset} from './env' // <--- Make sure this says './env'

export default defineCliConfig({ api: { projectId, dataset } })