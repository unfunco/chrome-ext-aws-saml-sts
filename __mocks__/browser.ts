import { Storage } from 'webextension-polyfill'

type MockLocalStorageArea = Omit<Storage.LocalStorageArea, 'onChanged'>

const mockBrowser = {
  local: {
    QUOTA_BYTES: 5242880,
    clear: jest.fn(),
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  } as MockLocalStorageArea,
}

export default mockBrowser
