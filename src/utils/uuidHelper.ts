
// UUID generator function that creates valid UUIDs
export const generateUUID = (): string => {
  // Implementation following RFC4122 v4 UUID format
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Function to check if a string is a valid UUID v4
export const isValidUUID = (uuid: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

// Function to convert any ID to UUID format if needed
export const ensureValidUUID = (id: string | undefined): string => {
  if (!id || !isValidUUID(id)) {
    return generateUUID();
  }
  return id;
};
