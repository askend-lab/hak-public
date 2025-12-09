const { greet, add } = require('../src/hello');

describe('Hello module', () => {
  
  describe('greet', () => {
    it('should greet by name', () => {
      expect(greet('World')).toBe('Hello, World!');
    });

    it('should greet Alex', () => {
      expect(greet('Alex')).toBe('Hello, Alex!');
    });

    it('should throw on empty name', () => {
      expect(() => greet()).toThrow(/Name is required/);
    });
  });

  describe('add', () => {
    it('should add two numbers', () => {
      expect(add(2, 3)).toBe(5);
    });

    it('should handle negatives', () => {
      expect(add(-1, 1)).toBe(0);
    });
  });

});
