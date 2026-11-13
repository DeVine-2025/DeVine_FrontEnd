import { describe, expect, it } from 'vitest';
import { resolveMockData } from '../src/shared/config/data-mode';

describe('목데이터 환경 분기', () => {
  it.each([
    [true, 'localhost', undefined, true],
    [true, 'localhost', 'api', false],
    [false, 'qa.devine.kr', undefined, true],
    [false, 'qa.devine.kr', 'mock', true],
    [false, 'qa.devine.kr', 'api', false],
    [false, 'devine.kr', undefined, false],
    [false, 'www.devine.kr', 'mock', false],
    [false, 'qa.devine.kr.example.com', 'mock', false],
    [false, '', 'mock', false],
  ])('dev=%s host=%s mode=%s → mock=%s', (dev, host, mode, expected) => {
    expect(resolveMockData(dev, host, mode)).toBe(expected);
  });
});
