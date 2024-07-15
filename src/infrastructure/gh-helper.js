class GhHelper {
  #cli

  constructor({ cli }) {
    this.#cli = cli
  }

  /**
   * This method is used to get the check run summary for a ref and a workflow
   * @param {string} owner - The owner of the repo
   * @param {string} repo - The name of the repo
   * @param {string} ref - The ref of the commit
   * @param {string} workflowName - The name of the workflow
   * @returns {Object} The check run summary
   */
  async getCheckRunFromRef({ owner, repo, ref, workflowName }) {
    try {
      console.info(
        `Getting check run summary for ref: ${ref} and workflow: ${workflowName}`
      )

      const resp = await this.#cli.request(
        `GET /repos/${owner}/${repo}/commits/${ref}/check-runs`,
        {
          owner,
          repo,
          ref,
          headers: { 'X-GitHub-Api-Version': '2022-11-28' }
        }
      )

      const checkRun = resp.data.check_runs.find(
        check => check.name === workflowName
      )

      if (!checkRun) {
        console.info(
          `Check run not found for ref: ${ref} and workflow: ${workflowName}`
        )

        return false
      } else {
        console.info(
          `Check run found for ref: ${ref} and workflow: ${workflowName}`
        )

        return {
          summary: checkRun.output.summary,
          conclusion: checkRun.conclusion,
          id: checkRun.id
        }
      }
    } catch (e) {
      console.error(e)

      throw new Error(
        `Error getting check run summary for ref: ${ref} and workflow: ${workflowName}`
      )
    }
  }

  /**
   * @param {string} owner The owner of the repo
   * @param {string} repo The name of the repo
   * @param {string} ref The ref of the commit
   * @param {string} name The name of the check run
   * @param {string} summary The summary of the check run
   * @param {string} status  The status, can be 'queued', 'in_progress', or 'completed'
   * @returns
   */
  async createCheckRun({ owner, repo, ref, name, summary, status }) {
    console.info(`Creating check run for ref: ${ref} and workflow: ${name}`)

    const { data } = await this.#cli.rest.checks.create({
      output: {
        summary
      },
      head_sha: ref,
      name,
      owner,
      repo,
      status
    })

    console.info(`Check run created for ref: ${ref} and workflow: ${name}`)

    return data
  }

  /**
   * This method is used to update the check run
   * @param {string} owner - The owner of the repo
   * @param {string} repo - The name of the repo
   * @param {string} ref - The ref of the commit
   * @param {string} conclusion - The conclusion of the check run
   * @param {string} status - The status of the check run
   * @param {string} summary - The summary of the check run
   * @param {string} id - The id of the check run
   */
  async updateCheckRun({ owner, repo, conclusion, status, summary, id }) {
    console.info(`Updating check run for id: ${id}`)

    const inputs = {
      check_run_id: id,
      output: { summary },
      owner,
      repo
    }

    if (conclusion) {
      inputs['conclusion'] = conclusion
    }

    if (status) {
      inputs['status'] = status
    }

    await this.#cli.rest.checks.update(inputs)

    console.info(`Check run updated with id: ${id}`)
  }
}

module.exports = {
  GhHelper
}
