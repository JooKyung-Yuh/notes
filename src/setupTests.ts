import '@testing-library/jest-dom'
import { mockAnimationsApi } from 'jsdom-testing-mocks'

mockAnimationsApi()

const mockIntersectionObserver = jest.fn()
mockIntersectionObserver.mockImplementation((callback) => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

global.IntersectionObserver = mockIntersectionObserver
