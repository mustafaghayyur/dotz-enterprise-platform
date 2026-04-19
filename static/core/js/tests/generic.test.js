import base from '../helpers/base.js';

// Mock the global $A helper to prevent circular dependency issues during tests
jest.mock('../helper.js', () => ({
    base: {}
}));
import $A from '../helper.js';
$A.base = base; 

describe('Generic Helper Library', () => {
    
    test('empty identifies empty vs non-empty values', () => {
        expect(base.empty({})).toBe(true);
        expect(base.empty([])).toBe(true);
        expect(base.empty("")).toBe(true);
        expect(base.empty(null)).toBe(true);
        expect(base.empty(undefined)).toBe(true);
        // Special cases defined in logic
        expect(base.empty(false)).toBe(false);
        expect(base.empty(0)).toBe(false);
        expect(base.empty({ key: 'val' })).toBe(false);
    });

    test('type correctly identifies data types', () => {
        expect(base.type("hello")).toBe('string');
        expect(base.type([])).toBe('list');
        expect(base.type(null)).toBe('null');
        expect(base.type(123)).toBe('number');
        expect(base.type({})).toBe('dictionary');
        expect(base.type(new Date())).toBe('date');
    });

    test('getter retrieves values or returns defaults', () => {
        const obj = { name: 'Dotz', active: true };
        expect(base.getter(obj, 'name')).toBe('Dotz');
        expect(base.getter(obj, 'missing', 'default')).toBe('default');
        expect(base.getter(null, 'any')).toBe(null);
    });

    test('stringify and parse handle data conversion', () => {
        const data = { id: 1 };
        const string = base.stringify(data);
        expect(typeof string).toBe('string');
        expect(base.parse(string)).toEqual(data);
        // Fallback for non-JSON
        expect(base.parse("not-json")).toBe("not-json");
    });

    test('merge combines data correctly', () => {
        const d1 = { a: 1 };
        const d2 = { b: 2 };
        expect(base.merge(d1, d2)).toEqual({ a: 1, b: 2 });
        
        const l1 = [1];
        const l2 = [2];
        expect(base.merge(l1, l2)).toEqual([1, 2]);
    });

    test('capitalizeFirstLetter and lowercaseFirstLetter', () => {
        expect(base.capitalizeFirstLetter('word')).toBe('Word');
        expect(base.lowercaseFirstLetter('Word')).toBe('word');
    });

    test('stringBools converts string representations to booleans', () => {
        expect(base.stringBools('true')).toBe(true);
        expect(base.stringBools('false')).toBe(false);
        expect(base.stringBools('other')).toBe('other');
    });

    test('loopObject processes dictionaries', () => {
        const input = { a: 1, b: 2 };
        const callback = (k, v) => v * 2;
        const result = base.loopObject(input, callback);
        expect(result).toEqual({ a: 2, b: 4 });
    });

    test('isPrimitive identifies primitives', () => {
        expect(base.isPrimitive("str")).toBe(true);
        expect(base.isPrimitive(123)).toBe(true);
        expect(base.isPrimitive(true)).toBe(true);
        expect(base.isPrimitive({})).toBe(false);
        expect(base.isPrimitive([])).toBe(false);
    });
});
