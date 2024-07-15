class GhHelper {
  #cli

  #core

  constructor({ cli, core }) {
    this.#cli = cli

    this.#core = core
  }

  async createOrUpdateCheckRun({
    owner,
    repo,
    ref,
    name,
    summary,
    conclusion
  }) {
    console.info(
      `Creating or updating check run for ref: ${ref} and workflow: ${workflowName}`
    )

    const checkRun = await this.getCheckRunFromRef({
      owner,
      repo,
      ref,
      workflowName: name
    })

    if (checkRun) {
      console.info(
        `Check run found for ref: ${ref} and workflow: ${workflowName}`
      )

      await this.updateCheckRunSummary({
        owner,
        repo,
        conclusion,
        summary,
        id: checkRun.id
      })
    } else {
      console.info(
        `Check run not found for ref: ${ref} and workflow: ${workflowName}`
      )

      await this.createCheckRun({ owner, repo, ref, name, summary, conclusion })
    }

    console.info(
      `Check run created or updated for ref: ${ref} and workflow: ${workflowName}`
    )
  }

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

  async createCheckRun({ owner, repo, ref, name, summary, conclusion }) {
    console.info(
      `Creating check run for ref: ${ref} and workflow: ${workflowName}`
    )

    const { data } = await octokit.rest.checks.create({
      output: {
        summary
      },
      head_sha: ref,
      name,
      owner,
      repo,
      conclusion
    })

    console.info(
      `Check run created for ref: ${ref} and workflow: ${workflowName}`
    )

    return data
  }

  async updateCheckRunSummary({ owner, repo, conclusion, summary, id }) {
    console.info(
      `Updating check run for ref: ${ref} and workflow: ${workflowName}`
    )

    await this.#cli.rest.checks.update({
      check_run_id: id,
      output: { summary },
      owner,
      repo,
      conclusion
    })

    console.info(
      `Check run updated for ref: ${ref} and workflow: ${workflowName}`
    )
  }
}

module.exports = {
  GhHelper
}
