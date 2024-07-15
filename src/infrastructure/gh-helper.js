
class GhHelper {

    #cli

    #core

    constructor({cli, core}) {

        this.#cli = cli
        
        this.#core = core
    }

    async updateCheckRun({ref, workflowName, summary}) {

        console.info(`Updating check run for ref: ${ref} and workflow: ${workflowName}`)

    }

    async setOutput(key, value) {

        console.info(`${this.constructor.name}: Setting output for key: ${key} and value: ${value}`)

        this.#core.setOutput(key, value)

    }

    async getCheckRunSummaryFromRef({owner, repo, ref, workflowName}) {
        try {
            console.info(`Getting check run summary for ref: ${ref} and workflow: ${workflowName}`)
            
            const resp = await this.#cli.request(`GET /repos/${owner}/${repo}/commits/${ref}/check-runs`, {
                owner,
                repo,
                ref,
                headers: {'X-GitHub-Api-Version': '2022-11-28'}
            })


            const checkRun = resp.data.check_runs.find(check => check.name === workflowName)

            if (!checkRun) {

                console.info(`Check run not found for ref: ${ref} and workflow: ${workflowName}`)

                return false

            } else {

                console.info(`Check run found for ref: ${ref} and workflow: ${workflowName}`)

                return checkRun.output.summary

            }
        } catch (e) {
            console.error(e)

            throw new Error(`Error getting check run summary for ref: ${ref} and workflow: ${workflowName}`)
        }
    }
}


module.exports = {

    GhHelper

}
