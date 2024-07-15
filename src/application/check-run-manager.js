const { CheckRun } = require('../domain/check-run')


/**
 * This class is used to manage the check run, and it's responsible for updating the check run.
 * Following the single responsibility principle and the separation of concerns, documented in the 
 * Hexagonal Architecture, this class is responsible for managing the check run.
 * It uses the GhHelper to get the last summary and update the check run
 */
class CheckRunManager {
  
  //Helper objects
  #ghHelper

  #textHelper

  //Attributes
  #owner
  
  #repo
  
  #workflowName
  
  #ref

  constructor({ghHelper, textHelper, owner, repo, workflowName, ref}) {
    
    this.#owner = owner

    this.#repo = repo
    
    this.#workflowName = workflowName
    
    this.#ref = ref

    this.#ghHelper = ghHelper

    this.#textHelper = textHelper
  }


  /**
   * This method is used to get the merged summaries of the check run
   * The summary is a string that contains the builds in yaml format.
   * @param {string} newSummary - The new summary to be merged
   * @returns {string} The merged summary with the builds in yaml format,
   * merged from the last summary and the new summary.
   */
  async getMergedSummaries(newSummary) {
    console.info(`Updating check run for ref: ${this.#ref} and workflow: ${this.#workflowName}`)

    const lastSummary = await this.#getLastSummary()
    
    const checkRun = new CheckRun({
      lastSummary,
      newSummary,
      name: this.workflowName,
      textHelper: this.#textHelper,
    })

    const mergedSummary = JSON.stringify({ summary: checkRun.summary })

    this.#ghHelper.setOutput('summary', mergedSummary)
    
    return mergedSummary
  }


  /**
   * This method is used to get the last summary of the check run
   * It uses the GhHelper to get the last summary
   * @returns {string} The last summary of the check run
   */
  async #getLastSummary() {
    return await this.#ghHelper.getCheckRunSummaryFromRef({
      owner: this.#owner,
      repo: this.#repo,
      ref: this.#ref,
      workflowName: this.#workflowName,
    })
  }
}

module.exports = {

  CheckRunManager

}
