import { isValidText } from './string.ts';
import { assertEquals } from 'https://deno.land/std@0.224.0/testing/asserts.ts';

Deno.test('isValidText returns true for valid non-empty strings.', () => {
    assertEquals(isValidText('this is a string'), true);
    assertEquals(isValidText('    test    '), true);
    assertEquals(isValidText('0'), true);
    assertEquals(isValidText('!@#$%^&*()'), true);
});

Deno.test('isValidText returns false for empty or invalid values', () => { 
    assertEquals(isValidText(''), false);
    assertEquals(isValidText('   '), false);
    assertEquals(isValidText(null), false);
    assertEquals(isValidText(undefined), false);
    assertEquals(isValidText(123), false);
    assertEquals(isValidText([]), false);
    assertEquals(isValidText({}), false);
    assertEquals(isValidText(true), false);
    assertEquals(isValidText(false), false);
});