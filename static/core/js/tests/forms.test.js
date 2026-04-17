/**
 * @jest-environment jsdom
 */
import forms from '../helpers/forms.js';

describe('Forms Helper Library', () => {

    test('escapeHtml prevents XSS by escaping characters', () => {
        const dirty = '<div class="test">Data & "More"</div>';
        const clean = forms.escapeHtml(dirty);
        
        expect(clean).toContain('&lt;div');
        expect(clean).toContain('&quot;More&quot;');
        expect(clean).toContain('&amp;');
        expect(clean).not.toContain('<');
    });

    test('hasDateTimeData identifies date-related keys', () => {
        expect(forms.hasDateTimeData('created_time', 'any')).toBe(true);
        expect(forms.hasDateTimeData('deadline', 'any')).toBe(true);
        expect(forms.hasDateTimeData('update_time', 'any')).toBe(true);
        expect(forms.hasDateTimeData('description', 'any')).toBe(false);
    });

    test('confirm and confirmDeletion (Shell)', () => {
        // Skipping detailed window.confirm mocking for now as requested.
        // These usually require spying on window.confirm
    });

    test('formToDictionary (Shell)', () => {
        // This requires significant DOM mocking for HTMLFormElement and FormData.
        // Skipping as it is high-complexity for a basic scenario.
    });

    test('prefillForms (Shell)', () => {
        // Skipping: requires a mock DOM structure with named input elements.
    });

});
