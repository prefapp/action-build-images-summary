const github = require('@actions/github')
const { CheckRunHandler } = require('../application/check-run-handler')
const { GhHelper } = require('./gh-helper')
const { TextHelper } = require('./text-helper')

/**
 * This function is used to get the check run manager
 * It gets the inputs from the core and initializes the github context and octokit client
 *
 * @returns {CheckRunManager} The check run manager
 */
function getContext() {
  const { token, checkRunName, ref, conclusion, status, newSummaryPath } =
    getCoreInputs()

  // Init the github context and the octokit client
  const { owner, repo } = github.repo

  const octokit = github.getOctokit(token)

  const ghHelper = new GhHelper({ cli: octokit, core: core })

  return {
    handler: new CheckRunHandler({
      ghHelper,
      textHelper: new TextHelper(),
      owner,
      repo,
      workflowName: checkRunName,
      ref
    }),
    conclusion,
    status,
    newSummaryPath
  }
}

/**
 * This function is used to get the core inputs
 * It gets the inputs from the core
 *
 * @returns {Object} The core inputs
 */

function getCoreInputs() {
  const conclusion = core.getInput('conclusion', { required: true })

  const token = core.getInput('token', { required: true })

  const checkRunName = core.getInput('check_run_name', { required: true })

  const ref = core.getInput('ref', { required: true })

  const status = core.getInput('status', { required: true })

  const newSummaryPath = core.getInput('summary_path', { required: true })

  return { token, checkRunName, ref, conclusion, status, newSummaryPath }
}

module.exports = {
  getContext,
  getCoreInputs
}
