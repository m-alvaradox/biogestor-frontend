import { FileSizePipe } from './file-size';

describe('FileSizePipe', () => {
  const pipe = new FileSizePipe();

  it('should keep small sizes in bytes', () => {
    expect(pipe.transform(0)).toBe('0 B');
    expect(pipe.transform(512)).toBe('512 B');
  });

  it('should convert to the largest fitting unit', () => {
    expect(pipe.transform(1536)).toBe('1.5 KB');
    expect(pipe.transform(5 * 1024 ** 2)).toBe('5.0 MB');
    expect(pipe.transform(2.4 * 1024 ** 3)).toBe('2.4 GB');
    expect(pipe.transform(3 * 1024 ** 5)).toBe('3072.0 TB');
  });

  it('should show a dash when the size is unknown', () => {
    expect(pipe.transform(null)).toBe('—');
    expect(pipe.transform(undefined)).toBe('—');
  });
});
