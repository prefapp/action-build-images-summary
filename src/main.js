const core = require('@actions/core')
const { getContext } = require('./infrastructure/gh-core-helper')
const fs = require('fs')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const {
      //Handler, which is an instance of the CheckRunHandler
      //class that is used to manage CRUD ops for the check run
      handler,

      //The conclusion of the check run to be updated
      conclusion,

      //The status of the check run to be updated
      status,

      //The new summary path
      newSummaryPath
    } = getContext()

    // First, we need to get the last check run.
    const lastCheckRun = await handler.getLastCheckRun()

    // If the status is pending, we need to create or update the check run.
    if (status === 'in_progress') {
      await upsertCheckRun(lastCheckRun, handler, status)
    } else if (conclusion === 'success') {
      // If the status is success, we need to get the new summary.
      const newSummary = fs.readFileSync(newSummaryPath, 'utf8')

      // We need to merge the summaries from the last check run and the new summary.
      const mergedSummary = await handler.getMergedSummaries(
        newSummary,
        lastCheckRun.summary === 'Pending...' ? null : lastCheckRun.summary
      )

      // If the conclusion is success, we need to update the check run with the new summary.
      await handler.updateCheckRun(
        mergedSummary,
        null, // when we set conclusion to success, we don't need to update the conclusion
        conclusion,
        lastCheckRun.id
      )

      // If the conclusion is failure, we need to update the check run, but we keep the same summary.
    } else if (conclusion === 'failure') {
      await handler.updateCheckRun(
        lastCheckRun.summary,
        null, // when we set conclusion to failure, we don't need to update the summary
        conclusion,
        lastCheckRun.id
      )
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

/**
 * This function is used to create or update the check run.
 * @param {Object} lastCheckRun - The last check run
 * @param {Object} handler - The check run handler
 * @param {string} status - The status of the check run
 * @returns {Promise<void>} Resolves when the check run is created or updated.
 */
async function upsertCheckRun(lastCheckRun, handler, status) {
  // If the last check run does not exist, we need to create a new check run.
  if (!lastCheckRun) {
    await handler.createCheckRun('Pending...', status)
  } else {
    // If the last check run exists, we need to update the check run,
    // but we keep the same summary.
    await handler.updateCheckRun(
      lastCheckRun.summary,
      status,
      null,
      lastCheckRun.id
    )
  }
}

module.exports = {
  run
}
