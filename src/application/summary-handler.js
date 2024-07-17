const fs = require('fs')
/**
 * This function is used to get the last summary of the check run.
 */
async function getLastSummary(handler) {
  return await handler.getLastSummary()
}

/**
 * @param {*} lastCheckRun {CheckRun}
 * @param {*} handler {CheckRunHandler}
 * @param {*} conclusion {string}
 * @param {*} newSummaryPath {string}
 * @returns {Promise<void>} Resolves when the summary is updated.
 */
async function updateSummary(
  lastCheckRun,
  handler,
  conclusion,
  newSummaryPath
) {
  if (!['success', 'failure'].includes(conclusion))
    throw new Error(
      `Invalid conclusion: ${conclusion} input. Conclusion must be either 'success' or 'failure'.`
    )

  let finalSummary = false

  if (conclusion === 'success') {
    // If the status is success, we need to get the new summary.
    const newSummary = fs.readFileSync(newSummaryPath, 'utf8')

    // We need to merge the summaries from the last check run and the new summary.
    finalSummary = await handler.getMergedSummaries(
      newSummary,
      lastCheckRun.summary === 'Pending...' ? null : lastCheckRun.summary
    )
  } else if (conclusion === 'failure') {
    finalSummary = lastCheckRun.summary
  }

  if (!finalSummary) {
    throw new Error('Error getting the final summary.')
  }

  await handler.updateCheckRun(
    finalSummary,
    null, // when we set conclusion to failure, we don't need to update the status
    conclusion,
    lastCheckRun.id
  )
}

/**
 * This function is used to create or update the check run.
 * @param {Object} lastCheckRun - The last check run
 * @param {Object} handler - The check run handler
 * @param {string} status - The status of the check run
 * @returns {Promise<void>} Resolves when the check run is created or updated.
 */
async function upsertSummary(lastCheckRun, handler, status) {
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
  getLastSummary,
  updateSummary,
  upsertSummary
}
