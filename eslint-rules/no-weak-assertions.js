module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow weak test assertions that don\'t verify actual values',
      category: 'Best Practices',
      recommended: true
    },
    messages: {
      weakToBeDefined: 'toBeDefined() is too weak - check actual value instead. Use eslint-disable if intentional.',
      weakToBeUndefined: 'toBeUndefined() is too weak - check actual value instead. Use eslint-disable if intentional.',
      weakToBeTruthy: 'toBeTruthy() is too weak - check actual value instead. Use eslint-disable if intentional.',
      weakToBeFalsy: 'toBeFalsy() is too weak - check actual value instead. Use eslint-disable if intentional.',
      weakNotToBeNull: 'not.toBeNull() is too weak - check actual value instead. Use eslint-disable if intentional.',
      weakEmptyArray: 'toEqual([]) or toStrictEqual([]) is too weak - check array contents if non-empty expected. Use eslint-disable if intentional.',
      weakEmptyObject: 'toEqual({}) or toStrictEqual({}) is too weak - check object properties if non-empty expected. Use eslint-disable if intentional.'
    },
    schema: []
  },

  create(context) {
    const weakMatchers = {
      toBeDefined: 'weakToBeDefined',
      toBeUndefined: 'weakToBeUndefined',
      toBeTruthy: 'weakToBeTruthy',
      toBeFalsy: 'weakToBeFalsy'
    };

    function checkWeakMatchers(node, propertyName) {
      if (weakMatchers[propertyName]) {
        context.report({
          node,
          messageId: weakMatchers[propertyName]
        });
        return true;
      }
      return false;
    }

    function checkNotToBeNull(node, propertyName) {
      if (node.callee.object.type === 'MemberExpression' && 
          node.callee.object.property?.name === 'not' &&
          propertyName === 'toBeNull') {
        context.report({
          node,
          messageId: 'weakNotToBeNull'
        });
        return true;
      }
      return false;
    }

    function checkEmptyCollections(node, propertyName) {
      if (propertyName !== 'toEqual' && propertyName !== 'toStrictEqual') return false;
      if (node.arguments.length === 0) return false;
      
      const arg = node.arguments[0];
      
      // Empty array
      if (arg.type === 'ArrayExpression' && arg.elements.length === 0) {
        context.report({
          node,
          messageId: 'weakEmptyArray'
        });
        return true;
      }
      
      // Empty object
      if (arg.type === 'ObjectExpression' && arg.properties.length === 0) {
        context.report({
          node,
          messageId: 'weakEmptyObject'
        });
        return true;
      }
      
      return false;
    }

    return {
      CallExpression(node) {
        const sourceCode = context.getSourceCode();
        
        // Check for expect() calls
        if (node.callee.type !== 'MemberExpression') return;
        
        const objectText = sourceCode.getText(node.callee.object);
        const propertyName = node.callee.property?.name;
        
        // Check if this is an expect().matcher() pattern
        if (!objectText.startsWith('expect(')) return;
        
        // Check various weak assertion patterns
        if (checkWeakMatchers(node, propertyName)) return;
        if (checkNotToBeNull(node, propertyName)) return;
        checkEmptyCollections(node, propertyName);
      }
    };
  }
};
