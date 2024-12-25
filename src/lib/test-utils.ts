export class TestResponse {
  constructor(
    private body: any,
    private options: { status?: number; headers?: Headers } = {},
  ) {}

  get status() {
    return this.options.status || 200
  }

  get headers() {
    return this.options.headers || new Headers()
  }

  async json() {
    if (this.status >= 400) {
      return {
        success: false,
        error: this.body.error || this.body || 'Unknown error',
      }
    }

    return {
      success: true,
      ...(this.body.message
        ? { message: this.body.message }
        : { data: this.body }),
    }
  }
}

export const createSuccessResponse = (data: any, status = 200) => {
  return new TestResponse(data, { status })
}

export const createErrorResponse = (error: any, status = 500) => {
  return new TestResponse({ error }, { status })
}
