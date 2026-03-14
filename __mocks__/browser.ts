import type { Storage } from 'webextension-polyfill'

type MockLocalStorageArea = Pick<
  Storage.StorageArea,
  'clear' | 'get' | 'getBytesInUse' | 'getKeys' | 'onChanged' | 'remove' | 'set'
>

const onChanged = {
  addListener: jest.fn(),
  hasListener: jest.fn(() => false),
  removeListener: jest.fn(),
} satisfies MockLocalStorageArea['onChanged']

const local = {
  clear: jest.fn(async (): Promise<void> => undefined),
  get: jest.fn(async (): Promise<Record<string, unknown>> => ({})),
  getBytesInUse: jest.fn(async (): Promise<number> => 0),
  getKeys: jest.fn(async (): Promise<string[]> => []),
  onChanged,
  set: jest.fn(async (): Promise<void> => undefined),
  remove: jest.fn(async (): Promise<void> => undefined),
} satisfies MockLocalStorageArea

const mockBrowser = {
  storage: {
    local,
  },
}

export default mockBrowser
