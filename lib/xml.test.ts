import { describe, it, expect } from 'vitest'
import { stripInvalidXmlChars, xmlEscape } from '@/lib/xml'

describe('stripInvalidXmlChars', () => {
  it('keeps normal ASCII characters', () => {
    expect(stripInvalidXmlChars('Hello World')).toBe('Hello World')
  })

  it('keeps Unicode characters', () => {
    expect(stripInvalidXmlChars('नमस्ते مرحبا 你好')).toBe('नमस्ते مرحبا 你好')
  })

  it('keeps tab character (0x09)', () => {
    expect(stripInvalidXmlChars('hello\tworld')).toBe('hello\tworld')
  })

  it('keeps newline character (0x0A)', () => {
    expect(stripInvalidXmlChars('hello\nworld')).toBe('hello\nworld')
  })

  it('keeps carriage return character (0x0D)', () => {
    expect(stripInvalidXmlChars('hello\rworld')).toBe('hello\rworld')
  })

  it('removes null character (0x00)', () => {
    expect(stripInvalidXmlChars('hello\x00world')).toBe('helloworld')
  })

  it('removes C0 control characters (0x01-0x08)', () => {
    let str = ''
    for (let i = 1; i <= 8; i++) {
      str += `hello${String.fromCharCode(i)}world`
    }
    expect(stripInvalidXmlChars(str)).not.toContain('\x01')
    expect(stripInvalidXmlChars(str)).not.toContain('\x08')
  })

  it('removes C0 control characters (0x0B-0x0C)', () => {
    const str = 'hello\x0bworld\x0ctest'
    expect(stripInvalidXmlChars(str)).toBe('helloworldtest')
  })

  it('removes C0 control characters (0x0E-0x1F)', () => {
    let str = ''
    for (let i = 0x0e; i <= 0x1f; i++) {
      str += `hello${String.fromCharCode(i)}world`
    }
    const result = stripInvalidXmlChars(str)
    expect(result).not.toContain('\x0e')
    expect(result).not.toContain('\x1f')
  })

  it('removes DEL character (0x7F)', () => {
    expect(stripInvalidXmlChars('hello\x7fworld')).toBe('helloworld')
  })

  it('handles empty string', () => {
    expect(stripInvalidXmlChars('')).toBe('')
  })

  it('handles string with only control characters', () => {
    const str = '\x01\x02\x03'
    expect(stripInvalidXmlChars(str)).toBe('')
  })

  it('handles mixed valid and invalid characters', () => {
    const str = 'hello\x00world\x01test'
    expect(stripInvalidXmlChars(str)).toBe('helloworldtest')
  })

  it('preserves multi-byte UTF-8 characters', () => {
    const str = '🎉 celebration'
    expect(stripInvalidXmlChars(str)).toBe('🎉 celebration')
  })

  it('handles CRLF sequence', () => {
    expect(stripInvalidXmlChars('line1\r\nline2')).toBe('line1\r\nline2')
  })

  it('removes multiple consecutive control characters', () => {
    expect(stripInvalidXmlChars('hello\x00\x01\x02world')).toBe('helloworld')
  })
})

describe('xmlEscape', () => {
  it('escapes ampersand', () => {
    expect(xmlEscape('rock & roll')).toBe('rock &amp; roll')
  })

  it('escapes less-than', () => {
    expect(xmlEscape('5 < 10')).toBe('5 &lt; 10')
  })

  it('escapes greater-than', () => {
    expect(xmlEscape('10 > 5')).toBe('10 &gt; 5')
  })

  it('escapes double quote', () => {
    expect(xmlEscape('say "hello"')).toBe('say &quot;hello&quot;')
  })

  it('escapes single quote', () => {
    expect(xmlEscape("it's fine")).toBe('it&apos;s fine')
  })

  it('escapes ampersand first to avoid double-escaping', () => {
    // If & is not escaped first, < would become &lt;, and the & from that
    // would be escaped to &amp;lt; which is wrong
    expect(xmlEscape('&<')).toBe('&amp;&lt;')
  })

  it('handles all special characters together', () => {
    expect(xmlEscape('&<>"\'')).toBe('&amp;&lt;&gt;&quot;&apos;')
  })

  it('does not escape normal text', () => {
    expect(xmlEscape('hello world')).toBe('hello world')
  })

  it('handles empty string', () => {
    expect(xmlEscape('')).toBe('')
  })

  it('combines with stripInvalidXmlChars (removes control chars)', () => {
    const str = 'hello\x00world'
    expect(xmlEscape(str)).toBe('helloworld')
  })

  it('escapes entities in control-char-stripped text', () => {
    const str = 'hello\x00<world>'
    expect(xmlEscape(str)).toBe('hello&lt;world&gt;')
  })

  it('handles real-world news headline with special chars', () => {
    const headline = 'Breaking: "India" & Pakistan < tensions & > expectations'
    expect(xmlEscape(headline)).toBe(
      'Breaking: &quot;India&quot; &amp; Pakistan &lt; tensions &amp; &gt; expectations',
    )
  })

  it('preserves spaces and punctuation', () => {
    expect(xmlEscape('Hello, World!')).toBe('Hello, World!')
  })

  it('handles numeric entities correctly', () => {
    // Make sure we're not escaping already-escaped entities
    const str = '5 &#x00E9; test' // This should NOT be double-escaped
    expect(xmlEscape(str)).toBe('5 &amp;#x00E9; test')
  })

  it('handles URLs with query parameters', () => {
    const url = 'https://example.com?a=1&b=2'
    expect(xmlEscape(url)).toBe('https://example.com?a=1&amp;b=2')
  })

  it('handles multiple consecutive special characters', () => {
    expect(xmlEscape('<<<&&&>>>')).toBe('&lt;&lt;&lt;&amp;&amp;&amp;&gt;&gt;&gt;')
  })
})
