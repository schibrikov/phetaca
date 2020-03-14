require('jest-fetch-mock').enableMocks();
jest.setMock('ky', require('ky-universal'));
