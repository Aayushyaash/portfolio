import { describe, it, expect } from 'vitest';
import { isEmptyLink, escapeHtml, renderTags, renderProjectLinks } from '../src/js/utils/htmlHelpers.js';

describe('isEmptyLink', () => {
    it('returns true for undefined', () => {
        expect(isEmptyLink(undefined)).toBe(true);
    });

    it('returns true for null', () => {
        expect(isEmptyLink(null)).toBe(true);
    });

    it('returns true for empty string', () => {
        expect(isEmptyLink('')).toBe(true);
    });

    it('returns true for #', () => {
        expect(isEmptyLink('#')).toBe(true);
    });

    it('returns false for valid URL', () => {
        expect(isEmptyLink('https://github.com/user/repo')).toBe(false);
    });
});

describe('escapeHtml', () => {
    it('returns empty string for null', () => {
        expect(escapeHtml(null)).toBe('');
    });

    it('returns empty string for undefined', () => {
        expect(escapeHtml(undefined)).toBe('');
    });

    it('escapes < and >', () => {
        expect(escapeHtml('<script>')).toBe('&lt;script&gt;');
    });

    it('escapes &', () => {
        expect(escapeHtml('a & b')).toBe('a &amp; b');
    });

    it('escapes double quotes', () => {
        expect(escapeHtml('"test"')).toBe('&quot;test&quot;');
    });

    it('escapes single quotes', () => {
        expect(escapeHtml("'test'")).toBe('&#039;test&#039;');
    });

    it('returns plain text unchanged', () => {
        expect(escapeHtml('hello world')).toBe('hello world');
    });
});

describe('renderTags', () => {
    it('returns empty string for null', () => {
        expect(renderTags(null)).toBe('');
    });

    it('returns empty string for empty array', () => {
        expect(renderTags([])).toBe('');
    });

    it('renders single tag', () => {
        const result = renderTags(['JavaScript']);
        expect(result).toContain('JavaScript');
        expect(result).toContain('font-mono');
    });

    it('renders multiple tags', () => {
        const result = renderTags(['JS', 'TS']);
        expect(result).toContain('JS');
        expect(result).toContain('TS');
    });

    it('uses sm size by default', () => {
        const result = renderTags(['test']);
        expect(result).toContain('text-xs');
    });

    it('uses xs size when specified', () => {
        const result = renderTags(['test'], 'xs');
        expect(result).toContain('text-[10px]');
    });

    it('escapes HTML in tags', () => {
        const result = renderTags(['<script>']);
        expect(result).toContain('&lt;script&gt;');
        expect(result).not.toContain('<script>');
    });
});

describe('renderProjectLinks', () => {
    it('returns empty string for no links', () => {
        expect(renderProjectLinks(null, null)).toBe('');
    });

    it('returns empty string for # links', () => {
        expect(renderProjectLinks('#', '#')).toBe('');
    });

    it('renders GitHub link', () => {
        const result = renderProjectLinks('https://github.com/user/repo', null);
        expect(result).toContain('github.com');
        expect(result).toContain('fa-github');
    });

    it('renders external link', () => {
        const result = renderProjectLinks(null, 'https://example.com');
        expect(result).toContain('example.com');
        expect(result).toContain('external-link-alt');
    });

    it('renders both links', () => {
        const result = renderProjectLinks('https://github.com/user/repo', 'https://example.com');
        expect(result).toContain('github.com');
        expect(result).toContain('example.com');
    });

    it('escapes URLs', () => {
        const result = renderProjectLinks('https://example.com/<script>', null);
        expect(result).toContain('&lt;script&gt;');
        expect(result).not.toContain('<script>');
    });
});
