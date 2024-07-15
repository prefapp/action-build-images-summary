const { CheckRun } = require('../domain/check-run')

class CheckRunManager {
  #checkRunHelper

  #textHelper

  #workflowName

  #ref

  constructor({ref, workflowName, checkRunHelper, textHelper}) {
    this.#workflowName = workflowName
    
    this.#ref = ref

    this.#checkRunHelper = checkRunHelper

    this.#textHelper = textHelper
  }

  async updateCheckRun(newSummary) {

    const lastSummary = await this.getLastSummary()
    
    const checkRun = new CheckRun({
      lastSummary,
      newSummary,
      name: this.workflowName,
      textHelper: this.#textHelper
    })

    await this.#checkRunHelper.updateCheckRun({
      ref: this.#ref,
      workflowName: this.#workflowName,
      summary: checkRun.summary
    })
    
  }

  async getLastSummary() {

    return this.#checkRunHelper.getLastSummaryFromRef({
      ref: this.#ref,
      workflowName: this.#workflowName
    })

  }

}

module.exports = {

  CheckRunManager

}
