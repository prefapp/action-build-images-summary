class CheckRunService {
  constructor(checkRunRepository) {
    this.checkRunRepository = checkRunRepository
  }

  async createCheckRun(checkRun) {
    return this.checkRunRepository.createCheckRun(checkRun)
  }

  async getCheckRun(checkRunId) {
    return this.checkRunRepository.getCheckRun(checkRunId)
  }

  async listCheckRunsByRef(ref) {
    return this.checkRunRepository.listCheckRunsByRef(ref)
  }
}
