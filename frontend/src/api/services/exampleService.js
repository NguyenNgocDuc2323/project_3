import BaseService from '../baseService'

class ExampleService extends BaseService {
  constructor() {
    super('/example')
  }
}

export default new ExampleService()

