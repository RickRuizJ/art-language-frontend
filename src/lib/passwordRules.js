export function passwordError(value) {
  return typeof value!=='string'||value.length<8||!value.trim()||new TextEncoder().encode(value).length>72
    ? 'Use at least 8 characters and at most 72 UTF-8 bytes.' : '';
}
