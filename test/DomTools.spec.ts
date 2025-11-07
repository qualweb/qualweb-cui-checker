import { expect } from 'chai';
import { getUniqueSelector, getGroupSelectorRelative } from '../src/content/lib/DomTools';

declare const global: any;

// Ensure Node constant exists in the test environment
global.Node = global.Node || { ELEMENT_NODE: 1 };

    type MockEl = {
        nodeType: number;
        nodeName: string;
        id?: string;
        previousElementSibling?: MockEl | null;
        parentNode?: MockEl | null;
    };

    function createElement(name: string, opts: Partial<MockEl> = {}): MockEl {
        return {
            nodeType: 1,
            nodeName: name.toUpperCase(),
            previousElementSibling: null,
            parentNode: null,
            ...opts,
        };
    }

    describe('getUniqueSelector', () => {
        it('returns null for falsy element', () => {
            expect(getUniqueSelector(null as any)).to.equal(null);
        });

        it('builds selector with nth-of-type and parent when no ids present', () => {
            // parent div
            const parent = createElement('div');
            // siblings: first span
            const span1 = createElement('span', { parentNode: parent });
            // target: second span, previousElementSibling points to span1
            const span2 = createElement('span', { previousElementSibling: span1, parentNode: parent });

            const sel = getUniqueSelector(span2 as any);
            expect(sel).to.equal('div:nth-of-type(1) > span:nth-of-type(2)');
        });

        it('stops at ancestor with id and includes it in selector', () => {
            const grand = createElement('section', { id: 'main' } as any);
            const parent = createElement('div', { parentNode: grand });
            const span1 = createElement('span', { parentNode: parent });
            const span2 = createElement('span', { previousElementSibling: span1, parentNode: parent });

            const sel = getUniqueSelector(span2 as any);
            expect(sel).to.equal('section#main > div:nth-of-type(1) > span:nth-of-type(2)');
        });
    });

    describe('getGroupSelectorRelative', () => {
        it('returns null for falsy element', () => {
            expect(getGroupSelectorRelative(null as any)).to.equal(null);
        });

        it('returns custom tag lowercased for custom elements', () => {
            const el: any = {
                tagName: 'MY-CUSTOM-WIDGET',
                attributes: [],
                classList: [],
            };
            expect(getGroupSelectorRelative(el)).to.equal('my-custom-widget');
        });

        it('builds selector with data-* attributes including numeric shorthand and preserves order', () => {
            const el: any = {
                tagName: 'DIV',
                // Object.values will iterate array order
                attributes: [
                    { name: 'data-role', value: 'main' }, // non-numeric -> [data-role="main"]
                    { name: 'data-id', value: '12345' },  // numeric -> [data-id]
                ],
                classList: [],
            };

            const sel = getGroupSelectorRelative(el);
            expect(sel).to.equal('div[data-role="main"][data-id]');
        });

        it('falls back to class selectors when no data attributes were added and filters framework classes', () => {
            const el: any = {
                tagName: 'SPAN',
                attributes: [], // no data-* attributes
                classList: ['btn', 'mt-4', 'custom-class'],
            };

            const sel = getGroupSelectorRelative(el);
            // 'mt-4' is considered a framework class and should be skipped
            expect(sel).to.equal('span.btn.custom-class');
        });

        it('limits to two data attributes when many are present', () => {
            const el: any = {
                tagName: 'DIV',
                attributes: [
                    { name: 'data-a', value: 'one' },
                    { name: 'data-b', value: 'two' },
                    { name: 'data-c', value: 'three' },
                ],
                classList: [],
            };

            const sel = getGroupSelectorRelative(el);
        
            // only first two data-* attributes should be used
            expect(sel).to.equal('div[data-a="one"][data-b="two"]');
        });
    });
