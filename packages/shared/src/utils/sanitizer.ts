import mongoose from "mongoose";

// HTML/XSS sanitization
export const sanitizeString = (input: string): string => {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: { [key: string]: string } = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char];
    })
    .trim();
};

// MongoDB ObjectId validation
export const sanitizeObjectId = (id: string): string | null => {
  if (!id || typeof id !== 'string') return null;
  
  // Remove any non-hex characters
  const cleaned = id.replace(/[^a-fA-F0-9]/g, '');
  
  // Check if valid ObjectId format
  if (!mongoose.Types.ObjectId.isValid(cleaned)) return null;
  
  return cleaned;
};

// Sanitize object recursively
export const sanitizeObject = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  
  if (typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
};

// Log sanitization (remove newlines/control chars)
export const sanitizeForLog = (input: string): string => {
  if (typeof input !== 'string') return String(input);
  
  return input
    .replace(/[\r\n\t]/g, ' ')
    .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
    .trim();
};