const core = require('@actions/core')
const github = require('@actions/github')
const { CheckRunManager } = require('./application/check-run-manager')
const { GhHelper } = require('./infrastructure/gh-helper')
const { TextHelper } = require('./infrastructure/text-helper')
const fs = require('fs')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const { checkRunManager, conclusion, status } = getCheckRunManager()

    const lastCheckRun = await checkRunManager.getLastCheckRun()

    if(status === 'pending') {

      if(lastCheckRun) {

        checkRunManager.


      }


      await checkRunManager.createOrUpdateCheckRun({
        
      })


    }

    const newSummary = fs.readFileSync(core.getInput("summary_path"), 'utf8')


  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

/**
 * This function is used to get the check run manager
 * It gets the inputs from the core and initializes the github context and octokit client
 *
 * @returns {CheckRunManager} The check run manager
 */
function getCheckRunManager() {
  const { token, checkRunName, ref, conclusion } = getCoreInputs()

  // Init the github context and the octokit client
  const { owner, repo } = github.repo

  const octokit = github.getOctokit(token)

  const ghHelper = new GhHelper({ cli: octokit, core: core })

  return {
    checkRunManager: new CheckRunManager({
      ghHelper,
      textHelper: new TextHelper(),
      owner,
      repo,
      workflowName: checkRunName,
      ref
    }),
    conclusion
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

  const checkRunName = core.getInput('check-run-name', { required: true })

  const ref = core.getInput('ref', { required: true })

  const status = core.getInput('status', { required: true })

  return { token, checkRunName, ref, conclusion, status }
}

module.exports = {
  run
}
