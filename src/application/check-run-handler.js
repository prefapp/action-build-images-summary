const { CheckRun } = require('../domain/check-run')

/**
 * This class is used to manage the check run, and it's responsible for updating the check run.
 * Following the single responsibility principle and the separation of concerns, documented in the
 * Hexagonal Architecture, this class is responsible for managing the check run.
 * It uses the GhHelper to get the last summary and update the check run
 */
class CheckRunHandler {
  //Helper objects
  #ghHelper
  #textHelper

  //Attributes
  #owner
  #repo
  #workflowName
  #ref

  constructor({ ghHelper, textHelper, owner, repo, workflowName, ref }) {
    this.#ghHelper = ghHelper
    this.#textHelper = textHelper
    this.#owner = owner
    this.#repo = repo
    this.#workflowName = workflowName
    this.#ref = ref
  }

  /**
   * This method is used to create a new Check Run
   */
  async createCheckRun(summary, status) {
    await this.#ghHelper.createCheckRun({
      owner: this.#owner,
      repo: this.#repo,
      ref: this.#ref,
      name: this.#workflowName,
      summary,
      status
    })
  }

  /**
   * This method is used to get the merged summaries of the check run
   * The summary is a string that contains the builds in yaml format.
   * @param {string} newSummary - The new summary to be merged
   * @returns {string} The merged summary with the builds in yaml format,
   * merged from the last summary and the new summary.
   */
  async getMergedSummaries(newSummary, lastSummary) {
    console.info(
      `Updating check run for ref: ${this.#ref} and workflow: ${this.#workflowName}`
    )

    const checkRun = new CheckRun({
      lastSummary,
      newSummary,
      name: this.workflowName,
      textHelper: this.#textHelper
    })

    return checkRun.summary
  }

  /**
   * This method is used to get the merged summaries of the check run
   * The summary is a string that contains the builds in yaml format.
   * @param {string} newSummary - The new summary to be merged
   * @returns {string} The merged summary with the builds in yaml format,
   * merged from the last summary and the new summary.
   */
  async getLastSummary() {
    console.info(
      `Get check run for ref: ${this.#ref} and workflow: ${this.#workflowName}`
    )

    const { summary } = await this.getLastCheckRun()

    const checkRun = new CheckRun({
      summary,
      newSummary: null,
      name: this.workflowName,
      textHelper: this.#textHelper
    })

    return checkRun.lastSummary
  }

  /**
   * This method is used to get the last summary of the check run
   * It uses the GhHelper to get the last summary
   * @returns {string} The last summary of the check run
   */
  async getLastCheckRun() {
    return await this.#ghHelper.getCheckRunFromRef({
      owner: this.#owner,
      repo: this.#repo,
      ref: this.#ref,
      workflowName: this.#workflowName
    })
  }

  /**
   * This method is used to update the check run
   * It uses the GhHelper to update the check run
   * @param {string} summary - The summary to be updated
   */
  async updateCheckRun(summary, status, conclusion, id) {
    console.log('CONCLUSION', conclusion)

    const inputs = {
      owner: this.#owner,
      repo: this.#repo,
      ref: this.#ref,
      name: this.#workflowName,
      summary,
      status: status || false,
      conclusion: conclusion || false,
      id
    }

    await this.#ghHelper.updateCheckRun(inputs)
  }
}

module.exports = {
  CheckRunHandler
}
