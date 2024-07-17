const core = require('@actions/core')
const { getContext } = require('./infrastructure/gh-core-helper')
const {
  updateSummary,
  getLastSummary,
  upsertSummary
} = require('./application/summary-handler')
const fs = require('fs')

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
async function run() {
  try {
    const { handler, conclusion, status, newSummaryPath, op } = getContext()
    console.error(conclusion)
    const lastCheckRun = await handler.getLastCheckRun()

    switch (op) {
      case 'init-check-run': {
        await upsertSummary(lastCheckRun, handler, 'in_progress')
        break
      }
      case 'complete-check-run': {
        console.error('<<<<<<<............>>>>>>>>>>>>>>')
        await updateSummary(
          lastCheckRun,
          handler,
          status,
          conclusion,
          newSummaryPath
        )
        break
      }
      case 'get-last-summary': {
        const summary = await getLastSummary(handler)
        core.setOutput('last_summary', summary)
        break
      }
      default:
        throw new Error(
          `Invalid operation: ${op} input. Operation must be either 'init-check-run', 'complete-check-run', or 'get-last-summary'.`
        )
    }
    // First, we need to get the last check run.
  } catch (error) {
    // Fail the workflow run if an error occurs
    core.setFailed(error.message)
  }
}

module.exports = {
  run
}
