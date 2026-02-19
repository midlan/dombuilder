/*
 * dom2url instruction set and compression utilities.
 *
 * Instruction format (one per line):
 *   E tag        — create element, push onto stack
 *   A name value — set attribute on current element (\n = newline, \\ = backslash in value)
 *   T text       — append text node to current element (\n = newline, \\ = backslash)
 *   ^            — pop stack, append completed element to parent
 */

// === Instruction executor ===

const SVG_NS = 'http://www.w3.org/2000/svg';

function executeInstructions(text, target) {
    const stack = [target];
    const lines = text.split('\n');

    for (const line of lines) {
        if (line === '') continue;

        if (line === '^') {
            if (stack.length > 1) {
                const el = stack.pop();
                stack[stack.length - 1].appendChild(el);
            }
            continue;
        }

        const op = line[0];
        const rest = line.substring(2);

        switch (op) {
            case 'E': {
                const parent = stack[stack.length - 1];
                const inSVG = parent.namespaceURI === SVG_NS;
                const el = (inSVG || rest === 'svg')
                    ? document.createElementNS(SVG_NS, rest)
                    : document.createElement(rest);
                stack.push(el);
                break;
            }
            case 'A': {
                const i = rest.indexOf(' ');
                const name = rest.substring(0, i);
                const value = rest.substring(i + 1).replace(/\\(.)/g, (_, c) => c === 'n' ? '\n' : c);
                stack[stack.length - 1].setAttribute(name, value);
                break;
            }
            case 'T': {
                const decoded = rest.replace(/\\(.)/g, (_, c) => c === 'n' ? '\n' : c);
                stack[stack.length - 1].appendChild(document.createTextNode(decoded));
                break;
            }
        }
    }
}

// === HTML to instructions ===

function htmlToInstructions(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const lines = [];

    function walk(node) {
        for (const child of node.childNodes) {
            if (child.nodeType === Node.ELEMENT_NODE) {
                lines.push('E ' + (child.namespaceURI === SVG_NS ? child.tagName : child.tagName.toLowerCase()));
                for (const attr of child.attributes) {
                    const attrVal = attr.value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
                    lines.push('A ' + attr.name + ' ' + attrVal);
                }
                walk(child);
                lines.push('^');
            } else if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent;
                if (text !== '') {
                    const escaped = text.replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
                    lines.push('T ' + escaped);
                }
            }
        }
    }

    // Process head (for style/meta tags) then body
    walk(doc.head);
    walk(doc.body);

    return lines.join('\n');
}

// === Compression (deflate-raw via CompressionStream) ===

async function compressText(text) {
    const stream = new Blob([text]).stream().pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function decompressBytes(bytes) {
    const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    return await new Response(stream).text();
}

// === Base64url ===

function base64urlEncode(bytes) {
    let binary = '';
    for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str) {
    str = str.replace(/-/g, '+').replace(/_/g, '/');
    while (str.length % 4) str += '=';
    const binary = atob(str);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return bytes;
}

// === High-level encode/decode ===

async function encodeInstructions(instructionText) {
    const compressed = await compressText(instructionText);
    return base64urlEncode(compressed);
}

async function decodeInstructions(encoded) {
    const bytes = base64urlDecode(encoded);
    return await decompressBytes(bytes);
}
