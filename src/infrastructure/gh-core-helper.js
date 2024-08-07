const github = require('@actions/github')
const { CheckRunHandler } = require('../application/check-run-handler')
const { GhHelper } = require('./gh-helper')
const { TextHelper } = require('./text-helper')
const core = require('@actions/core')

/**
 * This function is used to get the check run manager
 * It gets the inputs from the core and initializes the github context and octokit client
 *
 * @returns {CheckRunManager} The check run manager
 */
function getContext() {
  const { token, checkRunName, ref, conclusion, newSummaryPath, op } =
    getCoreInputs()

  // Init the github context and the octokit client
  const owner = github.context.payload.repository.owner.login
  const repo = github.context.payload.repository.name

  const octokit = github.getOctokit(token)

  const ghHelper = new GhHelper({ cli: octokit })

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
    newSummaryPath,
    op
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

  const op = core.getInput('op', { required: true })

  const checkRunName = core.getInput('check_run_name', { required: true })

  const ref = core.getInput('ref', { required: true })

  const newSummaryPath = core.getInput('summary_path', { required: true })

  return { token, checkRunName, ref, conclusion, newSummaryPath, op }
}

module.exports = {
  getContext,
  getCoreInputs
}
