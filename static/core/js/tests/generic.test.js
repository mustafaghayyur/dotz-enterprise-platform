import generic from '../helpers/generic.js';

// Mock the global $A helper to prevent circular dependency issues during tests
jest.mock('../helper.js', () => ({
    generic: {}
}));
import $A from '../helper.js';
$A.generic = generic; 

describe('Generic Helper Library', () => {
    
    test('isVariableEmpty identifies empty vs non-empty values', () => {
        expect(generic.isVariableEmpty({})).toBe(true);
        expect(generic.isVariableEmpty([])).toBe(true);
        expect(generic.isVariableEmpty("")).toBe(true);
        expect(generic.isVariableEmpty(null)).toBe(true);
        expect(generic.isVariableEmpty(undefined)).toBe(true);
        // Special cases defined in logic
        expect(generic.isVariableEmpty(false)).toBe(false);
        expect(generic.isVariableEmpty(0)).toBe(false);
        expect(generic.isVariableEmpty({ key: 'val' })).toBe(false);
    });

    test('checkVariableType correctly identifies data types', () => {
        expect(generic.checkVariableType("hello")).toBe('string');
        expect(generic.checkVariableType([])).toBe('list');
        expect(generic.checkVariableType(null)).toBe('null');
        expect(generic.checkVariableType(123)).toBe('number');
        expect(generic.checkVariableType({})).toBe('dictionary');
        expect(generic.checkVariableType(new Date())).toBe('date');
    });

    test('getter retrieves values or returns defaults', () => {
        const obj = { name: 'Dotz', active: true };
        expect(generic.getter(obj, 'name')).toBe('Dotz');
        expect(generic.getter(obj, 'missing', 'default')).toBe('default');
        expect(generic.getter(null, 'any')).toBe(null);
    });

    test('stringify and parse handle data conversion', () => {
        const data = { id: 1 };
        const string = generic.stringify(data);
        expect(typeof string).toBe('string');
        expect(generic.parse(string)).toEqual(data);
        // Fallback for non-JSON
        expect(generic.parse("not-json")).toBe("not-json");
    });

    test('merge combines data correctly', () => {
        const d1 = { a: 1 };
        const d2 = { b: 2 };
        expect(generic.merge(d1, d2)).toEqual({ a: 1, b: 2 });
        
        const l1 = [1];
        const l2 = [2];
        expect(generic.merge(l1, l2)).toEqual([1, 2]);
    });

    test('capitalizeFirstLetter and lowercaseFirstLetter', () => {
        expect(generic.capitalizeFirstLetter('word')).toBe('Word');
        expect(generic.lowercaseFirstLetter('Word')).toBe('word');
    });

    test('stringBools converts string representations to booleans', () => {
        expect(generic.stringBools('true')).toBe(true);
        expect(generic.stringBools('false')).toBe(false);
        expect(generic.stringBools('other')).toBe('other');
    });

    test('loopObject processes dictionaries', () => {
        const input = { a: 1, b: 2 };
        const callback = (k, v) => v * 2;
        const result = generic.loopObject(input, callback);
        expect(result).toEqual({ a: 2, b: 4 });
    });

    test('isPrimitiveValue identifies primitives', () => {
        expect(generic.isPrimitiveValue("str")).toBe(true);
        expect(generic.isPrimitiveValue(123)).toBe(true);
        expect(generic.isPrimitiveValue(true)).toBe(true);
        expect(generic.isPrimitiveValue({})).toBe(false);
        expect(generic.isPrimitiveValue([])).toBe(false);
    });
});
