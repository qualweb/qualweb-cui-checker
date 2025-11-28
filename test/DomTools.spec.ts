import { expect } from 'chai';
import { getUniqueSelector, getGroupSelectorRelative,isNonAIInput,detectChatbotInputCrossOrigin } from '../src/content/lib/DomTools';
import * as sinon from 'sinon';

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
                    { name: 'data-d', value: 'four' },
            
                ],
                classList: [],
            };

            const sel = getGroupSelectorRelative(el);
        
            // only first three  data-* attributes should be used
            expect(sel).to.equal('div[data-a="one"][data-b="two"][data-c="three"]');
        });


     
    });

        describe('detectChatbotInputCrossOrigin',  () => {
            let originalDocument: Document;
            let originalWindow: Window;

            beforeEach(() => {
                originalDocument = global.document;
                originalWindow = global.window;
            });

            afterEach(() => {
                global.document = originalDocument;
                global.window = originalWindow;
            });

            it('returns null when no inputs are found', async () => {
                const mockDoc = {
                    querySelectorAll: sinon.stub().returns([]),
                };
                const showMessageStub = sinon.stub();
                 global.showMessage = showMessageStub;
                global.document = mockDoc as any;
                
                global.window = { innerWidth: 1024, innerHeight: 768, top: global.window } as any;
               
                const result = await detectChatbotInputCrossOrigin();
                expect(result).to.equal(null);
            });

            it('returns highest scoring visible input from main document', async () => {
                const mockInput = {
                    getBoundingClientRect: () => ({ right: 1000, bottom: 70, top: 0, left: 0, width: 100, height: 70 }),
                    offsetParent: { innerWidth: 1024, innerHeight: 768 },
                    attributes: [{ name: 'placeholder', value: 'Type here' }],
                    ownerDocument: { defaultView: {} },
                };

                const mockDoc = {
                    querySelectorAll: sinon.stub().withArgs('input[type="text"], input:not([type]), textarea, div[contenteditable="true"]').returns([mockInput]),
                    getElementById: sinon.stub(),
                    createElement: sinon.stub(),
                };
                global.document = mockDoc as any;
                global.document = mockDoc as any;
                global.window = { innerWidth: 1024, innerHeight: 768, top: global.window } as any;
        
                const result = await detectChatbotInputCrossOrigin();
                expect(result).to.equal(mockInput);
            });
          

            
               
                
        });

        describe('isNonAIInput', () => {
                it('returns false when element has no attributes', () => {
                    const mockEl = {
                        attributes: [],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(false);
                });

                it('returns true when attribute contains a non-AI keyword', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'placeholder', value: 'email' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(true);
                });

                it('returns true when attribute contains keyword in mixed case', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'data-field', value: 'PASSWORD' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(true);
                });

                it('returns true when keyword appears as a word in multi-word attribute', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'aria-label', value: 'enter your email address' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(true);
                });

                it('returns false when attribute contains substring but not exact keyword match', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'placeholder', value: 'username123' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(false);
                });

                it('returns true when multiple attributes exist and one contains keyword', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'class', value: 'input-field' },
                            { name: 'placeholder', value: 'phone' },
                            { name: 'id', value: 'contact' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(true);
                });

                it('returns false when all attributes contain no non-AI keywords', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'placeholder', value: 'type your message' },
                            { name: 'aria-label', value: 'chat box' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(false);
                });
                    it('returns true when string contains a substring Portuguese non-AI keyword', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'placeholder', value: 'Insira o texto a pesquisar' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(true);
                });

                it('returns true for Portuguese non-AI keyword', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'placeholder', value: 'morada' },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(true);
                });
                

           

                it('returns false when attribute value is null or undefined', () => {
                    const mockEl = {
                        attributes: [
                            { name: 'placeholder', value: null },
                        ],
                    } as any;
                    expect(isNonAIInput(mockEl)).to.equal(false);
                });

            });