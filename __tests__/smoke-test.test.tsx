describe('Smoke Test', () => {
  it('should run basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should run async tests', async () => {
    expect.assertions(1);
    
    const promise = Promise.resolve('test');
    const result = await promise;
    
    expect(result).toBe('test');
  });
});